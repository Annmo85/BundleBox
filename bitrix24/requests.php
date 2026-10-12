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

	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata,true);
	
	$months = [
		"1" => "января", 
		"2" => "февраля",
		"3" => "марта",
		"4" => "апреля",
		"5" => "мая",
		"6" => "июня",
		"7" => "июля",
		"8" => "августа",
		"9" => "сентября",
		"10" => "октября",
		"11" => "ноября",
		"12" => "декабря",
	];

	require_once (__DIR__.'/crest.php');

	
	if (isset($request['id'])) {
	
		$response = ['leads'=>[]];
		$response['request'] = ["ID"=>$request['id']];
	

		$users=[];
		$response['leads'] = [];
		$result = CRest::call(
			'crm.lead.list',
			[
			
				'filter' => [
					'CONTACT_ID' => $request['id']
				],
				'select' => [
					'*',
					'UF_*',
				]
			]
		);
		foreach ($result['result'] as $lead) {
			$dt = strtotime($lead['DATE_CREATE']);
			$date = date("j",$dt).' '.$months[date('n',$dt)].' '.date("Y",$dt).' г. '.date("H:i",$dt);
			$item = [
				"IMAGES" => [],
				"DATE" => $date,
				"URL" =>$lead['UF_CRM_1724510548758'],
				"ATTRUBUTES" =>$lead['UF_CRM_1724510575518'],
				"ADDITIONAL" =>$lead['UF_CRM_1724510595229'],
				"PRICE" =>$lead['UF_CRM_1724510639598'],
				"QTY" =>$lead['UF_CRM_1724510618350'],
			];
			
			$files = glob($_SERVER['DOCUMENT_ROOT'] . '/mobile/user_orders/lead_'.$lead['ID'].'_*.*');
			foreach($files as $file) {
				$item['IMAGES'][] = "https://bundlebox.ru/mobile/user_orders/".basename($file);
				// $item['IMAGES'][] = "https://bundlebox.ru/mobile/user_orders/".basename($file);
				// $item['IMAGES'][] = "https://bundlebox.ru/mobile/user_orders/".basename($file);
			}
			$response['leads'][] = $item;
		}
		
		header("Content-type: application/json; charset=utf-8");	
		echo json_encode($response);

		//Сохраним
		$jsonString = json_encode($response, JSON_PRETTY_PRINT);
		$fp = fopen(__DIR__.'/leadscache/requests_'.$request['id'].'.json', 'w');
		fwrite($fp, $jsonString);
		fclose($fp);

		
	} else {
		
		header("Content-type: application/json; charset=utf-8");
		//echo json_encode($result);
		//echo json_encode(['error'=>true, 'message'=>'Некорректный запрос!']);
		
		$bbx_actions = $helperClass->get_actions();
		$response["actions"] = $bbx_actions;
		$response["badge_count_2"] = count($bbx_actions);
		
		header("Content-type: application/json; charset=utf-8");	
		echo json_encode($response);
		
	}
?>

