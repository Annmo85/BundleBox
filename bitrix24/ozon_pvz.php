<?php
	/*
	 * ozon_pvz.php
	 * ------------------------------------------------------------------
	 * Список ПВЗ Ozon внутри видимой области карты — из локальной базы.
	 *
	 * Данные в SQLite готовит крон ozon_pvz_update_cron.php
	 * (таблица ozon_delivery_points). Здесь API Ozon НЕ вызывается:
	 * скрипт только читает базу, поэтому отвечает быстро и не тратит
	 * лимиты Ozon.
	 *
	 * Фронтенд присылает POST JSON:
	 *   {
	 *     "viewport": {
	 *       "left_bottom": {"lat": 0, "long": 0},
	 *       "right_top":   {"lat": 0, "long": 0}
	 *     },
	 *     "zoom": 10
	 *   }
	 *
	 * Ответ в общем контракте проекта:
	 *   {
	 *     "error": false,
	 *     "message": "",
	 *     "clusters": [ ... ],       // точки и кластеры
	 *     "http_code": 200,
	 *     "zoom": 10,
	 *     "count": 1234,             // сколько ПВЗ попало во вьюпорт
	 *     "returned": 87,            // сколько элементов в clusters
	 *     "clustered": true,         // применялась ли кластеризация
	 *     "cell_degrees": 0.7,       // размер ячейки кластеризации
	 *     "truncated": false,        // сработал предохранитель выборки
	 *     "db_driver": "sqlite3",
	 *     "db_updated_at": "2026-10-19 12:00:00"
	 *   }
	 *
	 * Элементы clusters:
	 *   - одиночный ПВЗ:
	 *     {"type": "point", "delivery_point_id": 1, "name": "...",
	 *      "address": "...", "lat": 55.7, "long": 37.6, ...}
	 *   - кластер (когда ПВЗ в окне много):
	 *     {"type": "cluster", "lat": 55.7, "long": 37.6, "count": 42,
	 *      "bounds": {"left_bottom": {...}, "right_top": {...}}}
	 *
	 * Кластеризация — сетка по широте/долготе. Размер ячейки зависит от
	 * zoom и удваивается, пока кластеров на экране не станет <= лимита.
	 * При небольшом числе ПВЗ (<= OZON_PVZ_MAX_POINTS_DIRECT) отдаём
	 * точки без кластеризации.
	 *
	 * Путь к базе можно переопределить переменной окружения
	 * OZON_PVZ_DB_PATH (должен совпадать с кроном).
	 */

	// Access-Control headers are received during OPTIONS requests
	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
			header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
			header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

		exit;
	}

	// Ошибки PHP не должны попадать в JSON-ответ.
	ini_set('display_errors', 0);
	error_reporting(E_ALL);

	/* ------------------------------------------------------------------
	 * Настройки
	 * ------------------------------------------------------------------ */

	// Путь к SQLite-базе. Должен совпадать с ozon_pvz_update_cron.php.
	$OZON_PVZ_DB_PATH = getenv('OZON_PVZ_DB_PATH');
	if ($OZON_PVZ_DB_PATH === false || $OZON_PVZ_DB_PATH === '') {
		$OZON_PVZ_DB_PATH = __DIR__ . '/ozon_pvz.sqlite';
	}

	// Если ПВЗ в окне не больше — отдаём их точками, без кластеризации.
	$OZON_PVZ_MAX_POINTS_DIRECT = 100;

	// Целевое максимальное число кластеров на экране.
	$OZON_PVZ_MAX_CLUSTERS = 120;

	// Предохранитель: сколько строк координат максимум читаем за запрос.
	$OZON_PVZ_MAX_SCAN = 50000;

	// Стартовый размер ячейки кластеризации в «тайлах» карты (2^zoom).
	$OZON_PVZ_GRID_FACTOR = 2.0;

	// Минимальный размер ячейки кластеризации, градусы (~50 м).
	$OZON_PVZ_MIN_CELL_DEG = 0.0005;

	$response = array(
		'error'         => false,
		'message'       => '',
		'clusters'      => array(),
		'http_code'     => 0,
		'zoom'          => 0,
		'count'         => 0,
		'returned'      => 0,
		'clustered'     => false,
		'cell_degrees'  => 0,
		'truncated'     => false,
		'db_driver'     => '',
		'db_updated_at' => '',
	);

	/* ------------------------------------------------------------------
	 * Вспомогательные функции
	 * ------------------------------------------------------------------ */

	/**
	 * Значение элемента массива либо null (PHP 5.6: без оператора ??).
	 */
	function ozonPvzGet(array $source, $key)
	{
		return isset($source[$key]) ? $source[$key] : null;
	}

	/**
	 * Число с плавающей точкой либо null.
	 */
	function ozonPvzFloatOrNull($value)
	{
		if (!is_numeric($value)) {
			return null;
		}

		$value = (float) $value;

		return is_finite($value) ? $value : null;
	}

	/**
	 * Долгота в диапазоне [-180, 180].
	 */
	function ozonPvzNormalizeLongitude($longitude)
	{
		$longitude = fmod($longitude + 180.0, 360.0);
		if ($longitude < 0) {
			$longitude += 360.0;
		}

		return $longitude - 180.0;
	}

	/**
	 * Координата угла viewport: lat обязателен, долгота принимается
	 * как long / lng / lon / longitude.
	 */
	function ozonPvzPointLat(array $point)
	{
		return ozonPvzFloatOrNull(ozonPvzGet($point, 'lat'));
	}

	function ozonPvzPointLong(array $point)
	{
		$keys = array('long', 'lng', 'lon', 'longitude');

		foreach ($keys as $key) {
			$value = ozonPvzFloatOrNull(ozonPvzGet($point, $key));
			if ($value !== null) {
				return $value;
			}
		}

		return null;
	}

	/**
	 * Разобрать и нормализовать viewport.
	 *
	 * @return array|null  lat_min, lat_max, lon_left, lon_right, wrap
	 */
	function ozonPvzParseViewport(array $request, &$error)
	{
		$error = '';

		$viewport = (isset($request['viewport']) && is_array($request['viewport']))
			? $request['viewport']
			: null;

		if ($viewport === null) {
			$error = 'Не передан viewport';
			return null;
		}

		$left_bottom = (isset($viewport['left_bottom']) && is_array($viewport['left_bottom']))
			? $viewport['left_bottom']
			: null;
		$right_top = (isset($viewport['right_top']) && is_array($viewport['right_top']))
			? $viewport['right_top']
			: null;

		if ($left_bottom === null || $right_top === null) {
			$error = 'Некорректный viewport: ожидаются left_bottom и right_top';
			return null;
		}

		$lat_1 = ozonPvzPointLat($left_bottom);
		$lat_2 = ozonPvzPointLat($right_top);
		$lon_1 = ozonPvzPointLong($left_bottom);
		$lon_2 = ozonPvzPointLong($right_top);

		if ($lat_1 === null || $lat_2 === null || $lon_1 === null || $lon_2 === null) {
			$error = 'Некорректный viewport: у углов должны быть числовые lat и long';
			return null;
		}

		// Широту ограничиваем полюсами — карта их не выходит.
		$lat_min = max(-90.0, min($lat_1, $lat_2));
		$lat_max = min(90.0, max($lat_1, $lat_2));

		$lon_1 = ozonPvzNormalizeLongitude($lon_1);
		$lon_2 = ozonPvzNormalizeLongitude($lon_2);

		// Если окно пересекает 180-й меридиан, выборка идёт «двумя кусками».
		$wrap = $lon_1 > $lon_2;

		return array(
			'lat_min'   => $lat_min,
			'lat_max'   => $lat_max,
			'lon_left'  => $wrap ? $lon_1 : min($lon_1, $lon_2),
			'lon_right' => $wrap ? $lon_2 : max($lon_1, $lon_2),
			'wrap'      => $wrap,
		);
	}

	/**
	 * SQL-условие выборки ПВЗ по вьюпорту. Значения — уже проверенные
	 * числа, поэтому подставляются через sprintf без параметров.
	 */
	function ozonPvzWhereSql(array $viewport)
	{
		$parts = array(
			'(is_active IS NULL OR is_active = 1)',
			'latitude IS NOT NULL',
			'longitude IS NOT NULL',
			sprintf(
				'latitude BETWEEN %.8F AND %.8F',
				$viewport['lat_min'],
				$viewport['lat_max']
			),
		);

		if ($viewport['wrap']) {
			$parts[] = sprintf(
				'(longitude >= %.8F OR longitude <= %.8F)',
				$viewport['lon_left'],
				$viewport['lon_right']
			);
		} else {
			$parts[] = sprintf(
				'longitude BETWEEN %.8F AND %.8F',
				$viewport['lon_left'],
				$viewport['lon_right']
			);
		}

		return implode(' AND ', $parts);
	}

	/**
	 * Открыть базу только на чтение.
	 *
	 * @return array|null array('driver' => 'sqlite3'|'pdo', 'db' => ...)
	 */
	function ozonPvzOpenDb($path, &$error)
	{
		$error = '';

		if (!is_file($path)) {
			$error = 'База ПВЗ Ozon не найдена: ' . $path
				. '. Запустите крон ozon_pvz_update_cron.php.';
			return null;
		}

		// 1) Расширение SQLite3 — предпочтительный вариант.
		if (class_exists('SQLite3')) {
			$db = null;

			try {
				// На PHP 8 конструктор SQLite3 может бросить исключение.
				$db = @new SQLite3($path, SQLITE3_OPEN_READONLY);
			} catch (Exception $e) {
				$error = 'Не удалось открыть базу SQLite3: ' . $path
					. ' (' . $e->getMessage() . ')';
				return null;
			}

			if ($db instanceof SQLite3) {
				$db->busyTimeout(5000);
				return array('driver' => 'sqlite3', 'db' => $db);
			}

			$error = 'Не удалось открыть базу SQLite3: ' . $path;
			return null;
		}

		// 2) PDO SQLite — fallback, если SQLite3 в PHP не собран.
		if (extension_loaded('pdo_sqlite')) {
			try {
				$db = new PDO('sqlite:' . $path);
				$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				$db->exec('PRAGMA busy_timeout = 5000');
				$db->exec('PRAGMA query_only = ON');
			} catch (Exception $e) {
				$error = 'Не удалось открыть базу через PDO SQLite: ' . $path
					. ' (' . $e->getMessage() . ')';
				return null;
			}

			return array('driver' => 'pdo', 'db' => $db);
		}

		$error = 'SQLite недоступен в PHP: нет ни расширения SQLite3, ни PDO-драйвера pdo_sqlite. '
			. 'Включите расширение sqlite3 или pdo_sqlite на хостинге '
			. '(проверка: php -m | grep -i sqlite).';

		return null;
	}

	/**
	 * Выполнить SELECT без параметров.
	 *
	 * @return array[] Ассоциативные строки; при ошибке пустой массив.
	 */
	function ozonPvzQuery($connection, $sql, &$error)
	{
		$error = '';

		if ($connection['driver'] === 'sqlite3') {
			$result = @$connection['db']->query($sql);

			if ($result === false) {
				$error = 'Ошибка чтения базы SQLite: ' . $connection['db']->lastErrorMsg();
				return array();
			}

			$rows = array();
			while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
				$rows[] = $row;
			}
			$result->finalize();

			return $rows;
		}

		try {
			$stmt = $connection['db']->query($sql);
			if ($stmt === false) {
				$error = 'Ошибка чтения базы SQLite';
				return array();
			}

			return $stmt->fetchAll(PDO::FETCH_ASSOC);
		} catch (Exception $e) {
			$error = 'Ошибка чтения базы SQLite: ' . $e->getMessage();
			return array();
		}
	}

	/**
	 * Список полей карточки ПВЗ для детальной выборки.
	 */
	function ozonPvzDetailColumnsSql()
	{
		return 'delivery_point_id, name, delivery_point_number, type, full_address,'
			. ' latitude, longitude, is_active, storage_period_days, fitting_rooms_count,'
			. ' is_bulky, shipment_method_ids_json';
	}

	/**
	 * Декодировать JSON-поле базы в массив.
	 */
	function ozonPvzDecodeJson($value)
	{
		if (!is_string($value) || $value === '') {
			return array();
		}

		$decoded = json_decode($value, true);

		return is_array($decoded) ? $decoded : array();
	}

	/**
	 * Преобразовать строку базы в элемент ответа «точка».
	 */
	function ozonPvzBuildPointItem(array $row)
	{
		$methods = ozonPvzDecodeJson(ozonPvzGet($row, 'shipment_method_ids_json'));
		$normalized_methods = array();
		foreach ($methods as $method_id) {
			if (is_numeric($method_id)) {
				$normalized_methods[] = (int) $method_id;
			}
		}

		return array(
			'type'                  => 'point',
			'delivery_point_id'     => (int) ozonPvzGet($row, 'delivery_point_id'),
			'name'                  => (string) ozonPvzGet($row, 'name'),
			'delivery_point_number' => (string) ozonPvzGet($row, 'delivery_point_number'),
			'point_type'            => (string) ozonPvzGet($row, 'type'),
			'address'               => (string) ozonPvzGet($row, 'full_address'),
			'lat'                   => (float) ozonPvzGet($row, 'latitude'),
			'long'                  => (float) ozonPvzGet($row, 'longitude'),
			'is_bulky'              => (bool) ozonPvzGet($row, 'is_bulky'),
			'storage_period_days'   => is_numeric(ozonPvzGet($row, 'storage_period_days'))
				? (int) ozonPvzGet($row, 'storage_period_days')
				: null,
			'fitting_rooms_count'   => is_numeric(ozonPvzGet($row, 'fitting_rooms_count'))
				? (int) ozonPvzGet($row, 'fitting_rooms_count')
				: null,
			'shipment_method_ids'   => $normalized_methods,
		);
	}

	/**
	 * Загрузить карточки ПВЗ по идентификаторам.
	 *
	 * @return array delivery_point_id => строка базы
	 */
	function ozonPvzLoadDetails($connection, array $ids, &$error)
	{
		$error = '';

		$clean_ids = array();
		foreach ($ids as $id) {
			$id = (int) $id;
			if ($id > 0) {
				$clean_ids[$id] = $id;
			}
		}

		if (empty($clean_ids)) {
			return array();
		}

		$sql = 'SELECT ' . ozonPvzDetailColumnsSql()
			. ' FROM ozon_delivery_points'
			. ' WHERE delivery_point_id IN (' . implode(', ', $clean_ids) . ')';

		$rows  = ozonPvzQuery($connection, $sql, $error);
		$index = array();

		foreach ($rows as $row) {
			$index[(int) $row['delivery_point_id']] = $row;
		}

		return $index;
	}

	/**
	 * Стартовый размер ячейки кластеризации для зума.
	 */
	function ozonPvzInitialCellDeg($zoom, $factor, $min_cell)
	{
		$zoom = (int) $zoom;
		if ($zoom < 0) {
			$zoom = 0;
		} elseif ($zoom > 22) {
			$zoom = 22;
		}

		$cell = 360.0 / pow(2, $zoom) * $factor;

		return $cell < $min_cell ? $min_cell : $cell;
	}

	/**
	 * Сгруппировать точки в кластеры по сетке.
	 *
	 * Размер ячейки стартует от зума и удваивается, пока число групп
	 * не станет <= $max_clusters (либо пока ячейка не упрётся в полусферу).
	 *
	 * @param array[] $points Строки delivery_point_id/latitude/longitude.
	 * @return array array('cell' => float, 'items' => array)
	 */
	function ozonPvzClusterize(array $points, $zoom, $factor, $min_cell, $max_clusters)
	{
		$cell = ozonPvzInitialCellDeg($zoom, $factor, $min_cell);
		$groups = array();

		for ($attempt = 0; $attempt < 12; $attempt++) {
			$groups = array();

			foreach ($points as $point) {
				$point_id = (int) $point['delivery_point_id'];
				$lat      = (float) $point['latitude'];
				$lon      = (float) $point['longitude'];

				$key = (int) floor($lat / $cell) . '|' . (int) floor($lon / $cell);

				if (!isset($groups[$key])) {
					$groups[$key] = array(
						'count'   => 0,
						'sum_lat' => 0.0,
						'sum_lon' => 0.0,
						'lat_min' => $lat,
						'lat_max' => $lat,
						'lon_min' => $lon,
						'lon_max' => $lon,
						'ids'     => array(),
					);
				}

				$groups[$key]['count']++;
				$groups[$key]['sum_lat'] += $lat;
				$groups[$key]['sum_lon'] += $lon;
				$groups[$key]['lat_min'] = min($groups[$key]['lat_min'], $lat);
				$groups[$key]['lat_max'] = max($groups[$key]['lat_max'], $lat);
				$groups[$key]['lon_min'] = min($groups[$key]['lon_min'], $lon);
				$groups[$key]['lon_max'] = max($groups[$key]['lon_max'], $lon);
				$groups[$key]['ids'][]   = $point_id;
			}

			if (count($groups) <= $max_clusters || $cell >= 180.0) {
				break;
			}

			$cell *= 2.0;
		}

		$items = array();

		foreach ($groups as $group) {
			if ($group['count'] === 1) {
				$items[] = array(
					'type'              => 'point',
					'delivery_point_id' => $group['ids'][0],
					'lat'               => $group['sum_lat'],
					'long'              => $group['sum_lon'],
				);
				continue;
			}

			$items[] = array(
				'type'   => 'cluster',
				'lat'    => $group['sum_lat'] / $group['count'],
				'long'   => $group['sum_lon'] / $group['count'],
				'count'  => $group['count'],
				'bounds' => array(
					'left_bottom' => array(
						'lat'  => $group['lat_min'],
						'long' => $group['lon_min'],
					),
					'right_top'   => array(
						'lat'  => $group['lat_max'],
						'long' => $group['lon_max'],
					),
				),
			);
		}

		return array('cell' => $cell, 'items' => $items);
	}

	/* ------------------------------------------------------------------
	 * Обработка запроса
	 * ------------------------------------------------------------------ */

	$raw_body = file_get_contents('php://input');
	$request  = json_decode($raw_body, true);

	if (!is_array($request)) {
		$request = $_POST;
	}
	if (!is_array($request) || empty($request)) {
		$request = $_GET;
	}

	if (!is_array($request)) {
		$response['error']   = true;
		$response['message'] = 'Некорректный JSON в теле запроса';
	} else {
		$viewport_error = '';
		$viewport       = ozonPvzParseViewport($request, $viewport_error);

		if ($viewport === null) {
			$response['error']   = true;
			$response['message'] = $viewport_error;
		} else {
			$zoom = (isset($request['zoom']) && is_numeric($request['zoom']))
				? (int) $request['zoom']
				: 10;
			if ($zoom < 0) {
				$zoom = 0;
			} elseif ($zoom > 22) {
				$zoom = 22;
			}
			$response['zoom'] = $zoom;

			$db_error    = '';
			$connection  = ozonPvzOpenDb($OZON_PVZ_DB_PATH, $db_error);

			if ($connection === null) {
				$response['error']   = true;
				$response['message'] = $db_error;
			} else {
				$response['db_driver'] = $connection['driver'];
				$where_sql = ozonPvzWhereSql($viewport);

				// 1) Общее количество ПВЗ в окне + свежесть данных.
				$count_sql = 'SELECT COUNT(*) AS cnt, MAX(updated_at) AS updated_at'
					. ' FROM ozon_delivery_points WHERE ' . $where_sql;

				$count_rows = ozonPvzQuery($connection, $count_sql, $db_error);

				if ($db_error !== '') {
					$response['error']   = true;
					$response['message'] = $db_error;
				} else {
					$total = isset($count_rows[0]['cnt']) ? (int) $count_rows[0]['cnt'] : 0;
					$response['count'] = $total;
					$response['db_updated_at'] = isset($count_rows[0]['updated_at'])
						? (string) $count_rows[0]['updated_at']
						: '';

					$items = array();

					if ($total === 0) {
						// Пусто — ничего не возвращаем.
					} elseif ($total <= $OZON_PVZ_MAX_POINTS_DIRECT) {
						// 2a) Немного ПВЗ — отдаём карточками.
						$details_sql = 'SELECT ' . ozonPvzDetailColumnsSql()
							. ' FROM ozon_delivery_points WHERE ' . $where_sql
							. ' ORDER BY delivery_point_id';

						$rows = ozonPvzQuery($connection, $details_sql, $db_error);

						if ($db_error !== '') {
							$response['error']   = true;
							$response['message'] = $db_error;
						} else {
							foreach ($rows as $row) {
								$items[] = ozonPvzBuildPointItem($row);
							}
						}
					} else {
						// 2b) Много ПВЗ — сначала лёгкая выборка координат,
						// затем кластеризация и догрузка карточек одиночек.
						$coords_sql = 'SELECT delivery_point_id, latitude, longitude'
							. ' FROM ozon_delivery_points WHERE ' . $where_sql
							. ' ORDER BY delivery_point_id'
							. ' LIMIT ' . (int) $OZON_PVZ_MAX_SCAN;

						$coords = ozonPvzQuery($connection, $coords_sql, $db_error);

						if ($db_error !== '') {
							$response['error']   = true;
							$response['message'] = $db_error;
						} else {
							if ($total > count($coords)) {
								$response['truncated'] = true;
							}

							$cluster_result = ozonPvzClusterize(
								$coords,
								$zoom,
								$OZON_PVZ_GRID_FACTOR,
								$OZON_PVZ_MIN_CELL_DEG,
								$OZON_PVZ_MAX_CLUSTERS
							);

							$response['clustered']    = true;
							$response['cell_degrees'] = round($cluster_result['cell'], 6);

							// Идентификаторы одиночных точек, для которых нужны карточки.
							$single_ids = array();
							foreach ($cluster_result['items'] as $item) {
								if ($item['type'] === 'point') {
									$single_ids[] = $item['delivery_point_id'];
								}
							}

							$details = ozonPvzLoadDetails($connection, $single_ids, $db_error);

							if ($db_error !== '') {
								$response['error']   = true;
								$response['message'] = $db_error;
							} else {
								foreach ($cluster_result['items'] as $item) {
									if ($item['type'] === 'cluster') {
										$items[] = $item;
										continue;
									}

									$point_id = (int) $item['delivery_point_id'];
									if (isset($details[$point_id])) {
										$items[] = ozonPvzBuildPointItem($details[$point_id]);
									}
								}
							}
						}
					}

					if (!$response['error']) {
						$response['clusters']  = $items;
						$response['returned']  = count($items);
						$response['http_code'] = 200;
					}
				}

				unset($connection['db']);
			}
		}
	}

	header("Content-type: application/json; charset=utf-8");
	echo json_encode($response, JSON_UNESCAPED_UNICODE);
