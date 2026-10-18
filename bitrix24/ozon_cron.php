<?php
	/*
	 * ozon_cron.php
	 * ------------------------------------------------------------------
	 * Обработчик статусов заказов, отправленных через Ozon Доставку.
	 *
	 * Логика работы с API вынесена в класс OzonDelivery
	 * (bitrix24/ozon_delivery.class.php). Здесь — только сценарий:
	 *   1) авторизоваться;
	 *   2) получить ВСЕ отправления (без фильтра по статусу);
	 *   3) сложить результат в структуру и вывести тестовую отладку.
	 *
	 * Документация:
	 *   https://docs.ozon.ru/api/ozon-delivery/#tag/GetStarted
	 *   https://api-delivery.ozon.ru/v1/posting/search
	 *
	 * Далее (по аналогии с multipoint_cron.php) по найденным отправлениям
	 * можно будет менять статус сделки в Битрикс24, отправлять push и
	 * инвалидировать leadscache/*.json.
	 */

	// Тестовая отладка — на время разработки показываем подробности.
	// Перед постановкой в крон строки ниже нужно закомментировать.
	ini_set("display_errors", "1");
	error_reporting(E_ALL);
	set_time_limit(0);

	// Буферизация вывода: отладочные echo не должны ломать header().
	ob_start();

	// Токены Ozon Доставка ($OZON_DELIVERY_CLIENT_ID, $OZON_DELIVERY_TOKEN)
	// и клиент API.
	require_once(__DIR__ . '/ozon_tokens.php');
	require_once(__DIR__ . '/ozon_delivery.class.php');

	$mp_api_key = "3c4b629e6c820bd1f170826e0cd4d1218b74a3f5";
	require_once (__DIR__.'/firebase-fcm.php');	
	$push_field = 'UF_CRM_1661758328983';

	// Статусы для фильтрации. Пустой массив [] — выводим ВСЕ заказы.
	// Например, ['in_delivery_point'] — только «в пункте выдачи».
	// $OZON_TARGET_STATUSES = [];
	$OZON_TARGET_STATUSES = ['in_delivery_point'];

	// Размер страницы при постраничной выборке.
	$OZON_SEARCH_LIMIT = 100;

	$response = [
		'error'          => false,
		'message'        => '',
		'target_status'  => $OZON_TARGET_STATUSES ?: 'all',
		'token_received' => false,
		'count'          => 0,
		'postings'       => [],
	];

	// Клиент Ozon Доставка.
	$ozon = new OzonDelivery([
		'client_id'     => $OZON_DELIVERY_CLIENT_ID,
		'client_secret' => $OZON_DELIVERY_TOKEN,
		'debug'         => true,
	]);

	if (!$ozon->hasCredentials()) {
		$response['error']   = true;
		$response['message'] = 'Токены Ozon Доставка не заполнены: проверьте bitrix24/ozon_tokens.php';
	} else {
		// 1) Авторизация: получаем access_token.
		$access_token = $ozon->auth();

		if ($access_token === '') {
			$response['error']   = true;
			$response['message'] = 'Не удалось получить access_token Ozon Доставка';
		} else {
			// Токен не печатаем целиком — только признак получения.
			$response['token_received'] = true;

			// 2) Поиск отправлений с нужными статусами.
			$postings = $ozon->searchPostings($OZON_TARGET_STATUSES, $OZON_SEARCH_LIMIT);

			// 3) Структура для дальнейшей обработки.
			$response['postings'] = $postings;
			$response['count']    = count($postings);
		}
	}

	// 4) Запросим из Битрикс24 сделки, в которых поле UF_CRM_1664092353750
	//    (номер посылки Ozon) содержит одно из значений posting_number
	//    из полученных отправлений.
	require_once(__DIR__ . '/crest.php');

	$in_post_deals = [];

	// Собираем все posting_number из ответа Ozon.
	$posting_numbers = [];
	foreach ($response['postings'] as $posting) {
		if (!empty($posting['posting_number'])) {
			$posting_numbers[] = $posting['posting_number'];
		}
	}

	if (!empty($posting_numbers)) {
		$load_all_in_post_deals = false;
		$start = 0;

		while (!$load_all_in_post_deals) {
			// Массив в фильтре UF-поля означает «значение входит в список» (IN).
			// Оператор "!" перед именем поля в сочетании с массивом даёт NOT IN:
			// исключаем сделки в статусах "Получите заказ" (UC_MBDY88), WON и LOSE.
			$result = CRest::call('crm.deal.list', [
				'select' => ['ID', 'TITLE', 'CONTACT_ID', 'STAGE_ID', 'UF_CRM_1664092353750'],
				'filter' => [
					'UF_CRM_1664092353750' => $posting_numbers,
					'!STAGE_ID'            => ['UC_MBDY88', 'WON', 'LOSE'],
				],
				'start'  => $start,
			]);

			if (!empty($result['result']) && is_array($result['result'])) {
				foreach ($result['result'] as $deal) {
					$in_post_deals[] = $deal;
				}
			}

			// Постраничная выборка: переходим к следующей странице с паузой 1 сек,
			// чтобы не спровоцировать блокировку со стороны Битрикс24.
			if (isset($result['next'])) {
				$start = $result['next'];
				sleep(1);
			} else {
				$load_all_in_post_deals = true;
			}
		}
	}

	//5. В цикле сменим статус
	foreach ($response['postings'] as $order) {
		foreach ($in_post_deals as $deal) {
			//Сменим статус, отправим пуш
			$fields = ['STAGE_ID'=>'UC_MBDY88', 'UF_CRM_1668784831705'=>$order['recipient']];
			if (isset($order['estimated_delivery_cost']['amount'])) {
				$fields['UF_CRM_1668785031029']=$order['estimated_delivery_cost']['amount'];
			}
			CRest::call('crm.deal.update',['id'=>$deal['ID'],"fields"=> $fields]);	
			//удалим кеш
			@unlink(__DIR__.'/leadscache/leads_'.$deal['CONTACT_ID'].'.json');
			@unlink(__DIR__.'/leadscache/closedleads_'.$deal['CONTACT_ID'].'.json');
			@unlink(__DIR__.'/leadscache/lead_'.$deal['ID'].'.json');	

			//пуш
			$user_result = CRest::call('crm.contact.get',[ "id"=> $deal['CONTACT_ID']]);
			$push_id = "";
			if (isset($user_result['result'][$push_field])) {
				$push_id = $user_result['result'][$push_field];
				//$push_id = 'd0FSj46zSzKC-W_Qq99w6d:APA91bEqrJ_tNULBa9IGGvXEfzl96v6VSDYalpVjO8eSaLAOAgC9vq8tXPXk0RTG5prsPC4ZknDKeyvuKBvAgI7nArLtUJea7W3ATY2RztvvkPNtmi39ojzaQB8MEht16aWlGdYtmE9I';
				//file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log',print_r($push_id,true),FILE_APPEND);	
			}

			if ($push_id!='') {
				
				$lead_title = trim($deal['TITLE']);
				$lead_title = str_replace("\t"," ",$lead_title);
				
				$parts = array_filter(explode(' ',$lead_title));
				$num = array_pop($parts);
				$store = implode(' ',$parts);				
				
				
				$fcm_android = new FCM($android_push_key);
				$arrNotification["title"] ="Заказ {$store} {$num} готов к выдаче";
				$arrNotification["body"] = "Заказ прибыл в ПВЗ. Вы можете забрать его.";
				$arrNotification["sound"] = "default";
				$arrNotification["type"] = 1;				
				$push_result = $fcm_android->send_notification($push_id, $arrNotification,"Android");
				//print_r($push_result);
				//file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log',print_r($push_result,true),FILE_APPEND);	
			}

			sleep(2);
		}
	}
	

	// 5) Тестовая отладка.
	$is_cli = (PHP_SAPI === 'cli');

	echo "=== [OZON] Структура результата ===\n";
	echo $is_cli ? '' : '<pre>';
	print_r($response);
	echo $is_cli ? '' : '</pre>';

	// Вывод найденных сделок Битрикс24.
	echo "=== [BITRIX24] Сделки по posting_number (найдено: " . count($in_post_deals) . ") ===\n";
	echo $is_cli ? '' : '<pre>';
	print_r($in_post_deals);
	echo $is_cli ? '' : '</pre>';

	// Если скрипт дергают как API (как multipoint_cron.php) — отдадим JSON.
	if (!$is_cli) {
		header("Content-type: application/json; charset=utf-8");
		echo "\n" . json_encode($response, JSON_UNESCAPED_UNICODE);
	}

	ob_end_flush();
?>
