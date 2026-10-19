<?php
	/*
	 * ozon_delivery.class.php
	 * ------------------------------------------------------------------
	 * Клиент API Ozon Доставка.
	 *
	 * Авторизация: OAuth 2.0 (client_credentials) — POST https://xapi.ozon.ru/oauth/token
	 * Методы:      https://api-delivery.ozon.ru/v1/...
	 *
	 * Учитывается anti-DDoS модуль testcookie: при 302/307 с Location + Set-Cookie
	 * запрос повторяется по Location, cookie сохраняется в cookie-jar и
	 * переиспользуется между запросами.
	 *
	 * Пример использования:
	 *
	 *   require_once(__DIR__ . '/ozon_delivery.class.php');
	 *
	 *   $ozon = new OzonDelivery([
	 *       'client_id'     => $OZON_DELIVERY_CLIENT_ID,
	 *       'client_secret' => $OZON_DELIVERY_TOKEN,
	 *       'debug'         => true,
	 *   ]);
	 *
	 *   $postings = $ozon->searchPostings(['in_delivery_point'], 100);
	 */

	class OzonDelivery
	{
		/** @var string client_id (OAuth) */
		private $client_id;
		/** @var string client_secret (OAuth) */
		private $client_secret;
		/** @var string Базовый адрес методов API */
		private $api_url;
		/** @var string Адрес получения access_token */
		private $auth_url;
		/** @var array Уровни доступа (scope) */
		private $scopes;
		/** @var string Путь к файлу cookie-jar (testcookie) */
		private $cookie_jar;
		/** @var int Таймаут HTTP-запроса, сек */
		private $timeout;
		/** @var int Таймаут установки соединения, сек */
		private $connect_timeout;
		/** @var string Предпочитаемое семейство IP: 'v4' | 'v6' | 'any' */
		private $ip_resolve;
		/** @var bool Выводить отладку */
		private $debug;
		/** @var string Полученный access_token (Bearer) */
		private $access_token = '';
		/** @var int Пауза между запросами к API, сек (0 — без паузы) */
		private $request_delay = 1;

		/**
		 * @param array $config
		 *   client_id     (string) — client_id OAuth;
		 *   client_secret (string) — client_secret OAuth;
		 *   api_url       (string) — по умолчанию https://api-delivery.ozon.ru;
		 *   auth_url      (string) — по умолчанию https://xapi.ozon.ru/oauth/token;
		 *   scopes        (array)  — по умолчанию delivery-api.*;
		 *   cookie_jar    (string) — по умолчанию в sys_get_temp_dir();
		 *   timeout       (int)    — общий таймаут, по умолчанию 30;
		 *   connect_timeout (int)  — таймаут соединения, по умолчанию 10;
		 *   ip_resolve    (string) — 'v4' | 'v6' | 'any', по умолчанию 'v4';
		 *   request_delay (int)    — пауза между запросами, по умолчанию 1 сек;
		 *   debug         (bool)   — по умолчанию false.
		 */
		public function __construct(array $config)
		{
			$this->client_id     = isset($config['client_id']) ? trim($config['client_id']) : '';
			$this->client_secret = isset($config['client_secret']) ? trim($config['client_secret']) : '';
			$this->api_url       = isset($config['api_url']) && $config['api_url'] !== ''
				? rtrim($config['api_url'], '/')
				: 'https://api-delivery.ozon.ru';
			$this->auth_url      = isset($config['auth_url']) && $config['auth_url'] !== ''
				? $config['auth_url']
				: 'https://xapi.ozon.ru/oauth/token';
			$this->scopes        = (isset($config['scopes']) && is_array($config['scopes']))
				? $config['scopes']
				: [
					'delivery-api.delivery',
					'delivery-api.delivery-point',
					'delivery-api.order',
					'delivery-api.posting',
				];
			$this->cookie_jar    = isset($config['cookie_jar']) && $config['cookie_jar'] !== ''
				? $config['cookie_jar']
				: sys_get_temp_dir() . '/ozon_delivery.cookies';
			$this->timeout         = isset($config['timeout']) ? (int) $config['timeout'] : 30;
			$this->connect_timeout = isset($config['connect_timeout']) ? (int) $config['connect_timeout'] : 10;
			$this->ip_resolve      = isset($config['ip_resolve']) ? strtolower($config['ip_resolve']) : 'v4';
			$this->debug           = !empty($config['debug']);
			$this->request_delay   = isset($config['request_delay']) ? max(0, (int) $config['request_delay']) : 1;
		}

		/** Включить/выключить отладку. */
		public function setDebug($debug)
		{
			$this->debug = (bool) $debug;
		}

		/** Задать паузу между запросами к API (сек). */
		public function setRequestDelay($seconds)
		{
			$this->request_delay = max(0, (int) $seconds);
		}

		/** Текущая пауза между запросами к API (сек). */
		public function getRequestDelay()
		{
			return $this->request_delay;
		}

		/** Заданы ли client_id и client_secret. */
		public function hasCredentials()
		{
			return $this->client_id !== '' && $this->client_secret !== '';
		}

		/**
		 * Выдержать паузу между запросами (защита от лимитов API).
		 * Публичный метод — вызывающий код может делать паузы между
		 * собственными запросами (например, между чанками ПВЗ).
		 */
		public function pause()
		{
			if ($this->request_delay > 0) {
				sleep($this->request_delay);
			}
		}

		/**
		 * Низкоуровневый HTTP-запрос (cURL) с cookie-jar и следованием редиректам.
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

			// Семейство IP: по умолчанию IPv4 — обходит сломанный IPv6-маршрут,
			// из-за которого соединение с хостом может висеть до таймаута.
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

			// Общий cookie-jar: прохождение testcookie и переиспользование cookie.
			curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookie_jar);
			curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_jar);

			// Ограниченное следование редиректам (302/307 testcookie).
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

			return $result;
		}

		/** Базовые заголовки запроса. */
		private function baseHeaders()
		{
			return [
				'Content-Type: application/json',
				'Accept: application/json',
				'User-Agent: bundlebox-ozon-cron/1.0',
			];
		}

		/**
		 * Вывод отладочной информации по запросу/ответу.
		 *
		 * @param string      $title     Заголовок блока.
		 * @param array       $res       Результат httpRequest().
		 * @param string|null $url       Адрес запроса.
		 * @param mixed|null  $payload   Тело запроса (для вывода).
		 * @param bool        $mask_body Маскировать тело ответа (для ответов с токеном).
		 */
		private function debug($title, $res, $url = null, $payload = null, $mask_body = false)
		{
			if (!$this->debug) {
				return;
			}

			echo "=== [OZON] {$title} ===\n";
			if ($url !== null) {
				echo "URL: {$url}\n";
			}
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

			$body = (string) $res['body'];
			if ($mask_body) {
				$body = substr($body, 0, 200) . '...';
			}
			echo "Response: {$body}\n\n";
		}

		/**
		 * Авторизация в API Ozon Доставка (client_credentials).
		 * Результат кешируется в объекте.
		 *
		 * @return string access_token либо '' при ошибке.
		 */
		public function auth()
		{
			if ($this->access_token !== '') {
				return $this->access_token;
			}
			if (!$this->hasCredentials()) {
				return '';
			}

			$payload = [
				'client_id'     => $this->client_id,
				'client_secret' => $this->client_secret,
				'grant_type'    => 'client_credentials',
				'scope'         => $this->scopes,
			];

			$res = $this->httpRequest($this->auth_url, 'POST', $this->baseHeaders(), $payload);

			// В отладке не показываем client_secret.
			$debug_payload = $payload;
			$debug_payload['client_secret'] = '***';
			$this->debug('Авторизация', $res, $this->auth_url, $debug_payload, true);

			if (is_array($res['json'])) {
				foreach (['access_token', 'token'] as $key) {
					if (!empty($res['json'][$key])) {
						$this->access_token = $res['json'][$key];
						return $this->access_token;
					}
				}
			}

			return '';
		}

		/** Текущий access_token (без повторной авторизации). */
		public function getAccessToken()
		{
			return $this->access_token;
		}

		/**
		 * Одна страница поиска отправлений.
		 *
		 * POST /v1/posting/search
		 *
		 * @param array       $filters Фильтры, например ['statuses' => ['in_delivery_point']].
		 * @param int         $limit   Размер страницы.
		 * @param string|null $cursor  Указатель следующей страницы (из next_cursor).
		 *
		 * @return array{postings:array, next_cursor:?string, http_code:int}
		 */
		public function searchPostingsPage(array $filters, $limit = 100, $cursor = null)
		{
			$token = $this->auth();
			if ($token === '') {
				return ['postings' => [], 'next_cursor' => null, 'http_code' => 0];
			}

			$pagination = ['limit' => (int) $limit];
			if ($cursor !== null && $cursor !== '') {
				$pagination['cursor'] = $cursor;
			}

			$payload = ['pagination' => $pagination];
			if (!empty($filters)) {
				$payload['filters'] = $filters;
			}

			$headers   = $this->baseHeaders();
			$headers[] = 'Authorization: Bearer ' . $token;

			$url = $this->api_url . '/v1/posting/search';

			$res = $this->httpRequest($url, 'POST', $headers, $payload);
			$this->debug('posting/search', $res, $url, $payload);

			$postings = (isset($res['json']['postings']) && is_array($res['json']['postings']))
				? $res['json']['postings']
				: [];
			$next = (isset($res['json']['next_cursor']) && $res['json']['next_cursor'] !== '')
				? $res['json']['next_cursor']
				: null;

			return [
				'postings'    => $postings,
				'next_cursor' => $next,
				'http_code'   => $res['http_code'],
			];
		}

		/**
		 * Одна страница получения информации об отправлениях.
		 *
		 * POST /v1/posting/info
		 *
		 * @param array       $posting_numbers Список posting_number.
		 * @param int         $limit           Размер страницы.
		 * @param string|null $cursor          Указатель следующей страницы (из next_cursor).
		 *
		 * @return array{postings:array, next_cursor:?string, http_code:int}
		 */
		public function infoPostingPage(array $posting_numbers, $limit = 100, $cursor = null)
		{
			$token = $this->auth();
			if ($token === '') {
				return ['postings' => [], 'next_cursor' => null, 'http_code' => 0];
			}

			$pagination = ['limit' => (int) $limit];
			if ($cursor !== null && $cursor !== '') {
				$pagination['cursor'] = $cursor;
			}

			// API ожидает массив строк: приводим значения к string, чтобы
			// числовые posting_number не уходили в JSON как числа.
			$payload = [
				'posting_numbers' => array_map('strval', array_values($posting_numbers)),
				'pagination'      => $pagination,
			];

			$headers   = $this->baseHeaders();
			$headers[] = 'Authorization: Bearer ' . $token;

			$url = $this->api_url . '/v1/posting/info';

			$res = $this->httpRequest($url, 'POST', $headers, $payload);
			$this->debug('posting/info', $res, $url, $payload);

			$postings = (isset($res['json']['postings']) && is_array($res['json']['postings']))
				? $res['json']['postings']
				: [];
			$next = (isset($res['json']['next_cursor']) && $res['json']['next_cursor'] !== '')
				? $res['json']['next_cursor']
				: null;

			return [
				'postings'    => $postings,
				'next_cursor' => $next,
				'http_code'   => $res['http_code'],
			];
		}

		/**
		 * Получение информации об отправлениях с обходом всех страниц.
		 *
		 * @param array $posting_numbers Список posting_number.
		 * @param int   $limit           Размер страницы.
		 *
		 * @return array Список отправлений (posting).
		 */
		public function infoPosting(array $posting_numbers, $limit = 100)
		{
			if (empty($posting_numbers)) {
				return [];
			}

			$all    = [];
			$cursor = null;
			$page   = 0;

			do {
				if ($this->debug) {
					echo "--- [OZON] posting/info (страница {$page}) ---\n";
				}

				$res    = $this->infoPostingPage($posting_numbers, $limit, $cursor);
				$all    = array_merge($all, $res['postings']);
				$cursor = $res['next_cursor'];
				$page++;

				if ($res['http_code'] !== 200 || $cursor === null || count($res['postings']) === 0) {
					break;
				}

				$this->pause();
			} while (true);

			return $all;
		}

		/**
		 * Поиск отправлений по статусам с обходом всех страниц (next_cursor).
		 *
		 * @param array $statuses Список статусов, например ['in_delivery_point'].
		 *                        Пустой массив — без фильтра (все отправления).
		 * @param int   $limit    Размер страницы.
		 *
		 * @return array Список отправлений (posting).
		 */
		public function searchPostings(array $statuses = [], $limit = 100)
		{
		 // Пустой список статусов — без фильтра, выгружаем все отправления.
		 $filters = empty($statuses) ? [] : ['statuses' => array_values($statuses)];

			$all    = [];
			$cursor = null;
			$page   = 0;

			do {
				if ($this->debug) {
					echo "--- [OZON] posting/search (страница {$page}) ---\n";
				}

				$res    = $this->searchPostingsPage($filters, $limit, $cursor);
				$all    = array_merge($all, $res['postings']);
				$cursor = $res['next_cursor'];
				$page++;

				if ($res['http_code'] !== 200 || $cursor === null || count($res['postings']) === 0) {
					break;
				}

				$this->pause();
			} while (true);

			return $all;
		}

		/**
		 * Одна страница списка всех пунктов выдачи Ozon.
		 *
		 * POST /v1/delivery-point/list
		 *
		 * @param int         $limit  Размер страницы.
		 * @param string|null $cursor Указатель следующей страницы (из next_cursor).
		 *
		 * @return array{delivery_points:array, next_cursor:?string, http_code:int, error:string}
		 */
		public function listDeliveryPointsPage($limit = 100, $cursor = null)
		{
			$token = $this->auth();
			if ($token === '') {
				return [
					'delivery_points' => [],
					'next_cursor'     => null,
					'http_code'       => 0,
					'error'           => 'Не удалось получить access_token Ozon Доставка',
				];
			}

			$pagination = ['limit' => (int) $limit];
			if ($cursor !== null && $cursor !== '') {
				$pagination['cursor'] = $cursor;
			}

			$payload = ['pagination' => $pagination];

			$headers   = $this->baseHeaders();
			$headers[] = 'Authorization: Bearer ' . $token;

			$url = $this->api_url . '/v1/delivery-point/list';

			$res = $this->httpRequest($url, 'POST', $headers, $payload);
			$this->debug('delivery-point/list', $res, $url, $payload);

			$points = (isset($res['json']['delivery_points']) && is_array($res['json']['delivery_points']))
				? $res['json']['delivery_points']
				: [];
			$next = (isset($res['json']['next_cursor']) && $res['json']['next_cursor'] !== '')
				? $res['json']['next_cursor']
				: null;

			$error = '';
			if ($res['error'] !== '') {
				$error = $res['error'];
			} elseif ($res['http_code'] !== 200) {
				$error = 'Ozon API вернул HTTP ' . $res['http_code'];
			}

			return [
				'delivery_points' => $points,
				'next_cursor'     => $next,
				'http_code'       => $res['http_code'],
				'error'           => $error,
			];
		}

		/**
		 * Полный список пунктов выдачи с обходом всех страниц (next_cursor).
		 *
		 * Пауза между страницами задаётся в конфиге (request_delay, по умолчанию 1 сек).
		 *
		 * @param int         $limit Размер страницы.
		 * @param string|null $error Текст ошибки (по ссылке), '' — без ошибок.
		 *
		 * @return array Список элементов delivery_points:
		 *               [['delivery_point_id' => int, 'shipment_method_ids' => int[]], ...].
		 */
		public function listDeliveryPoints($limit = 100, &$error = null)
		{
			$all    = [];
			$cursor = null;
			$page   = 0;
			$error  = '';

			do {
				if ($this->debug) {
					echo "--- [OZON] delivery-point/list (страница {$page}) ---\n";
				}

				$res = $this->listDeliveryPointsPage($limit, $cursor);

				foreach ($res['delivery_points'] as $point) {
					if (isset($point['delivery_point_id'])) {
						$all[] = $point;
					}
				}

				$cursor = $res['next_cursor'];
				$page++;

				if ($res['error'] !== '') {
					$error = $res['error'];
					break;
				}

				if ($res['http_code'] !== 200 || $cursor === null || count($res['delivery_points']) === 0) {
					break;
				}

				$this->pause();
			} while (true);

			return $all;
		}

		/**
		 * Идентификаторы ВСЕХ пунктов выдачи Ozon.
		 *
		 * @param int         $limit Размер страницы.
		 * @param string|null $error Текст ошибки (по ссылке), '' — без ошибок.
		 *
		 * @return int[]
		 */
		public function getDeliveryPointIds($limit = 100, &$error = null)
		{
			$points = $this->listDeliveryPoints($limit, $error);
			$ids    = [];

			foreach ($points as $point) {
				if (isset($point['delivery_point_id'])) {
					$ids[(int) $point['delivery_point_id']] = true;
				}
			}

			return array_keys($ids);
		}

		/**
		 * Информация о пунктах выдачи Ozon (не более 100 идентификаторов за запрос).
		 *
		 * POST /v1/delivery-point/info
		 *
		 * @param array $delivery_point_ids Идентификаторы ПВЗ (от 1 до 100 значений).
		 *
		 * @return array{delivery_points:array, http_code:int, error:string}
		 */
		public function infoDeliveryPoints(array $delivery_point_ids)
		{
			$ids = [];
			foreach ($delivery_point_ids as $id) {
				if (is_numeric($id)) {
					$ids[(int) $id] = true;
				}
			}
			$ids = array_keys($ids);

			if (empty($ids)) {
				return [
					'delivery_points' => [],
					'http_code'       => 0,
					'error'           => 'Пустой список идентификаторов ПВЗ',
				];
			}

			if (count($ids) > 100) {
				return [
					'delivery_points' => [],
					'http_code'       => 0,
					'error'           => 'За один запрос допускается не более 100 идентификаторов ПВЗ',
				];
			}

			$token = $this->auth();
			if ($token === '') {
				return [
					'delivery_points' => [],
					'http_code'       => 0,
					'error'           => 'Не удалось получить access_token Ozon Доставка',
				];
			}

			$payload = ['delivery_point_ids' => $ids];

			$headers   = $this->baseHeaders();
			$headers[] = 'Authorization: Bearer ' . $token;

			$url = $this->api_url . '/v1/delivery-point/info';

			$res = $this->httpRequest($url, 'POST', $headers, $payload);
			$this->debug('delivery-point/info', $res, $url, $payload);

			$points = (isset($res['json']['delivery_points']) && is_array($res['json']['delivery_points']))
				? $res['json']['delivery_points']
				: [];

			$error = '';
			if ($res['error'] !== '') {
				$error = $res['error'];
			} elseif ($res['http_code'] !== 200) {
				$error = 'Ozon API вернул HTTP ' . $res['http_code'];
			}

			return [
				'delivery_points' => $points,
				'http_code'       => $res['http_code'],
				'error'           => $error,
			];
		}

		/**
		 * Информация о пунктах выдачи с автоматической разбивкой на чанки.
		 *
		 * Чанк — не более 100 идентификаторов (ограничение Ozon).
		 * Между чанками выдерживается пауза request_delay (по умолчанию 1 сек).
		 *
		 * @param array $delivery_point_ids Идентификаторы ПВЗ.
		 * @param int   $chunk_size         Размер чанка (1..100), по умолчанию 100.
		 *
		 * @return array{delivery_points:array, failed_chunks:int, errors:array}
		 */
		public function getDeliveryPointsInfo(array $delivery_point_ids, $chunk_size = 100)
		{
			$ids = [];
			foreach ($delivery_point_ids as $id) {
				if (is_numeric($id)) {
					$ids[(int) $id] = true;
				}
			}
			$ids = array_keys($ids);

			$chunk_size = (int) $chunk_size;
			if ($chunk_size < 1 || $chunk_size > 100) {
				$chunk_size = 100;
			}

			$chunks = empty($ids) ? [] : array_chunk($ids, $chunk_size);

			$all           = [];
			$errors        = [];
			$failed_chunks = 0;
			$last_index    = count($chunks) - 1;

			foreach ($chunks as $index => $chunk) {
				if ($this->debug) {
					echo "--- [OZON] delivery-point/info (чанк {$index}, ПВЗ: " . count($chunk) . ") ---\n";
				}

				$res = $this->infoDeliveryPoints($chunk);

				if ($res['error'] !== '' || $res['http_code'] !== 200) {
					$failed_chunks++;
					$errors[] = [
						'chunk'     => $index,
						'ids'       => count($chunk),
						'http_code' => $res['http_code'],
						'error'     => $res['error'] !== ''
							? $res['error']
							: 'Ozon API вернул HTTP ' . $res['http_code'],
					];
				}

				foreach ($res['delivery_points'] as $point) {
					$all[] = $point;
				}

				if ($index < $last_index) {
					$this->pause();
				}
			}

			return [
				'delivery_points' => $all,
				'failed_chunks'   => $failed_chunks,
				'errors'          => $errors,
			];
		}
	}
?>
