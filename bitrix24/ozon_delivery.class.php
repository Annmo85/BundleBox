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
		}

		/** Включить/выключить отладку. */
		public function setDebug($debug)
		{
			$this->debug = (bool) $debug;
		}

		/** Заданы ли client_id и client_secret. */
		public function hasCredentials()
		{
			return $this->client_id !== '' && $this->client_secret !== '';
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

				sleep(1);
			} while (true);

			return $all;
		}
	}
?>
