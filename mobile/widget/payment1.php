<?php

	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);
	// error_reporting(0);

	// Access-Control headers are received during OPTIONS requests
	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
			header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");         

		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
			header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
		exit;
	}

	
	require_once (__DIR__.'/../crest.php');
	
	$contact_id = (int)$_GET['id'];

	if (!$contact_id) exit;
	
	//UF_CRM_1728909809878 - идентификатор операции
	//UF_CRM_1728909836389 - ссылка на оплату в точка банке
	
	
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
	
	
	$title = "Оплата заказов ".implode(" ,",$ids1) . "[" . implode(".",$ids) . "]";
	if (isset($_GET['deal_id'])) {
		$title = "Оплата заказа ".implode(" ,",$ids1) . "[" . implode(".",$ids) . "]";
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
			// "consumerId" => $contact_id,
			"consumerId" => implode(".",$ids),
			"taxSystemCode" => "usn_income",
			"merchantId" => "200000000014733",	//!!!!!!!!!!!!
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
	  CURLOPT_URL => 'https://enter.tochka.com/uapi/acquiring/v1.0/payments_with_receipt',
	  // CURLOPT_URL => 'https://enter.tochka.com/sandbox/v2/acquiring/v1.0/payments_with_receipt',
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
		'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIwQnBodXdwd28zRjljYVhab1BwR2FVYUpUV1dNSHFMayJ9.pBeJe8Wpv5XCYFGJ5NtZxPc28pz59E2QBLE7O8ziJW5Me-7OPiQZZEbDUG0GF8hsuwkiwngkesLF84ojZY1hQYWMViEQecNkEfQj0CrvOjYeg3p9cEXzVchDbZ52ymGviKozS8WEJH-XO8wwtHqT4i49iNWRu0fPsQnRwDTv7RgBQBebkA1cpkmEJ7DhnnNQMECB9MB6ud-K2ZdTdGIlHGIGUodIrQRDyLjVYAxTf4TEUegKcu4ZLwidqg-G4HptTL0HtWDbUHoU7SIyzBmsi2Lo3lSrso4OgA3vpzzHglvib5jkWwUKUDiIGRwnzBOlojC6TWZzJlS65YaVXZihXit1owPKMmeE6VOlzFnskWCfW0RydwPZluqsy55SGlBleB3uBRQCJBH6-zCeKyMzIo7FYIFtzp_jgS2XgYVfm1ccUemnm2tjDfNHOcOw96lrHViDmOmBqj4sSfgrTNCg2qCLgD8xXVK9dlvOOqAxiF2j7QRv7uayha2vGg8NK1od',
		
		//Песочница
		// 'Authorization: Bearer working_token',
		'Content-Type: application/json'
	  ),
	));

	$response = json_decode(curl_exec($curl), true);

	curl_close($curl);
	
	if (isset($response['Data']['paymentLink'])) {
		// header('Location: '.$response['Data']['paymentLink']);
		
		//Теперь проставим ссылки на операцию у сделки
		$fields = ['UF_CRM_1728909809878'=>$response['Data']['operationId'],'UF_CRM_1728909836389'=>$response['Data']['paymentLink']];
		foreach ($result['result'] as $lead) {
			CRest::call('crm.deal.update',['id'=>$lead['ID'],"fields"=> $fields, 'params'=> ["REGISTER_SONET_EVENT"=>"Y"]]);	
			
		};
		file_put_contents(__DIR__.'/1114.log',print_r($response,true),FILE_APPEND);
		header('Location: '.$response['Data']['paymentLink']);			
		
	} else {
		header('Location: '.$pay_data['Data']['failRedirectUrl']);
		
	}
	
	// print_r($response);	
	
	//https://bundlebox.ru/mobile/widget/payment1.php?id=2415&deal_id=40203
	
	//client_id 0Bphuwpwo3F9caXZoPpGaUaJTWWMHqLk
	
	//key eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIwQnBodXdwd28zRjljYVhab1BwR2FVYUpUV1dNSHFMayJ9.pBeJe8Wpv5XCYFGJ5NtZxPc28pz59E2QBLE7O8ziJW5Me-7OPiQZZEbDUG0GF8hsuwkiwngkesLF84ojZY1hQYWMViEQecNkEfQj0CrvOjYeg3p9cEXzVchDbZ52ymGviKozS8WEJH-XO8wwtHqT4i49iNWRu0fPsQnRwDTv7RgBQBebkA1cpkmEJ7DhnnNQMECB9MB6ud-K2ZdTdGIlHGIGUodIrQRDyLjVYAxTf4TEUegKcu4ZLwidqg-G4HptTL0HtWDbUHoU7SIyzBmsi2Lo3lSrso4OgA3vpzzHglvib5jkWwUKUDiIGRwnzBOlojC6TWZzJlS65YaVXZihXit1owPKMmeE6VOlzFnskWCfW0RydwPZluqsy55SGlBleB3uBRQCJBH6-zCeKyMzIo7FYIFtzp_jgS2XgYVfm1ccUemnm2tjDfNHOcOw96lrHViDmOmBqj4sSfgrTNCg2qCLgD8xXVK9dlvOOqAxiF2j7QRv7uayha2vGg8NK1od
	
	//Получение ключей
	// curl --location --globoff 'https://enter.tochka.com/uapi/open-banking/v1.0/customers'  --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIwQnBodXdwd28zRjljYVhab1BwR2FVYUpUV1dNSHFMayJ9.pBeJe8Wpv5XCYFGJ5NtZxPc28pz59E2QBLE7O8ziJW5Me-7OPiQZZEbDUG0GF8hsuwkiwngkesLF84ojZY1hQYWMViEQecNkEfQj0CrvOjYeg3p9cEXzVchDbZ52ymGviKozS8WEJH-XO8wwtHqT4i49iNWRu0fPsQnRwDTv7RgBQBebkA1cpkmEJ7DhnnNQMECB9MB6ud-K2ZdTdGIlHGIGUodIrQRDyLjVYAxTf4TEUegKcu4ZLwidqg-G4HptTL0HtWDbUHoU7SIyzBmsi2Lo3lSrso4OgA3vpzzHglvib5jkWwUKUDiIGRwnzBOlojC6TWZzJlS65YaVXZihXit1owPKMmeE6VOlzFnskWCfW0RydwPZluqsy55SGlBleB3uBRQCJBH6-zCeKyMzIo7FYIFtzp_jgS2XgYVfm1ccUemnm2tjDfNHOcOw96lrHViDmOmBqj4sSfgrTNCg2qCLgD8xXVK9dlvOOqAxiF2j7QRv7uayha2vGg8NK1od'
	// Получение мерчанта из кастомера
	// curl --location --globoff 'https://enter.tochka.com/uapi/acquiring/v1.0/retailers?customerCode=304563846'  --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIwQnBodXdwd28zRjljYVhab1BwR2FVYUpUV1dNSHFMayJ9.pBeJe8Wpv5XCYFGJ5NtZxPc28pz59E2QBLE7O8ziJW5Me-7OPiQZZEbDUG0GF8hsuwkiwngkesLF84ojZY1hQYWMViEQecNkEfQj0CrvOjYeg3p9cEXzVchDbZ52ymGviKozS8WEJH-XO8wwtHqT4i49iNWRu0fPsQnRwDTv7RgBQBebkA1cpkmEJ7DhnnNQMECB9MB6ud-K2ZdTdGIlHGIGUodIrQRDyLjVYAxTf4TEUegKcu4ZLwidqg-G4HptTL0HtWDbUHoU7SIyzBmsi2Lo3lSrso4OgA3vpzzHglvib5jkWwUKUDiIGRwnzBOlojC6TWZzJlS65YaVXZihXit1owPKMmeE6VOlzFnskWCfW0RydwPZluqsy55SGlBleB3uBRQCJBH6-zCeKyMzIo7FYIFtzp_jgS2XgYVfm1ccUemnm2tjDfNHOcOw96lrHViDmOmBqj4sSfgrTNCg2qCLgD8xXVK9dlvOOqAxiF2j7QRv7uayha2vGg8NK1od'
	
	//установка хуков prod, делает один раз
	// curl -g --request PUT 'https://enter.tochka.com/uapi/webhook/v1.0/0Bphuwpwo3F9caXZoPpGaUaJTWWMHqLk' \
// --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIwQnBodXdwd28zRjljYVhab1BwR2FVYUpUV1dNSHFMayJ9.pBeJe8Wpv5XCYFGJ5NtZxPc28pz59E2QBLE7O8ziJW5Me-7OPiQZZEbDUG0GF8hsuwkiwngkesLF84ojZY1hQYWMViEQecNkEfQj0CrvOjYeg3p9cEXzVchDbZ52ymGviKozS8WEJH-XO8wwtHqT4i49iNWRu0fPsQnRwDTv7RgBQBebkA1cpkmEJ7DhnnNQMECB9MB6ud-K2ZdTdGIlHGIGUodIrQRDyLjVYAxTf4TEUegKcu4ZLwidqg-G4HptTL0HtWDbUHoU7SIyzBmsi2Lo3lSrso4OgA3vpzzHglvib5jkWwUKUDiIGRwnzBOlojC6TWZzJlS65YaVXZihXit1owPKMmeE6VOlzFnskWCfW0RydwPZluqsy55SGlBleB3uBRQCJBH6-zCeKyMzIo7FYIFtzp_jgS2XgYVfm1ccUemnm2tjDfNHOcOw96lrHViDmOmBqj4sSfgrTNCg2qCLgD8xXVK9dlvOOqAxiF2j7QRv7uayha2vGg8NK1od' \
// --header 'Content-Type: application/json' \
// --data-raw '{
        // "webhooksList": ["incomingPayment","incomingSbpPayment","acquiringInternetPayment"],
        // "url": "https://bundlebox.ru/mobile/widget/payment_callback_tochka.php"
// }'



// curl -g --request GET 'https://enter.tochka.com/uapi/webhook/v1.0/0Bphuwpwo3F9caXZoPpGaUaJTWWMHqLk' \
// --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIwQnBodXdwd28zRjljYVhab1BwR2FVYUpUV1dNSHFMayJ9.pBeJe8Wpv5XCYFGJ5NtZxPc28pz59E2QBLE7O8ziJW5Me-7OPiQZZEbDUG0GF8hsuwkiwngkesLF84ojZY1hQYWMViEQecNkEfQj0CrvOjYeg3p9cEXzVchDbZ52ymGviKozS8WEJH-XO8wwtHqT4i49iNWRu0fPsQnRwDTv7RgBQBebkA1cpkmEJ7DhnnNQMECB9MB6ud-K2ZdTdGIlHGIGUodIrQRDyLjVYAxTf4TEUegKcu4ZLwidqg-G4HptTL0HtWDbUHoU7SIyzBmsi2Lo3lSrso4OgA3vpzzHglvib5jkWwUKUDiIGRwnzBOlojC6TWZzJlS65YaVXZihXit1owPKMmeE6VOlzFnskWCfW0RydwPZluqsy55SGlBleB3uBRQCJBH6-zCeKyMzIo7FYIFtzp_jgS2XgYVfm1ccUemnm2tjDfNHOcOw96lrHViDmOmBqj4sSfgrTNCg2qCLgD8xXVK9dlvOOqAxiF2j7QRv7uayha2vGg8NK1od' 

	
	// //установка хуков sandbox, делает один раз
	// curl -g --request PUT 'https://enter.tochka.com/uapi/webhook/v1.0/0Bphuwpwo3F9caXZoPpGaUaJTWWMHqLk' 	--header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIwQnBodXdwd28zRjljYVhab1BwR2FVYUpUV1dNSHFMayJ9.pBeJe8Wpv5XCYFGJ5NtZxPc28pz59E2QBLE7O8ziJW5Me-7OPiQZZEbDUG0GF8hsuwkiwngkesLF84ojZY1hQYWMViEQecNkEfQj0CrvOjYeg3p9cEXzVchDbZ52ymGviKozS8WEJH-XO8wwtHqT4i49iNWRu0fPsQnRwDTv7RgBQBebkA1cpkmEJ7DhnnNQMECB9MB6ud-K2ZdTdGIlHGIGUodIrQRDyLjVYAxTf4TEUegKcu4ZLwidqg-G4HptTL0HtWDbUHoU7SIyzBmsi2Lo3lSrso4OgA3vpzzHglvib5jkWwUKUDiIGRwnzBOlojC6TWZzJlS65YaVXZihXit1owPKMmeE6VOlzFnskWCfW0RydwPZluqsy55SGlBleB3uBRQCJBH6-zCeKyMzIo7FYIFtzp_jgS2XgYVfm1ccUemnm2tjDfNHOcOw96lrHViDmOmBqj4sSfgrTNCg2qCLgD8xXVK9dlvOOqAxiF2j7QRv7uayha2vGg8NK1od' 	--header 'Content-Type: application/json' 	--data-raw '{        "webhooksList": ["incomingPayment","incomingSbpPayment","acquiringInternetPayment"],        "url": "https://bundlebox.ru/mobile/widget/payment_callback_tochka.php"}'

	//Проверка вебзука
// curl -g --request POST 'https://enter.tochka.com/uapi/webhook/v1.0/0Bphuwpwo3F9caXZoPpGaUaJTWWMHqLk/test_send' \
// --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIwQnBodXdwd28zRjljYVhab1BwR2FVYUpUV1dNSHFMayJ9.pBeJe8Wpv5XCYFGJ5NtZxPc28pz59E2QBLE7O8ziJW5Me-7OPiQZZEbDUG0GF8hsuwkiwngkesLF84ojZY1hQYWMViEQecNkEfQj0CrvOjYeg3p9cEXzVchDbZ52ymGviKozS8WEJH-XO8wwtHqT4i49iNWRu0fPsQnRwDTv7RgBQBebkA1cpkmEJ7DhnnNQMECB9MB6ud-K2ZdTdGIlHGIGUodIrQRDyLjVYAxTf4TEUegKcu4ZLwidqg-G4HptTL0HtWDbUHoU7SIyzBmsi2Lo3lSrso4OgA3vpzzHglvib5jkWwUKUDiIGRwnzBOlojC6TWZzJlS65YaVXZihXit1owPKMmeE6VOlzFnskWCfW0RydwPZluqsy55SGlBleB3uBRQCJBH6-zCeKyMzIo7FYIFtzp_jgS2XgYVfm1ccUemnm2tjDfNHOcOw96lrHViDmOmBqj4sSfgrTNCg2qCLgD8xXVK9dlvOOqAxiF2j7QRv7uayha2vGg8NK1od' \
// --header 'Content-Type: application/json' \
// --data-raw '{
        // "webhookType": "incomingPayment"
// }'
	
	
	// curl --location --globoff 'https://enter.tochka.com/uapi/acquiring/v1.0/payments/4b9b7557-51a0-49d8-8293-760c653b76d7' \
// --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIwQnBodXdwd28zRjljYVhab1BwR2FVYUpUV1dNSHFMayJ9.pBeJe8Wpv5XCYFGJ5NtZxPc28pz59E2QBLE7O8ziJW5Me-7OPiQZZEbDUG0GF8hsuwkiwngkesLF84ojZY1hQYWMViEQecNkEfQj0CrvOjYeg3p9cEXzVchDbZ52ymGviKozS8WEJH-XO8wwtHqT4i49iNWRu0fPsQnRwDTv7RgBQBebkA1cpkmEJ7DhnnNQMECB9MB6ud-K2ZdTdGIlHGIGUodIrQRDyLjVYAxTf4TEUegKcu4ZLwidqg-G4HptTL0HtWDbUHoU7SIyzBmsi2Lo3lSrso4OgA3vpzzHglvib5jkWwUKUDiIGRwnzBOlojC6TWZzJlS65YaVXZihXit1owPKMmeE6VOlzFnskWCfW0RydwPZluqsy55SGlBleB3uBRQCJBH6-zCeKyMzIo7FYIFtzp_jgS2XgYVfm1ccUemnm2tjDfNHOcOw96lrHViDmOmBqj4sSfgrTNCg2qCLgD8xXVK9dlvOOqAxiF2j7QRv7uayha2vGg8NK1od'


// curl -g --request GET 'https://enter.tochka.com/uapi/sbp/v1.0/qr-codes/AD20005RTK7EU4JI88EPO09KNMMA922U/payment-status' \
// --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIwQnBodXdwd28zRjljYVhab1BwR2FVYUpUV1dNSHFMayJ9.pBeJe8Wpv5XCYFGJ5NtZxPc28pz59E2QBLE7O8ziJW5Me-7OPiQZZEbDUG0GF8hsuwkiwngkesLF84ojZY1hQYWMViEQecNkEfQj0CrvOjYeg3p9cEXzVchDbZ52ymGviKozS8WEJH-XO8wwtHqT4i49iNWRu0fPsQnRwDTv7RgBQBebkA1cpkmEJ7DhnnNQMECB9MB6ud-K2ZdTdGIlHGIGUodIrQRDyLjVYAxTf4TEUegKcu4ZLwidqg-G4HptTL0HtWDbUHoU7SIyzBmsi2Lo3lSrso4OgA3vpzzHglvib5jkWwUKUDiIGRwnzBOlojC6TWZzJlS65YaVXZihXit1owPKMmeE6VOlzFnskWCfW0RydwPZluqsy55SGlBleB3uBRQCJBH6-zCeKyMzIo7FYIFtzp_jgS2XgYVfm1ccUemnm2tjDfNHOcOw96lrHViDmOmBqj4sSfgrTNCg2qCLgD8xXVK9dlvOOqAxiF2j7QRv7uayha2vGg8NK1od'

?>
