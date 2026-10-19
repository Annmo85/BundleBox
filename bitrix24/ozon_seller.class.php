<?php
	/*
	 * ozon_seller.class.php
	 * ------------------------------------------------------------------
	 * Клиент Ozon Seller API — методы карты ПВЗ.
	 *
	 * Авторизация: заголовки Client-Id и Api-Key (без OAuth).
	 * Методы:      https://api-seller.ozon.ru/v1/delivery/...
	 *
	 * Реализовано:
	 *   - getDeliveryMap()        — POST /v1/delivery/map
	 *     список кластеров ПВЗ внутри прямоугольника карты;
	 *   - getDeliveryPointInfo()  — POST /v1/delivery/point/info
	 *     информация о точках ПВЗ по map_point_ids
	 *     (возвращаются только enabled === true).
	 *
	 * Пример использования:
	 *
	 *   require_once(__DIR__ . '/ozon_tokens.php');
	 *   require_once(__DIR__ . '/ozon_seller.class.php');
	 *
	 *   $seller = new OzonSeller([
	 *       'client_id' => $OZON_SELLER_CLIENT_ID,
	 *       'api_key'   => $OZON_SELLER_API_KEY,
	 *   ]);
	 *
	 *   $map = $seller->getDeliveryMap([
	 *       'left_bottom' => ['lat' => 55.0, 'long' => 37.0],
	 *       'right_top'   => ['lat' => 56.0, 'long' => 38.0],
	 *   ], 10);
	 *
	 *   $info = $seller->getDeliveryPointInfo($map_point_ids);
	 */

	class OzonSeller
	{
		/** @var string client_id продавца (заголовок Client-Id) */
		private $client_id;
		/** @var string API-ключ продавца (заголовок Api-Key) */
		private $api_key;
		/** @var string Базовый адрес методов API */
		private $api_url;
		/** @var int Таймаут HTTP-запроса, сек */
		private $timeout;
		/** @var int Таймаут установки соединения, сек */
		private $connect_timeout;
		/** @var string Предпочитаемое семейство IP: 'v4' | 'v6' | 'any' */
		private $ip_resolve;
		/** @var bool Выводить отладку */
		private $debug;
		/** @var string Последняя ошибка запроса */
		private $last_error = '';

		/**
		 * @param array $config
		 *   client_id       (string) — Client-Id продавца;
		 *   api_key         (string) — Api-Key продавца;
		 *   api_url         (string) — по умолчанию https://api-seller.ozon.ru;
		 *   timeout         (int)    — общий таймаут, по умолчанию 30;
		 *   connect_timeout (int)    — таймаут соединения, по умолчанию 10;
		 *   ip_resolve      (string) — 'v4' | 'v6' | 'any', по умолчанию 'v4';
		 *   debug           (bool)   — по умолчанию false.
		 */
		public function __construct(array $config)
		{
			$this->client_id       = isset($config['client_id']) ? trim($config['client_id']) : '';
			$this->api_key         = isset($config['api_key']) ? trim($config['api_key']) : '';
			$this->api_url         = isset($config['api_url']) && $config['api_url'] !== ''
				? rtrim($config['api_url'], '/')
				: 'https://api-seller.ozon.ru';
			$this->timeout         = isset($config['timeout']) ? (int) $config['timeout'] : 30;
			$this->connect_timeout = isset($config['connect_timeout']) ? (int) $config['connect_timeout'] : 10;
			$this->ip_resolve      = isset($config['ip_resolve']) ? strtolower($config['ip_resolve']) : 'v4';
			$this->debug           = !empty($config['debug']);
		}

		/** Включить/выключить отладку. */
		public function setDebug($debug)
		{
			$this->debug = (bool) $debug;
		}

		/** Заданы ли Client-Id и Api-Key. */
		public function hasCredentials()
		{
			return $this->client_id !== '' && $this->api_key !== '';
		}

		/** Последняя ошибка (cURL или API), пустая строка — ошибки нет. */
		public function getLastError()
		{
			return $this->last_error;
		}

		/**
		 * Формирует текст ошибки с учётом ответа API Ozon.
		 * Ozon возвращает {"code": int, "message": string}, например
		 * {"code":7,"message":"method is not allowed"} — это важно
		 * для диагностики прав API-ключа.
		 *
		 * @param array  $res      Результат httpRequest().
		 * @param string $fallback Текст, если API не вернул message.
		 *
		 * @return string
		 */
		private function apiError(array $res, $fallback)
		{
			$message = $fallback;

			if (isset($res['json']['message']) && is_string($res['json']['message']) && $res['json']['message'] !== '') {
				$message = $res['json']['message'];
				if (isset($res['json']['code'])) {
					$message .= ' (code ' . $res['json']['code'] . ')';
				}
			} elseif ($res['error'] !== '') {
				$message = $res['error'];
			}

			return 'HTTP ' . $res['http_code'] . ': ' . $message;
		}

		/**
		 * Список ролей и доступных API-ключу методов.
		 *
		 * POST /v1/roles
		 *
		 * Используется для диагностики: если метод недоступен ключу,
		 * Ozon отвечает {"code":7,"message":"method is not allowed"}.
		 * Здесь можно посмотреть, какие методы разрешены.
		 *
		 * @return array{roles:array, methods:array, http_code:int, error:string}
		 */
		public function getRoles()
		{
			if (!$this->hasCredentials()) {
				$this->last_error = 'Не заданы Client-Id/Api-Key Ozon Seller';
				return ['roles' => [], 'methods' => [], 'http_code' => 0, 'error' => $this->last_error];
			}

			$url = $this->api_url . '/v1/roles';
			// Тело должно быть JSON-объектом {}, пустой массив Ozon не принимает.
			$res = $this->httpRequest($url, 'POST', $this->baseHeaders(), '{}');

			$roles   = (isset($res['json']['roles']) && is_array($res['json']['roles']))
				? $res['json']['roles']
				: [];
			$methods = [];
			foreach ($roles as $role) {
				if (isset($role['methods']) && is_array($role['methods'])) {
					foreach ($role['methods'] as $method) {
						$methods[$method] = true;
					}
				}
			}

			$error = '';
			if ($res['http_code'] !== 200) {
				$error = $this->apiError($res, 'Ozon API вернул HTTP ' . $res['http_code']);
			}
			$this->last_error = $error;

			return [
				'roles'     => $roles,
				'methods'   => array_keys($methods),
				'http_code' => $res['http_code'],
				'error'     => $error,
			];
		}

		/**
		 * Низкоуровневый HTTP-запрос (cURL).
		 *
		 * @return array{http_code:int, body:string, json:mixed, error:string, redirect_url:string, effective_url:string, primary_ip:string, connect_time:float}
		 */
		private function httpRequest($url, $method, array $headers, $body = null)
		{
			$ch = curl_init();

			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
			curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $this->connect_timeout);

			// Семейство IP: по умолчанию IPv4 — обходит сломанный IPv6-маршрут.
			if ($this->ip_resolve === 'v4') {
				curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
			} elseif ($this->ip_resolve === 'v6') {
				curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V6);
			} else {
				curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_WHATEVER);
			}

			if (!empty($headers)) {
				curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			}

			// Ограниченное следование редиректам.
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
			curl_setopt($ch, CURLOPT_MAXREDIRS, 10);

			if ($body !== null) {
				if (is_array($body)) {
					$body = json_encode($body, JSON_UNESCAPED_UNICODE);
				}
				curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
			}

			$response = curl_exec($ch);

			$result = [
				'http_code'     => (int) curl_getinfo($ch, CURLINFO_HTTP_CODE),
				'body'          => $response,
				'json'          => null,
				'error'         => ($response === false) ? curl_error($ch) : '',
				'redirect_url'  => (string) curl_getinfo($ch, CURLINFO_REDIRECT_URL),
				'effective_url' => (string) curl_getinfo($ch, CURLINFO_EFFECTIVE_URL),
				'primary_ip'    => (string) curl_getinfo($ch, CURLINFO_PRIMARY_IP),
				'connect_time'  => (float) curl_getinfo($ch, CURLINFO_CONNECT_TIME),
			];

			if ($response !== false) {
				$result['json'] = json_decode($response, true);
			}

			curl_close($ch);

			$this->last_error = $result['error'];

			return $result;
		}

		/** Базовые заголовки запроса (авторизация Ozon Seller). */
		private function baseHeaders()
		{
			return [
				'Content-Type: application/json',
				'Accept: application/json',
				'Client-Id: ' . $this->client_id,
				'Api-Key: ' . $this->api_key,
				'User-Agent: bundlebox-ozon-seller/1.0',
			];
		}

		/**
		 * Вывод отладочной информации по запросу/ответу.
		 *
		 * @param string     $title   Заголовок блока.
		 * @param array      $res     Результат httpRequest().
		 * @param string     $url     Адрес запроса.
		 * @param mixed|null $payload Тело запроса (для вывода).
		 */
		private function debug($title, $res, $url, $payload = null)
		{
			if (!$this->debug) {
				return;
			}

			echo "=== [OZON SELLER] {$title} ===\n";
			echo "URL: {$url}\n";
			if ($payload !== null) {
				echo "Payload: " . json_encode($payload, JSON_UNESCAPED_UNICODE) . "\n";
			}
			echo "HTTP: {$res['http_code']}\n";
			if (isset($res['primary_ip']) && $res['primary_ip'] !== '') {
				echo "Destination IP: {$res['primary_ip']}\n";
			}
			if (isset($res['connect_time'])) {
				echo "Connect time: {$res['connect_time']} s\n";
			}
			if ($res['redirect_url'] !== '') {
				echo "Redirect-Location: {$res['redirect_url']}\n";
			}
			if (isset($res['effective_url']) && $res['effective_url'] !== '') {
				echo "Effective URL: {$res['effective_url']}\n";
			}
			if ($res['error'] !== '') {
				echo "cURL error: {$res['error']}\n";
			}
			echo "Response: {$res['body']}\n\n";
		}

		/**
		 * Приводит viewport к формату Ozon:
		 * {
		 *   "left_bottom": {"lat": float, "long": float},
		 *   "right_top":   {"lat": float, "long": float}
		 * }
		 *
		 * @param array $viewport
		 * @return array|null null — структура некорректна.
		 */
		private function normalizeViewport(array $viewport)
		{
			$left_bottom = isset($viewport['left_bottom']) && is_array($viewport['left_bottom'])
				? $viewport['left_bottom']
				: null;
			$right_top = isset($viewport['right_top']) && is_array($viewport['right_top'])
				? $viewport['right_top']
				: null;

			if ($left_bottom === null || $right_top === null) {
				$this->last_error = 'Некорректный viewport: ожидаются left_bottom и right_top';
				return null;
			}

			if (!isset($left_bottom['lat'], $left_bottom['long'], $right_top['lat'], $right_top['long'])
				|| !is_numeric($left_bottom['lat']) || !is_numeric($left_bottom['long'])
				|| !is_numeric($right_top['lat']) || !is_numeric($right_top['long'])
			) {
				$this->last_error = 'Некорректный viewport: lat/long должны быть числами';
				return null;
			}

			return [
				'left_bottom' => [
					'lat'  => (float) $left_bottom['lat'],
					'long' => (float) $left_bottom['long'],
				],
				'right_top' => [
					'lat'  => (float) $right_top['lat'],
					'long' => (float) $right_top['long'],
				],
			];
		}

		/**
		 * Список кластеров ПВЗ внутри прямоугольника карты.
		 *
		 * POST /v1/delivery/map
		 *
		 * @param array $viewport {'left_bottom': {lat, long}, 'right_top': {lat, long}}.
		 * @param int   $zoom     Целочисленный зум карты.
		 *
		 * @return array{clusters:array, http_code:int, error:string, raw:mixed}
		 */
		public function getDeliveryMap(array $viewport, $zoom = 0)
		{
			$this->last_error = '';

			$normalized = $this->normalizeViewport($viewport);
			if ($normalized === null) {
				return ['clusters' => [], 'http_code' => 0, 'error' => $this->last_error, 'raw' => null];
			}

			if (!$this->hasCredentials()) {
				$this->last_error = 'Не заданы Client-Id/Api-Key Ozon Seller';
				return ['clusters' => [], 'http_code' => 0, 'error' => $this->last_error, 'raw' => null];
			}

			$payload = [
				'viewport' => $normalized,
				'zoom'     => (int) $zoom,
			];

			$url = $this->api_url . '/v1/delivery/map';
			$res = $this->httpRequest($url, 'POST', $this->baseHeaders(), $payload);
			$this->debug('delivery/map', $res, $url, $payload);

			if ($res['http_code'] !== 200) {
				$this->last_error = $this->apiError($res, 'Ozon API вернул HTTP ' . $res['http_code']);
			}

			$clusters = (isset($res['json']['clusters']) && is_array($res['json']['clusters']))
				? $res['json']['clusters']
				: [];

			return [
				'clusters'  => $clusters,
				'http_code' => $res['http_code'],
				'error'     => $this->last_error,
				'raw'       => $res['json'],
			];
		}

		/**
		 * Информация о точках ПВЗ по их map_point_ids.
		 *
		 * POST /v1/delivery/point/info
		 * Ozon принимает не более 100 идентификаторов за запрос, поэтому
		 * список автоматически разбивается на пачки. Возвращаются только
		 * точки, у которых enabled === true.
		 *
		 * @param array $map_point_ids Список идентификаторов точек (int64/string).
		 *
		 * @return array{points:array, http_code:int, error:string, raw:mixed}
		 */
		public function getDeliveryPointInfo(array $map_point_ids)
		{
			$this->last_error = '';

			$ids = [];
			foreach ($map_point_ids as $id) {
				if ($id === null || $id === '') {
					continue;
				}
				$ids[] = (string) $id;
			}
			$ids = array_values(array_unique($ids));

			if (empty($ids)) {
				$this->last_error = 'Список map_point_ids пуст';
				return ['points' => [], 'http_code' => 0, 'error' => $this->last_error, 'raw' => null];
			}

			if (!$this->hasCredentials()) {
				$this->last_error = 'Не заданы Client-Id/Api-Key Ozon Seller';
				return ['points' => [], 'http_code' => 0, 'error' => $this->last_error, 'raw' => null];
			}

			$url         = $this->api_url . '/v1/delivery/point/info';
			$points      = [];
			$http_code   = 0;
			$last_raw    = null;
			$last_error  = '';

			foreach (array_chunk($ids, 100) as $chunk) {
				$payload = ['map_point_ids' => $chunk];

				$res = $this->httpRequest($url, 'POST', $this->baseHeaders(), $payload);
				$this->debug('delivery/point/info', $res, $url, $payload);

				$http_code = $res['http_code'];
				$last_raw  = $res['json'];

				if ($res['http_code'] !== 200) {
					$last_error = $this->apiError($res, 'Ozon API вернул HTTP ' . $res['http_code']);
					break;
				}

				if (isset($res['json']['points']) && is_array($res['json']['points'])) {
					foreach ($res['json']['points'] as $point) {
						// Отфильтровываем недоступные точки: нужны только enabled === true.
						if (isset($point['enabled']) && $point['enabled'] === true) {
							$points[] = $point;
						}
					}
				}
			}

			$this->last_error = $last_error;

			return [
				'points'    => $points,
				'http_code' => $http_code,
				'error'     => $last_error,
				'raw'       => $last_raw,
			];
		}
	}
?>
