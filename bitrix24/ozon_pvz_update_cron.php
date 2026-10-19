<?php
	/*
	 * ozon_pvz_update_cron.php
	 * ------------------------------------------------------------------
	 * Обновление локальной базы пунктов выдачи Ozon (SQLite).
	 *
	 * Сценарий:
	 *   1) проверить доступность хранилища (SQLite3 или PDO SQLite) и
	 *      подготовить схему — до запросов к API, чтобы не тратить время;
	 *   2) POST /v1/delivery-point/list — получить идентификаторы ВСЕХ ПВЗ
	 *      (постранично, пауза между запросами 1 сек по умолчанию);
	 *   3) полученный массив идентификаторов разбить на чанки по 100 и
	 *      запросить POST /v1/delivery-point/info по каждому чанку,
	 *      сразу записывая результат в базу (без накопления в памяти);
	 *   4) удалить из базы ПВЗ, которых больше нет в ответе Ozon.
	 *
	 * Хранилище: SQLite-файл. Поддерживаются два драйвера PHP:
	 *   - расширение SQLite3 (предпочтительно);
	 *   - PDO-драйвер pdo_sqlite (fallback, если SQLite3 не установлен).
	 * Схема и SQL одинаковые, база совместима с обоими драйверами.
	 *
	 * Каждая характеристика ПВЗ — отдельный столбец; вложенные
	 * coordinates/restrictions разложены по полям.
	 *
	 * delivery_point_id уникален в пределах Ozon и используется как
	 * первичный ключ — повторный запуск не создаёт дублей.
	 *
	 * Таблица:
	 *   ozon_delivery_points — карточка ПВЗ (скалярные поля).
	 *
	 * Запуск:
	 *   php ozon_pvz_update_cron.php               # синхронизация с удалением
	 *   php ozon_pvz_update_cron.php --no-delete   # без удаления отсутствующих
	 *
	 * Путь к базе можно переопределить переменной окружения
	 * OZON_PVZ_DB_PATH (рекомендуется держать базу вне webroot).
	 *
	 * Документация:
	 *   https://api-delivery.ozon.ru/v1/delivery-point/list
	 *   https://api-delivery.ozon.ru/v1/delivery-point/info
	 */

	// Тестовая отладка — на время разработки показываем подробности.
	// Перед постановкой в крон строки ниже нужно закомментировать.
	ini_set('display_errors', '1');
	error_reporting(E_ALL);
	set_time_limit(0);

	// Буферизация вывода: отладочные echo не должны ломать header().
	ob_start();

	// Токены Ozon Доставка ($OZON_DELIVERY_CLIENT_ID, $OZON_DELIVERY_TOKEN)
	// и клиент API.
	require_once(__DIR__ . '/ozon_tokens.php');
	require_once(__DIR__ . '/ozon_delivery.class.php');

	/* ------------------------------------------------------------------
	 * Настройки
	 * ------------------------------------------------------------------ */

	// Путь к SQLite-базе. Переопределяется переменной окружения.
	$OZON_PVZ_DB_PATH = getenv('OZON_PVZ_DB_PATH');
	if ($OZON_PVZ_DB_PATH === false || $OZON_PVZ_DB_PATH === '') {
		$OZON_PVZ_DB_PATH = __DIR__ . '/ozon_pvz.sqlite';
	}

	// Размер страницы /v1/delivery-point/list.
	$OZON_LIST_LIMIT = 100;

	// Размер чанка /v1/delivery-point/info (ограничение Ozon — от 1 до 100).
	$OZON_INFO_CHUNK = 100;

	// Пауза между запросами к API, сек.
	$OZON_REQUEST_DELAY = 1;

	// Удалять из базы ПВЗ, которых больше нет в ответе Ozon.
	$OZON_DELETE_MISSING = true;
	if (PHP_SAPI === 'cli' && isset($argv) && is_array($argv) && in_array('--no-delete', $argv, true)) {
		$OZON_DELETE_MISSING = false;
	}

	/* ------------------------------------------------------------------
	 * Вспомогательные функции
	 * ------------------------------------------------------------------ */

	/**
	 * Строковое значение поля либо null.
	 */
	function ozonPvzText($value)
	{
		if ($value === null || is_array($value) || is_object($value)) {
			return null;
		}

		return (string) $value;
	}

	/**
	 * Целочисленное значение поля либо null.
	 */
	function ozonPvzInt($value)
	{
		return is_numeric($value) ? (int) $value : null;
	}

	/**
	 * Значение с плавающей точкой либо null.
	 */
	function ozonPvzFloat($value)
	{
		return is_numeric($value) ? (float) $value : null;
	}

	/**
	 * Булево значение в 0/1 либо null.
	 */
	function ozonPvzBoolInt($value)
	{
		if ($value === null) {
			return null;
		}

		return $value ? 1 : 0;
	}

	/**
	 * Безопасная JSON-сериализация (невалидный UTF-8 → null, а не false).
	 */
	function ozonPvzJson($value)
	{
		$json = json_encode($value, JSON_UNESCAPED_UNICODE);

		return ($json === false) ? null : $json;
	}

	/**
	 * Значение элемента массива либо null.
	 * Замена оператора ?? (null coalescing) — прод работает на PHP 5.6.
	 */
	function ozonPvzGet(array $source, $key)
	{
		return isset($source[$key]) ? $source[$key] : null;
	}

	/**
	 * Список столбцов карточки ПВЗ.
	 */
	function ozonPvzPointColumns()
	{
		return array(
			'delivery_point_id',
			'name',
			'delivery_point_number',
			'type',
			'full_address',
			'latitude',
			'longitude',
			'is_active',
			'storage_period_days',
			'fitting_rooms_count',
			'is_bulky',
			'restriction_min_weight_g',
			'restriction_max_weight_g',
			'restriction_max_width_mm',
			'restriction_max_length_mm',
			'restriction_max_height_mm',
			'restriction_min_price_amount',
			'restriction_min_price_currency',
			'restriction_max_price_amount',
			'restriction_max_price_currency',
			'shipment_method_ids_json',
			'updated_at',
		);
	}

	/**
	 * SQL вставки/обновления карточки ПВЗ (SQLite: INSERT OR REPLACE).
	 */
	function ozonPvzUpsertSql()
	{
		$quoted_columns = array();
		$placeholders   = array();

		foreach (ozonPvzPointColumns() as $column) {
			$quoted_columns[] = '"' . $column . '"';
			$placeholders[]   = ':' . $column;
		}

		return 'INSERT OR REPLACE INTO ozon_delivery_points ('
			. implode(', ', $quoted_columns)
			. ') VALUES (' . implode(', ', $placeholders) . ')';
	}

	/**
	 * Привязать значение к параметру запроса SQLite3 с корректным типом.
	 */
	function ozonPvzBindValue(SQLite3Stmt $stmt, $param, $value)
	{
		if ($value === null) {
			$stmt->bindValue($param, null, SQLITE3_NULL);
		} elseif (is_bool($value)) {
			$stmt->bindValue($param, $value ? 1 : 0, SQLITE3_INTEGER);
		} elseif (is_int($value)) {
			$stmt->bindValue($param, $value, SQLITE3_INTEGER);
		} elseif (is_float($value)) {
			$stmt->bindValue($param, $value, SQLITE3_FLOAT);
		} else {
			$stmt->bindValue($param, (string) $value, SQLITE3_TEXT);
		}
	}

	/**
	 * Сформировать строку для таблицы ozon_delivery_points.
	 */
	function ozonPvzBuildRow($point_id, array $info, array $shipment_method_ids, $updated_at)
	{
		$coordinates  = (isset($info['coordinates']) && is_array($info['coordinates']))
			? $info['coordinates']
			: array();
		$restrictions = (isset($info['restrictions']) && is_array($info['restrictions']))
			? $info['restrictions']
			: array();
		$min_price    = (isset($restrictions['min_price']) && is_array($restrictions['min_price']))
			? $restrictions['min_price']
			: array();
		$max_price    = (isset($restrictions['max_price']) && is_array($restrictions['max_price']))
			? $restrictions['max_price']
			: array();

		// Идентификаторы методов доставки из /v1/delivery-point/list.
		$methods = array();
		foreach ($shipment_method_ids as $method_id) {
			if (is_numeric($method_id)) {
				$methods[(int) $method_id] = true;
			}
		}
		$methods = array_keys($methods);

		return array(
			'delivery_point_id'              => (int) $point_id,
			'name'                           => ozonPvzText(ozonPvzGet($info, 'name')),
			'delivery_point_number'          => ozonPvzText(ozonPvzGet($info, 'delivery_point_number')),
			'type'                           => ozonPvzText(ozonPvzGet($info, 'type')),
			'full_address'                   => ozonPvzText(ozonPvzGet($info, 'full_address')),
			'latitude'                       => ozonPvzFloat(ozonPvzGet($coordinates, 'latitude')),
			'longitude'                      => ozonPvzFloat(ozonPvzGet($coordinates, 'longitude')),
			'is_active'                      => ozonPvzBoolInt(ozonPvzGet($info, 'is_active')),
			'storage_period_days'            => ozonPvzInt(ozonPvzGet($info, 'storage_period_days')),
			'fitting_rooms_count'            => ozonPvzInt(ozonPvzGet($info, 'fitting_rooms_count')),
			'is_bulky'                       => ozonPvzBoolInt(ozonPvzGet($info, 'is_bulky')),
			'restriction_min_weight_g'       => ozonPvzInt(ozonPvzGet($restrictions, 'min_weight_g')),
			'restriction_max_weight_g'       => ozonPvzInt(ozonPvzGet($restrictions, 'max_weight_g')),
			'restriction_max_width_mm'       => ozonPvzInt(ozonPvzGet($restrictions, 'max_width_mm')),
			'restriction_max_length_mm'      => ozonPvzInt(ozonPvzGet($restrictions, 'max_length_mm')),
			'restriction_max_height_mm'      => ozonPvzInt(ozonPvzGet($restrictions, 'max_height_mm')),
			'restriction_min_price_amount'   => ozonPvzText(ozonPvzGet($min_price, 'amount')),
			'restriction_min_price_currency' => ozonPvzText(ozonPvzGet($min_price, 'currency_code')),
			'restriction_max_price_amount'   => ozonPvzText(ozonPvzGet($max_price, 'amount')),
			'restriction_max_price_currency' => ozonPvzText(ozonPvzGet($max_price, 'currency_code')),
			'shipment_method_ids_json'       => ozonPvzJson($methods),
			'updated_at'                     => $updated_at,
		);
	}

	/* ------------------------------------------------------------------
	 * Хранилище SQLite (SQLite3 или PDO SQLite)
	 * ------------------------------------------------------------------ */

	class OzonPvzDb
	{
		/** @var string 'sqlite3' | 'pdo' */
		private $driver = '';
		/** @var SQLite3|PDO */
		private $db = null;
		/** @var string */
		private $path = '';

		/** @var SQLite3Stmt|PDOStatement|null */
		private $upsert_stmt = null;

		/** @var array delivery_point_id => true (что уже есть в базе) */
		private $existing = array();

		private function __construct($driver, $db, $path)
		{
			$this->driver = $driver;
			$this->db     = $db;
			$this->path   = $path;
		}

		/**
		 * Открыть базу подходящим драйвером.
		 *
		 * @return OzonPvzDb|null
		 */
		public static function open($path, &$error)
		{
			$error = '';

			$dir = dirname($path);
			if ($dir !== '' && $dir !== '.' && !is_dir($dir)) {
				@mkdir($dir, 0775, true);
			}

			// 1) Расширение SQLite3 — предпочтительный вариант.
			if (class_exists('SQLite3')) {
				try {
					// На PHP 8 конструктор SQLite3 может бросить исключение.
					$db = @new SQLite3($path, SQLITE3_OPEN_READWRITE | SQLITE3_OPEN_CREATE);
				} catch (Exception $e) {
					$error = 'Не удалось открыть базу SQLite3: ' . $path . ' (' . $e->getMessage() . ')';
					return null;
				}

				if (!($db instanceof SQLite3)) {
					$error = 'Не удалось открыть базу SQLite3: ' . $path;
					return null;
				}

				$db->busyTimeout(10000);

				return new OzonPvzDb('sqlite3', $db, $path);
			}

			// 2) PDO SQLite — fallback, если SQLite3 в PHP не собран.
			if (extension_loaded('pdo_sqlite')) {
				try {
					$db = new PDO('sqlite:' . $path);
					$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
					$db->exec('PRAGMA busy_timeout = 10000');
				} catch (Exception $e) {
					$error = 'Не удалось открыть базу через PDO SQLite: ' . $path . ' (' . $e->getMessage() . ')';
					return null;
				}

				return new OzonPvzDb('pdo', $db, $path);
			}

			$error = 'SQLite недоступен в PHP: нет ни расширения SQLite3, ни PDO-драйвера pdo_sqlite. '
				. 'Включите расширение sqlite3 или pdo_sqlite на хостинге '
				. '(проверка: php -m | grep -i sqlite).';

			return null;
		}

		/** Используемый драйвер: 'sqlite3' или 'pdo'. */
		public function getDriver()
		{
			return $this->driver;
		}

		/** Путь к файлу базы. */
		public function getPath()
		{
			return $this->path;
		}

		/**
		 * Выполнить SQL без параметров (DDL).
		 */
		private function exec($sql, &$error)
		{
			$error = '';

			if ($this->driver === 'sqlite3') {
				if (@$this->db->exec($sql) === false) {
					$error = 'Ошибка выполнения SQL: ' . $this->db->lastErrorMsg();
					return false;
				}
				return true;
			}

			try {
				$this->db->exec($sql);
			} catch (Exception $e) {
				$error = 'Ошибка выполнения SQL: ' . $e->getMessage();
				return false;
			}

			return true;
		}

		/**
		 * Подготовить SQL-запрос (с учётом различий SQLite3 и PDO).
		 *
		 * @return SQLite3Stmt|PDOStatement|false
		 */
		private function prepare($sql, &$error)
		{
			$error = '';

			if ($this->driver === 'sqlite3') {
				$stmt = $this->db->prepare($sql);
				if ($stmt === false) {
					$error = 'Ошибка подготовки SQLite3-запроса: ' . $this->db->lastErrorMsg();
				}
				return $stmt;
			}

			try {
				$stmt = $this->db->prepare($sql);
			} catch (Exception $e) {
				$error = 'Ошибка подготовки SQL-запроса: ' . $e->getMessage();
				return false;
			}

			if ($stmt === false) {
				$error = 'Ошибка подготовки SQL-запроса';
			}

			return $stmt;
		}

		/**
		 * Выполнить подготовленный запрос с именованными параметрами.
		 */
		private function execute($stmt, array $params, &$error)
		{
			$error = '';

			if ($this->driver === 'sqlite3') {
				$stmt->reset();
				$stmt->clear();

				foreach ($params as $name => $value) {
					ozonPvzBindValue($stmt, ':' . $name, $value);
				}

				if ($stmt->execute() === false) {
					$error = 'Ошибка выполнения SQLite3-запроса: ' . $this->db->lastErrorMsg();
					return false;
				}

				$stmt->reset();

				return true;
			}

			try {
				$stmt->execute($params);
			} catch (Exception $e) {
				$error = 'Ошибка выполнения SQL-запроса: ' . $e->getMessage();
				return false;
			}

			return true;
		}

		/**
		 * Создать структуру таблиц, если их ещё нет.
		 */
		public function initSchema(&$error)
		{
			$error = '';

			$statements = array(
				'CREATE TABLE IF NOT EXISTS ozon_delivery_points (
					delivery_point_id INTEGER PRIMARY KEY,
					name TEXT,
					delivery_point_number TEXT,
					type TEXT,
					full_address TEXT,
					latitude REAL,
					longitude REAL,
					is_active INTEGER,
					storage_period_days INTEGER,
					fitting_rooms_count INTEGER,
					is_bulky INTEGER,
					restriction_min_weight_g INTEGER,
					restriction_max_weight_g INTEGER,
					restriction_max_width_mm INTEGER,
					restriction_max_length_mm INTEGER,
					restriction_max_height_mm INTEGER,
					restriction_min_price_amount TEXT,
					restriction_min_price_currency TEXT,
					restriction_max_price_amount TEXT,
					restriction_max_price_currency TEXT,
					shipment_method_ids_json TEXT,
					updated_at TEXT NOT NULL
				)',
				'CREATE INDEX IF NOT EXISTS idx_ozon_dp_number ON ozon_delivery_points(delivery_point_number)',
				'CREATE INDEX IF NOT EXISTS idx_ozon_dp_active ON ozon_delivery_points(is_active)',
				// Выборка ПВЗ по вьюпорту в ozon_pvz.php.
				'CREATE INDEX IF NOT EXISTS idx_ozon_dp_coords ON ozon_delivery_points(latitude, longitude)',
			);

			foreach ($statements as $sql) {
				if (!$this->exec($sql, $error)) {
					$error = 'Ошибка инициализации схемы SQLite: ' . $error;
					return false;
				}
			}

			// Чистим артефакты прежней схемы с расписанием. DROP COLUMN
			// появился только в SQLite 3.35, поэтому ошибку игнорируем:
			// оставшееся поле не мешает работе.
			$legacy_error = '';
			$this->exec('DROP TABLE IF EXISTS ozon_delivery_point_schedule', $legacy_error);
			$this->exec('ALTER TABLE ozon_delivery_points DROP COLUMN schedule_json', $legacy_error);

			return true;
		}

		/**
		 * Начать транзакцию.
		 */
		public function begin(&$error)
		{
			$error = '';

			if ($this->driver === 'sqlite3') {
				if ($this->db->exec('BEGIN IMMEDIATE') === false) {
					$error = 'Не удалось начать транзакцию SQLite3: ' . $this->db->lastErrorMsg();
					return false;
				}
				return true;
			}

			try {
				$this->db->beginTransaction();
			} catch (Exception $e) {
				$error = 'Не удалось начать транзакцию: ' . $e->getMessage();
				return false;
			}

			return true;
		}

		/**
		 * Зафиксировать транзакцию.
		 */
		public function commit(&$error)
		{
			$error = '';

			if ($this->driver === 'sqlite3') {
				if ($this->db->exec('COMMIT') === false) {
					$error = 'Ошибка фиксации транзакции SQLite3: ' . $this->db->lastErrorMsg();
					return false;
				}
				return true;
			}

			try {
				$this->db->commit();
			} catch (Exception $e) {
				$error = 'Ошибка фиксации транзакции: ' . $e->getMessage();
				return false;
			}

			return true;
		}

		/**
		 * Откатить транзакцию.
		 */
		public function rollback()
		{
			if ($this->driver === 'sqlite3') {
				@$this->db->exec('ROLLBACK');
				return;
			}

			try {
				if ($this->db->inTransaction()) {
					$this->db->rollBack();
				}
			} catch (Exception $e) {
				// Транзакция уже завершена — ничего не делаем.
			}
		}

		/**
		 * Загрузить идентификаторы, которые уже есть в базе.
		 */
		public function loadExistingIds()
		{
			$this->existing = array();

			if ($this->driver === 'sqlite3') {
				$res = $this->db->query('SELECT delivery_point_id FROM ozon_delivery_points');
				if ($res !== false) {
					while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
						$this->existing[(int) $row['delivery_point_id']] = true;
					}
					$res->finalize();
				}
				return;
			}

			try {
				$stmt = $this->db->query('SELECT delivery_point_id FROM ozon_delivery_points');
				foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
					$this->existing[(int) $row['delivery_point_id']] = true;
				}
			} catch (Exception $e) {
				// Пустая база — списка нет.
			}
		}

		/**
		 * Подготовить запрос синхронизации карточки ПВЗ.
		 */
		private function prepareSyncStatements(&$error)
		{
			if ($this->upsert_stmt !== null) {
				return true;
			}

			$this->upsert_stmt = $this->prepare(ozonPvzUpsertSql(), $error);

			return $this->upsert_stmt !== false;
		}

		/**
		 * Записать один чанк информации о ПВЗ.
		 *
		 * @param array $points      Ответ delivery_points одного чанка.
		 * @param array $methods_map delivery_point_id => shipment_method_ids.
		 * @param array $stats       Счётчики inserted/updated.
		 */
		public function upsertChunk(array $points, array $methods_map, $updated_at, array &$stats, &$error)
		{
			$error = '';

			if (!$this->prepareSyncStatements($error)) {
				return false;
			}

			foreach ($points as $info) {
				if (!isset($info['delivery_point_id']) || !is_numeric($info['delivery_point_id'])) {
					continue;
				}

				$point_id = (int) $info['delivery_point_id'];
				if ($point_id <= 0) {
					continue;
				}

				$row = ozonPvzBuildRow(
					$point_id,
					$info,
					isset($methods_map[$point_id]) ? $methods_map[$point_id] : array(),
					$updated_at
				);

				if (!$this->execute($this->upsert_stmt, $row, $error)) {
					$error = 'Ошибка записи ПВЗ ' . $point_id . ': ' . $error;
					return false;
				}

				if (isset($this->existing[$point_id])) {
					$stats['updated']++;
				} else {
					$stats['inserted']++;
					$this->existing[$point_id] = true;
				}
			}

			return true;
		}

		/**
		 * Удалить ПВЗ, которых больше нет в списке Ozon.
		 */
		public function deleteMissing(array $list_ids, array &$stats, &$error)
		{
			$error = '';

			$list_map = array();
			foreach ($list_ids as $list_id) {
				$list_map[(int) $list_id] = true;
			}

			$point_delete = $this->prepare(
				'DELETE FROM ozon_delivery_points WHERE delivery_point_id = :id',
				$error
			);
			if ($point_delete === false) {
				return false;
			}

			foreach (array_keys($this->existing) as $point_id) {
				if (isset($list_map[$point_id])) {
					continue;
				}

				if (!$this->execute($point_delete, array('id' => $point_id), $error)) {
					return false;
				}

				unset($this->existing[$point_id]);
				$stats['deleted']++;
			}

			return true;
		}

		/**
		 * Закрыть базу.
		 */
		public function close()
		{
			$this->upsert_stmt = null;

			if ($this->driver === 'sqlite3' && ($this->db instanceof SQLite3)) {
				$this->db->close();
			}

			$this->db = null;
		}
	}

	/* ------------------------------------------------------------------
	 * Сценарий
	 * ------------------------------------------------------------------ */

	$report = array(
		'error'         => false,
		'message'       => '',
		'db_path'       => $OZON_PVZ_DB_PATH,
		'db_driver'     => '',
		'list_count'    => 0,
		'info_count'    => 0,
		'inserted'      => 0,
		'updated'       => 0,
		'deleted'       => 0,
		'failed_chunks' => 0,
		'errors'        => array(),
	);

	/*
	 * Шаг 0. Хранилище проверяем ДО запросов к Ozon: если SQLite
	 * недоступен, нет смысла выгружать десятки тысяч ПВЗ.
	 */
	$db_error = '';
	$db       = OzonPvzDb::open($OZON_PVZ_DB_PATH, $db_error);

	if ($db === null) {
		$report['error']   = true;
		$report['message'] = $db_error;
	} elseif (!$db->initSchema($db_error)) {
		$report['error']   = true;
		$report['message'] = $db_error;
	} else {
		$report['db_driver'] = $db->getDriver();
	}

	// Клиент Ozon Доставка.
	$ozon = new OzonDelivery(array(
		'client_id'     => $OZON_DELIVERY_CLIENT_ID,
		'client_secret' => $OZON_DELIVERY_TOKEN,
		'request_delay' => $OZON_REQUEST_DELAY,
		'debug'         => false,
	));

	if (!$report['error'] && !$ozon->hasCredentials()) {
		$report['error']   = true;
		$report['message'] = 'Токены Ozon Доставка не заполнены: проверьте bitrix24/ozon_tokens.php';
	}

	/*
	 * Шаг 1. Список всех ПВЗ: идентификаторы + shipment_method_ids.
	 */
	$delivery_points = array();
	$list_error      = '';

	if (!$report['error']) {
		$delivery_points = $ozon->listDeliveryPoints($OZON_LIST_LIMIT, $list_error);

		if ($list_error !== '') {
			$report['error']   = true;
			$report['message'] = 'Не удалось получить список ПВЗ: ' . $list_error;
		} elseif (empty($delivery_points)) {
			// Пустой список трактуем как сбой: иначе удалим всю базу.
			$report['error']   = true;
			$report['message'] = 'Ozon вернул пустой список ПВЗ — обновление отменено';
		} else {
			$report['list_count'] = count($delivery_points);
		}
	}

	$list_ids    = array();
	$methods_map = array();

	if (!$report['error']) {
		foreach ($delivery_points as $item) {
			if (!isset($item['delivery_point_id']) || !is_numeric($item['delivery_point_id'])) {
				continue;
			}

			$point_id = (int) $item['delivery_point_id'];
			if ($point_id <= 0) {
				continue;
			}

			$list_ids[$point_id] = true;

			$methods_map[$point_id] = (isset($item['shipment_method_ids']) && is_array($item['shipment_method_ids']))
				? $item['shipment_method_ids']
				: array();
		}

		$list_ids = array_keys($list_ids);

		if (empty($list_ids)) {
			$report['error']   = true;
			$report['message'] = 'В ответе Ozon нет идентификаторов ПВЗ — обновление отменено';
		}
	}

	/*
	 * Шаг 2. Информация о ПВЗ чанками по 100 с паузой между запросами.
	 * Каждый чанк сразу пишем в базу — данные не накапливаются в памяти.
	 */
	if (!$report['error']) {
		$chunks = array_chunk($list_ids, $OZON_INFO_CHUNK);
		$last   = count($chunks) - 1;

		if (!$db->begin($db_error)) {
			$report['error']   = true;
			$report['message'] = $db_error;
		} else {
			$db->loadExistingIds();

			$updated_at = gmdate('Y-m-d H:i:s');
			$synced     = true;

			foreach ($chunks as $index => $chunk) {
				$res = $ozon->infoDeliveryPoints($chunk);

				if ($res['error'] !== '' || $res['http_code'] !== 200) {
					$report['failed_chunks']++;
					$report['errors'][] = array(
						'chunk'     => $index,
						'ids'       => count($chunk),
						'http_code' => $res['http_code'],
						'error'     => $res['error'] !== ''
							? $res['error']
							: 'Ozon API вернул HTTP ' . $res['http_code'],
					);
				} else {
					$report['info_count'] += count($res['delivery_points']);

					if (!$db->upsertChunk($res['delivery_points'], $methods_map, $updated_at, $report, $db_error)) {
						$db->rollback();
						$report['error']   = true;
						$report['message'] = $db_error;
						$synced            = false;
						break;
					}
				}

				if ($index < $last) {
					$ozon->pause();
				}
			}

			if ($synced) {
				if ($report['info_count'] === 0) {
					// Ни одной карточки не получено: удалять базу нельзя.
					$db->rollback();
					$report['error']   = true;
					$report['message'] = 'Ozon не вернул информацию ни по одному ПВЗ — изменения отменены';
				} elseif ($OZON_DELETE_MISSING && !$db->deleteMissing($list_ids, $report, $db_error)) {
					$db->rollback();
					$report['error']   = true;
					$report['message'] = 'Ошибка удаления отсутствующих ПВЗ: ' . $db_error;
				} elseif (!$db->commit($db_error)) {
					$db->rollback();
					$report['error']   = true;
					$report['message'] = $db_error;
				} elseif (!empty($report['errors'])) {
					$report['message'] = 'Обновление выполнено частично: часть чанков вернула ошибку';
				} else {
					$report['message'] = 'Обновление ПВЗ выполнено успешно';
				}
			}
		}
	}

	if ($db instanceof OzonPvzDb) {
		$db->close();
	}

	/* ------------------------------------------------------------------
	 * Вывод результата
	 * ------------------------------------------------------------------ */

	$is_cli = (PHP_SAPI === 'cli');

	if ($is_cli) {
		echo "=== [OZON] Обновление ПВЗ ===\n";
		echo 'База: ' . $report['db_path'] . "\n";
		echo 'Драйвер: ' . ($report['db_driver'] !== '' ? $report['db_driver'] : 'не определён') . "\n";
		echo 'Ошибка: ' . ($report['error'] ? 'да' : 'нет') . "\n";
		echo 'Сообщение: ' . $report['message'] . "\n";
		echo 'ПВЗ в списке: ' . $report['list_count'] . "\n";
		echo 'ПВЗ с информацией: ' . $report['info_count'] . "\n";
		echo 'Добавлено: ' . $report['inserted'] . "\n";
		echo 'Обновлено: ' . $report['updated'] . "\n";
		echo 'Удалено: ' . $report['deleted'] . "\n";
		echo 'Чанков с ошибкой: ' . $report['failed_chunks'] . "\n";

		if (!empty($report['errors'])) {
			echo "Ошибки чанков:\n";
			print_r($report['errors']);
		}
	} else {
		header('Content-type: application/json; charset=utf-8');
		echo json_encode($report, JSON_UNESCAPED_UNICODE);
	}

	ob_end_flush();
?>
