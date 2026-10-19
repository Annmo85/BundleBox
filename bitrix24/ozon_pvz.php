<?php
	/*
	 * ozon_pvz.php
	 * ------------------------------------------------------------------
	 * Список ПВЗ Ozon внутри видимой области карты.
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
	 *   {"error": false, "message": "", "clusters": [...], "http_code": 200}
	 *
	 * Работа с Ozon Seller API вынесена в класс OzonSeller
	 * (bitrix24/ozon_seller.class.php).
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

	// Токены Ozon Seller ($OZON_SELLER_CLIENT_ID, $OZON_SELLER_API_KEY)
	// и клиент API.
	require_once(__DIR__ . '/ozon_tokens.php');
	require_once(__DIR__ . '/ozon_seller.class.php');

	$response = [
		'error'     => false,
		'message'   => '',
		'clusters'  => [],
		'http_code' => 0,
	];

	$postdata = file_get_contents('php://input');
	$request  = json_decode($postdata, true);

	if (!is_array($request)) {
		$response['error']   = true;
		$response['message'] = 'Некорректный JSON в теле запроса';
	} else {
		$viewport = (isset($request['viewport']) && is_array($request['viewport']))
			? $request['viewport']
			: null;

		$left_bottom = ($viewport !== null && isset($viewport['left_bottom']) && is_array($viewport['left_bottom']))
			? $viewport['left_bottom']
			: null;
		$right_top = ($viewport !== null && isset($viewport['right_top']) && is_array($viewport['right_top']))
			? $viewport['right_top']
			: null;

		$valid_viewport = $left_bottom !== null
			&& $right_top !== null
			&& isset($left_bottom['lat'], $left_bottom['long'], $right_top['lat'], $right_top['long'])
			&& is_numeric($left_bottom['lat'])
			&& is_numeric($left_bottom['long'])
			&& is_numeric($right_top['lat'])
			&& is_numeric($right_top['long']);

		if (!$valid_viewport) {
			$response['error']   = true;
			$response['message'] = 'Некорректный viewport: ожидаются left_bottom и right_top с полями lat/long';
		} else {
			$zoom = (isset($request['zoom']) && is_numeric($request['zoom']))
				? (int) $request['zoom']
				: 0;

			$seller = new OzonSeller([
				'client_id' => $OZON_SELLER_CLIENT_ID,
				'api_key'   => $OZON_SELLER_API_KEY,
			]);

			if (!$seller->hasCredentials()) {
				$response['error']   = true;
				$response['message'] = 'Токены Ozon Seller не заполнены: проверьте bitrix24/ozon_tokens.php';
			} else {
				$result = $seller->getDeliveryMap($viewport, $zoom);

				$response['http_code'] = $result['http_code'];

				if ($result['http_code'] !== 200 || $result['error'] !== '') {
					$response['error']   = true;
					$response['message'] = $result['error'] !== ''
						? $result['error']
						: 'Ozon Seller API вернул HTTP ' . $result['http_code'];
				} else {
					$response['clusters'] = $result['clusters'];
				}
			}
		}
	}

	header("Content-type: application/json; charset=utf-8");
	echo json_encode($response, JSON_UNESCAPED_UNICODE);
