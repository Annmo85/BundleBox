<?php
	/*
	 * ozon_cron2.php
	 * ------------------------------------------------------------------
	 * Обработчик статусов заказов, отправленных через Ozon Доставку.
	 *
	 * Сценарий (обратный порядок относительно ozon_cron.php):
	 *   1) получить из Битрикс24 сделки в стадии UC_MBDY88
	 *      («Получите заказ») и собрать значения UF_CRM_1664092353750
	 *      (posting_number);
	 *   2) запросить в Ozon Доставке информацию по собранным posting_number
	 *      через /v1/posting/info и оставить только статус delivered;
	 *   3) пройти по полученным отправлениям и проверить, что posting_number
	 *      есть среди сделок; тело цикла пока пустое.
	 *
	 * Документация:
	 *   https://docs.ozon.ru/api/ozon-delivery/#tag/GetStarted
	 *   https://api-delivery.ozon.ru/v1/posting/info
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
	require_once(__DIR__ . '/crest.php');

	// Стадия сделки в Битрикс24, из которой забираем posting_number.
	$BITRIX_TARGET_STAGE = 'UC_MBDY88'; // «Получите заказ»

	// Статус отправлений Ozon Доставка, которые ищем.
	$OZON_TARGET_STATUSES = ['delivered'];
	// $OZON_TARGET_STATUSES = ['in_delivery_point'];

	// Маска posting_number Ozon: буквенно-цифровые группы через дефис,
	// например 4P9B83Y133P3-P97B. Чисто числовые значения — не posting_number.
	$OZON_POSTING_NUMBER_PATTERN = '/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+$/';

	// Размер страницы при постраничной выборке.
	$OZON_SEARCH_LIMIT = 100;

	$response = [
		'error'           => false,
		'message'         => '',
		'target_stage'    => $BITRIX_TARGET_STAGE,
		'target_statuses' => $OZON_TARGET_STATUSES,
		'token_received'  => false,
		'deals_count'     => 0,
		'postings_count'  => 0,
		'postings'        => [],
	];

	/*
	 * Шаг 1. Сделки Битрикс24 в стадии UC_MBDY88.
	 * Из каждой сделки берём posting_number из UF_CRM_1664092353750.
	 */
	$in_post_deals     = []; // все сделки в целевой стадии
	$posting_deals_map = []; // posting_number => список сделок
	$load_all_deals    = false;
	$start             = 0;

	while (!$load_all_deals) {
		$result = CRest::call('crm.deal.list', [
			'select' => ['ID', 'TITLE', 'CONTACT_ID', 'STAGE_ID', 'UF_CRM_1664092353750'],
			'filter' => [
				'STAGE_ID' => $BITRIX_TARGET_STAGE,
			],
			'start'  => $start,
		]);

		if (!empty($result['result']) && is_array($result['result'])) {
			foreach ($result['result'] as $deal) {
				$in_post_deals[] = $deal;

				$posting_number = isset($deal['UF_CRM_1664092353750'])
					? trim((string) $deal['UF_CRM_1664092353750'])
					: '';

				if (preg_match($OZON_POSTING_NUMBER_PATTERN, $posting_number)) {
					$posting_deals_map[$posting_number][] = $deal;
				}
			}
		}

		// Постраничная выборка: пауза 1 сек, чтобы не спровоцировать блокировку.
		if (isset($result['next'])) {
			$start = $result['next'];
			sleep(1);
		} else {
			$load_all_deals = true;
		}
	}

	$posting_numbers         = array_map('strval', array_keys($posting_deals_map));
	$response['deals_count'] = count($in_post_deals);

	/*
	 * Шаг 2. Ozon Доставка: отправления со статусом delivered,
	 * отфильтрованные по собранным posting_number.
	 */
	$ozon_postings = [];

	$ozon = new OzonDelivery([
		'client_id'     => $OZON_DELIVERY_CLIENT_ID,
		'client_secret' => $OZON_DELIVERY_TOKEN,
		'debug'         => false,
	]);

	if (!$ozon->hasCredentials()) {
		$response['error']   = true;
		$response['message'] = 'Токены Ozon Доставка не заполнены: проверьте bitrix24/ozon_tokens.php';
	} else {
		// Авторизация: получаем access_token.
		$access_token = $ozon->auth();

		if ($access_token === '') {
			$response['error']   = true;
			$response['message'] = 'Не удалось получить access_token Ozon Доставка';
		} elseif (!empty($posting_numbers)) {
			$response['token_received'] = true;

			// Получаем информацию по всем собранным posting_number.
			$all_postings = $ozon->infoPosting($posting_numbers, $OZON_SEARCH_LIMIT);

			// Оставляем только отправления в целевых статусах (delivered).
			foreach ($all_postings as $posting) {
				if (isset($posting['status']) && in_array($posting['status'], $OZON_TARGET_STATUSES, true)) {
					$ozon_postings[] = $posting;
				}
			}
		} else {
			$response['token_received'] = true;
		}
	}

	$response['postings']       = $ozon_postings;
	$response['postings_count'] = count($ozon_postings);

	/*
	 * Шаг 3. Идём по полученным отправлениям delivered и проверяем,
	 * что posting_number есть среди сделок, собранных на шаге 1.
	 * Тело цикла пока пустое — логику обработки добавим позже.
	 */
	$selected_postings = [];

	foreach ($ozon_postings as $posting) {
		$posting_number = isset($posting['posting_number'])
			? trim((string) $posting['posting_number'])
			: '';

		if ($posting_number === '' || !isset($posting_deals_map[$posting_number])) {
			continue;
		}

		$selected_postings[] = $posting;
		

		// обработка отправления и связанных с ним сделок.
		$deal_to_update = $posting_deals_map[$posting_number];
		if ($deal_to_update) {
			foreach($deal_to_update as $deal) {
				//Завершим
				//Сменим статус, отправим пуш
				$fields = ['STAGE_ID'=>'WON'];
				CRest::call('crm.deal.update',['id'=>$deal['ID'],"fields"=> $fields,'params'=> ["REGISTER_SONET_EVENT"=>"Y"]]);	
				//удалим кеш
				@unlink(__DIR__.'/leadscache/leads_'.$deal['CONTACT_ID'].'.json');
				@unlink(__DIR__.'/leadscache/closedleads_'.$deal['CONTACT_ID'].'.json');
				@unlink(__DIR__.'/leadscache/lead_'.$deal['ID'].'.json');				
			}
		}
		// print_r($posting_deals_map[$posting_number]);
	}


	// Тестовая отладка.
	$is_cli = (PHP_SAPI === 'cli');

	// echo "=== [OZON] Структура результата ===\n";
	// echo $is_cli ? '' : '<pre>';
	// print_r($response);
	// echo $is_cli ? '' : '</pre>';

	// // Вывод найденных сделок Битрикс24.
	// echo "=== [BITRIX24] Сделки в стадии {$BITRIX_TARGET_STAGE} (найдено: " . count($in_post_deals) . ") ===\n";
	// echo $is_cli ? '' : '<pre>';
	// print_r($in_post_deals);
	// echo $is_cli ? '' : '</pre>';

	// // Отправления delivered, для которых найдены сделки.
	// echo "=== [OZON] Отправления delivered по сделкам (найдено: " . count($selected_postings) . ") ===\n";
	// echo $is_cli ? '' : '<pre>';
	// print_r($selected_postings);
	// echo $is_cli ? '' : '</pre>';

	// Если скрипт дергают как API (как multipoint_cron.php) — отдадим JSON.
	if (!$is_cli) {
		header("Content-type: application/json; charset=utf-8");
		echo "\n" . json_encode($response, JSON_UNESCAPED_UNICODE);
	}

	ob_end_flush();
?>
