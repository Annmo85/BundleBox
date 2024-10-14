<?php

	// Access-Control headers are received during OPTIONS requests
	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
			header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");         

		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
			header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
		exit;
	}
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);
	// error_reporting(0);
	
	require_once (__DIR__.'/../crest.php');
	
	$contact_id = (int)$_GET['id'];

	if (!$contact_id) exit;
	
	
	//Выбеерем сделки на оплату
	(float)$summ = 0;
	$ids = [];
	$ids1 = [];

	if (isset($_GET['deal_id'])) {
		$result = CRest::call('crm.deal.list',['select'=>['*','UF_CRM_1652413077471','UF_CRM_1670510435755','UF_CRM_1670510894504','UF_CRM_1663669969647','UF_CRM_1663669994797','UF_CRM_1659879523001','UF_CRM_1664092353750','UF_CRM_1668785031029','UF_CRM_1668784831705','UF_CRM_1668721376367','UF_CRM_1659879763963'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['CONTACT_ID' => $contact_id, 'STAGE_ID'=>"PREPARATION","ID"=>$_GET['deal_id']]]);	
	} else {
		$result = CRest::call('crm.deal.list',['select'=>['*','UF_CRM_1652413077471','UF_CRM_1670510435755','UF_CRM_1670510894504','UF_CRM_1663669969647','UF_CRM_1663669994797','UF_CRM_1659879523001','UF_CRM_1664092353750','UF_CRM_1668785031029','UF_CRM_1668784831705','UF_CRM_1668721376367','UF_CRM_1659879763963'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['CONTACT_ID' => $contact_id, 'STAGE_ID'=>"PREPARATION"]]);	
		
	}

	$result1 = CRest::call('crm.contact.get',[ "id"=> $contact_id]);
	$user = $result1['result'];
	$email = "";
	$phone = "";
	if ($user['HAS_EMAIL']=='Y') $email = $user['EMAIL'][0]['VALUE']; else $email='';
	
	//phone
	if (isset($user['PHONE'][0]['VALUE'])) $phone = $user['PHONE'][0]['VALUE'];	
	
	
	foreach ($result['result'] as $lead) {
		
		$summ += (float)$lead["OPPORTUNITY"];
		$ids[]=$lead["ID"];
		$ids1[]="#".$lead["TITLE"];
	}
	
	
	$title = "Оплата заказов ".implode(" ,",$ids1);
	if (isset($_GET['deal_id'])) {
		$title = "Оплата заказа ".implode(" ,",$ids1);
	}
	

	$pay_data = [
		"Data" => [
			"customerCode" => "304563846",
			"amount" => $summ,
			"purpose" => $title,
			"redirectUrl" => "https://bundlebox.ru/mobile/widget/delivery_done.php",
			"failRedirectUrl" => "https://bundlebox.ru/mobile/widget/delivery_fail.php",
			"paymentMode" => ["sbp", "card"],
			"saveCard" => false,
			"consumerId" => $contact_id,
			"taxSystemCode" => "usn_income",
			"merchantId" => "200000000014531",	//!!!!!!!!!!!!
			"Client" => [
				"email" => $email,
				"phone" => str_replace("+","",$phone),
			],
			"Items" => [
				[
					"vatType" => "none",
					"name" => $title,
					"amount" => $summ,
					"quantity" => 1,
					"paymentMethod" => "full_payment",
					"paymentObject" => "service",
					"measure" => "шт.",
				],
			],
		],
	];
	
	// print_r($pay_data);
	
	$curl = curl_init();

	curl_setopt_array($curl, array(
	  // CURLOPT_URL => 'https://enter.tochka.com/uapi/acquiring/v1.0/payments_with_receipt',
	  CURLOPT_URL => 'https://enter.tochka.com/sandbox/v2/acquiring/v1.0/payments_with_receipt',
	  CURLOPT_RETURNTRANSFER => true,
	  CURLOPT_ENCODING => '',
	  CURLOPT_MAXREDIRS => 10,
	  CURLOPT_TIMEOUT => 0,
	  CURLOPT_FOLLOWLOCATION => true,
	  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	  CURLOPT_CUSTOMREQUEST => 'POST',
	  CURLOPT_POSTFIELDS =>json_encode($pay_data),
	  CURLOPT_HTTPHEADER => array(
		
		// Рабочий
		// 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJaUUtKYU1RNkNvVERGZTJaVDZxY1ZWdUo0TjNOWk1jeiJ9.mEInKJLu5GL746bQ_N_HPrgKs8h16QVJDQIBNVhL8jfNSQra__RDyMexqVKLAL5eLMT9gJZ6a0PlDyytfyuErSaeaYaWdbjDukv9JyuB_Fwea2MZdHbupTuu9WH_0OxuQ01QOgmbckrn4P8R0vLS6dNpeW1pq5pdK91DvpwCcskBNe5P0PBKdrsDVaDZCOEZU2zDDUJWcD3y0VZGbrF370luOdYPzpajl6hTnPYBDJBE03jVY6dLGQhL8BKKTm5s6hQDvuvdzK1lnsGSYqid3NMP_yXU7T6F6GD48SlO2QMjvPtJ78EgZ81F1KiqTfN9Ms5-DibQn1ZKLRlXaB9dVEjwjmWmJgpIqo5kOht5k6nhQUt9SojFn8hNsCLH7xXmGQ3Jk6oKiflDAFf4utsDKh403d_kUrnjImg9clOyPplME_sLppgTjAqLk6ErOTbsqXJOLeEEZMiBLGulTCURHcuUVp91D--vKrZdTZOy4CNEJi-C1D4GdWUPLa3DR8Ur',
		
		//Песочница
		'Authorization: Bearer working_token',
		'Content-Type: application/json'
	  ),
	));

	$response = json_decode(curl_exec($curl), true);

	curl_close($curl);
	print_r($response);	
	
	//client_id ZQKJaMQ6CoTDFe2ZT6qcVVuJ4N3NZMcz
	//key eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJaUUtKYU1RNkNvVERGZTJaVDZxY1ZWdUo0TjNOWk1jeiJ9.mEInKJLu5GL746bQ_N_HPrgKs8h16QVJDQIBNVhL8jfNSQra__RDyMexqVKLAL5eLMT9gJZ6a0PlDyytfyuErSaeaYaWdbjDukv9JyuB_Fwea2MZdHbupTuu9WH_0OxuQ01QOgmbckrn4P8R0vLS6dNpeW1pq5pdK91DvpwCcskBNe5P0PBKdrsDVaDZCOEZU2zDDUJWcD3y0VZGbrF370luOdYPzpajl6hTnPYBDJBE03jVY6dLGQhL8BKKTm5s6hQDvuvdzK1lnsGSYqid3NMP_yXU7T6F6GD48SlO2QMjvPtJ78EgZ81F1KiqTfN9Ms5-DibQn1ZKLRlXaB9dVEjwjmWmJgpIqo5kOht5k6nhQUt9SojFn8hNsCLH7xXmGQ3Jk6oKiflDAFf4utsDKh403d_kUrnjImg9clOyPplME_sLppgTjAqLk6ErOTbsqXJOLeEEZMiBLGulTCURHcuUVp91D--vKrZdTZOy4CNEJi-C1D4GdWUPLa3DR8Ur
	
	//Получение ключей
	//curl --location --globoff 'https://enter.tochka.com/uapi/open-banking/v1.0/customers'  --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJaUUtKYU1RNkNvVERGZTJaVDZxY1ZWdUo0TjNOWk1jeiJ9.mEInKJLu5GL746bQ_N_HPrgKs8h16QVJDQIBNVhL8jfNSQra__RDyMexqVKLAL5eLMT9gJZ6a0PlDyytfyuErSaeaYaWdbjDukv9JyuB_Fwea2MZdHbupTuu9WH_0OxuQ01QOgmbckrn4P8R0vLS6dNpeW1pq5pdK91DvpwCcskBNe5P0PBKdrsDVaDZCOEZU2zDDUJWcD3y0VZGbrF370luOdYPzpajl6hTnPYBDJBE03jVY6dLGQhL8BKKTm5s6hQDvuvdzK1lnsGSYqid3NMP_yXU7T6F6GD48SlO2QMjvPtJ78EgZ81F1KiqTfN9Ms5-DibQn1ZKLRlXaB9dVEjwjmWmJgpIqo5kOht5k6nhQUt9SojFn8hNsCLH7xXmGQ3Jk6oKiflDAFf4utsDKh403d_kUrnjImg9clOyPplME_sLppgTjAqLk6ErOTbsqXJOLeEEZMiBLGulTCURHcuUVp91D--vKrZdTZOy4CNEJi-C1D4GdWUPLa3DR8Ur'
	//Получение мерчанта из кастомера
	//curl --location --globoff 'https://enter.tochka.com/uapi/acquiring/v1.0/retailers?customerCode=304563846'  --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJaUUtKYU1RNkNvVERGZTJaVDZxY1ZWdUo0TjNOWk1jeiJ9.mEInKJLu5GL746bQ_N_HPrgKs8h16QVJDQIBNVhL8jfNSQra__RDyMexqVKLAL5eLMT9gJZ6a0PlDyytfyuErSaeaYaWdbjDukv9JyuB_Fwea2MZdHbupTuu9WH_0OxuQ01QOgmbckrn4P8R0vLS6dNpeW1pq5pdK91DvpwCcskBNe5P0PBKdrsDVaDZCOEZU2zDDUJWcD3y0VZGbrF370luOdYPzpajl6hTnPYBDJBE03jVY6dLGQhL8BKKTm5s6hQDvuvdzK1lnsGSYqid3NMP_yXU7T6F6GD48SlO2QMjvPtJ78EgZ81F1KiqTfN9Ms5-DibQn1ZKLRlXaB9dVEjwjmWmJgpIqo5kOht5k6nhQUt9SojFn8hNsCLH7xXmGQ3Jk6oKiflDAFf4utsDKh403d_kUrnjImg9clOyPplME_sLppgTjAqLk6ErOTbsqXJOLeEEZMiBLGulTCURHcuUVp91D--vKrZdTZOy4CNEJi-C1D4GdWUPLa3DR8Ur'
	
	//установка хуков prod, делает один раз
	// curl -g --request PUT 'https://enter.tochka.com/uapi/webhook/v1.0/ZQKJaMQ6CoTDFe2ZT6qcVVuJ4N3NZMcz' \
// --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJaUUtKYU1RNkNvVERGZTJaVDZxY1ZWdUo0TjNOWk1jeiJ9.mEInKJLu5GL746bQ_N_HPrgKs8h16QVJDQIBNVhL8jfNSQra__RDyMexqVKLAL5eLMT9gJZ6a0PlDyytfyuErSaeaYaWdbjDukv9JyuB_Fwea2MZdHbupTuu9WH_0OxuQ01QOgmbckrn4P8R0vLS6dNpeW1pq5pdK91DvpwCcskBNe5P0PBKdrsDVaDZCOEZU2zDDUJWcD3y0VZGbrF370luOdYPzpajl6hTnPYBDJBE03jVY6dLGQhL8BKKTm5s6hQDvuvdzK1lnsGSYqid3NMP_yXU7T6F6GD48SlO2QMjvPtJ78EgZ81F1KiqTfN9Ms5-DibQn1ZKLRlXaB9dVEjwjmWmJgpIqo5kOht5k6nhQUt9SojFn8hNsCLH7xXmGQ3Jk6oKiflDAFf4utsDKh403d_kUrnjImg9clOyPplME_sLppgTjAqLk6ErOTbsqXJOLeEEZMiBLGulTCURHcuUVp91D--vKrZdTZOy4CNEJi-C1D4GdWUPLa3DR8Ur' \
// --header 'Content-Type: application/json' \
// --data-raw '{
        // "webhooksList": ["incomingPayment","incomingSbpPayment","acquiringInternetPayment"],
        // "url": "https://bundlebox.ru/mobile/widget/payment_callback_tochka.php"
// }'



	
	//установка хуков sandbox, делает один раз
	curl -g --request PUT 'https://enter.tochka.com/uapi/webhook/v1.0/ZQKJaMQ6CoTDFe2ZT6qcVVuJ4N3NZMcz' 
	--header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJaUUtKYU1RNkNvVERGZTJaVDZxY1ZWdUo0TjNOWk1jeiJ9.mEInKJLu5GL746bQ_N_HPrgKs8h16QVJDQIBNVhL8jfNSQra__RDyMexqVKLAL5eLMT9gJZ6a0PlDyytfyuErSaeaYaWdbjDukv9JyuB_Fwea2MZdHbupTuu9WH_0OxuQ01QOgmbckrn4P8R0vLS6dNpeW1pq5pdK91DvpwCcskBNe5P0PBKdrsDVaDZCOEZU2zDDUJWcD3y0VZGbrF370luOdYPzpajl6hTnPYBDJBE03jVY6dLGQhL8BKKTm5s6hQDvuvdzK1lnsGSYqid3NMP_yXU7T6F6GD48SlO2QMjvPtJ78EgZ81F1KiqTfN9Ms5-DibQn1ZKLRlXaB9dVEjwjmWmJgpIqo5kOht5k6nhQUt9SojFn8hNsCLH7xXmGQ3Jk6oKiflDAFf4utsDKh403d_kUrnjImg9clOyPplME_sLppgTjAqLk6ErOTbsqXJOLeEEZMiBLGulTCURHcuUVp91D--vKrZdTZOy4CNEJi-C1D4GdWUPLa3DR8Ur' 
	--header 'Content-Type: application/json' 
	--data-raw '{        "webhooksList": ["incomingPayment","incomingSbpPayment","acquiringInternetPayment"],        "url": "https://bundlebox.ru/mobile/widget/payment_callback_tochka.php"}'

	//Проверка вебзука
curl -g --request POST 'https://enter.tochka.com/uapi/webhook/v1.0/ZQKJaMQ6CoTDFe2ZT6qcVVuJ4N3NZMcz/test_send' \
--header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJaUUtKYU1RNkNvVERGZTJaVDZxY1ZWdUo0TjNOWk1jeiJ9.mEInKJLu5GL746bQ_N_HPrgKs8h16QVJDQIBNVhL8jfNSQra__RDyMexqVKLAL5eLMT9gJZ6a0PlDyytfyuErSaeaYaWdbjDukv9JyuB_Fwea2MZdHbupTuu9WH_0OxuQ01QOgmbckrn4P8R0vLS6dNpeW1pq5pdK91DvpwCcskBNe5P0PBKdrsDVaDZCOEZU2zDDUJWcD3y0VZGbrF370luOdYPzpajl6hTnPYBDJBE03jVY6dLGQhL8BKKTm5s6hQDvuvdzK1lnsGSYqid3NMP_yXU7T6F6GD48SlO2QMjvPtJ78EgZ81F1KiqTfN9Ms5-DibQn1ZKLRlXaB9dVEjwjmWmJgpIqo5kOht5k6nhQUt9SojFn8hNsCLH7xXmGQ3Jk6oKiflDAFf4utsDKh403d_kUrnjImg9clOyPplME_sLppgTjAqLk6ErOTbsqXJOLeEEZMiBLGulTCURHcuUVp91D--vKrZdTZOy4CNEJi-C1D4GdWUPLa3DR8Ur' \
--header 'Content-Type: application/json' \
--data-raw '{
        "webhookType": "incomingPayment"
}'
	

?>
