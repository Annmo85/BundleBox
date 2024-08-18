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
	error_reporting(0);

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

	//Номер отгрузки
	//поле UF_CRM_1664092353750
	
	//нужный статус
	//UC_H3ZYIB
	
	//следующий статус
	//UC_MBDY88
	
	//Штрихкод
	//UF_CRM_1668721376367
	
	//Клиент из мультипоинта
	//UF_CRM_1668784831705
	
	//К оплате (мультипоинт)
	//UF_CRM_1668785031029		
	
	
	//Внешний трек - видимый
	//UF_CRM_1681845692836	

	$files_field = "UF_CRM_1650939466873";
	$files_field_id = "213";

	if (isset($request['order_id']) && isset($request['user_id'])) {

		$response = ['deal'=>[]];
		$response['request'] = ["user_id"=>$request['user_id'], "order_id"=>$request['order_id']];


		//Глянем в кеш
		if (!$response['force']) {
			if (file_exists(__DIR__.'/leadscache/lead_'.$request['order_id'].'.json')) {
				$jsonString = file_get_contents(__DIR__.'/leadscache/lead_'.$request['order_id'].'.json');
				$response = json_decode($jsonString, true);
				
				
				if ($response === null && json_last_error() !== JSON_ERROR_NONE) {
				   //echo "json data is incorrect";
				} else {
					$response['cache'] = true;			
					header("Content-type: application/json; charset=utf-8");	
					echo json_encode($response);
					exit;
				}
			}
		}

		require_once (__DIR__.'/crest.php');


		$reviews =[];
		$mysqli = mysqli_connect("localhost", "annamonh_prod", "12345678");
		if ($mysqli == false){
			$response['mysql_error'] = "Ошибка: Невозможно подключиться к MySQL " . mysqli_connect_error();
		} else {
			mysqli_select_db($mysqli, "annamonh_prod");
			$mysqli->set_charset('utf8'); 
			$response['mysql_error'] = false;

			//Получим отзывы этого пользователя
			$sql = "select * from main_comments where bitrix_user_id=".(int)$request['user_id'];
			if ($result = $mysqli->query($sql)) { 
				while($obj = $result->fetch_assoc()){ 
					$reviews[strtolower($obj['order_id'])] = $obj; 
				} 
				$result->close();			
			}
			
			
		}
		$directions = [];

		if (file_exists(__DIR__.'/leadscache/statuses_full.json')) {
			$jsonString = file_get_contents(__DIR__.'/leadscache/statuses_full.json');
			$directions = json_decode($jsonString, true);
		} else {
			$directions_result = CRest::call('crm.status.list',['filter' => ['ENTITY_ID' => 'DEAL_STAGE']]);
			foreach($directions_result['result'] as $d) {
				$directions[$d['STATUS_ID']] = $d;
			}
			// Convert JSON data from an array to a string
			$jsonString = json_encode($directions, JSON_PRETTY_PRINT);
			// Write in the file
			$fp = fopen(__DIR__.'/leadscache/statuses_full.json', 'w');
			fwrite($fp, $jsonString);
			fclose($fp);			
			sleep(1);
		}

			
		$response['reviews'] = $reviews;
		$response['directions'] = $directions;


		$users=[];
		$result = CRest::call('crm.deal.list',['select'=>['*','UF_CRM_1663669969647','UF_CRM_1664092353750','UF_CRM_1668785031029','UF_CRM_1681845692836','UF_CRM_1670510435755','UF_CRM_1670510894504','UF_CRM_1668784831705','UF_CRM_1668721376367','UF_CRM_1652413077471','UF_CRM_1659879523001','UF_CRM_1663669994797','UF_CRM_1659879763963'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['ID'=>$request['order_id'],'CONTACT_ID' => $request['user_id']]]);
		foreach ($result['result'] as $lead) {

				$user_result = CRest::call('crm.contact.get',[ "id"=> $lead['CONTACT_ID']]);
				$response['contact'] = $user_result['result'];

				$dt = strtotime($lead['DATE_CREATE']);

				$date = date("j",$dt).' '.$months[date('n',$dt)].' '.date("Y",$dt).' г.';

				$lead_title = trim($lead['TITLE']);
				$lead_title = str_replace("\t"," ",$lead_title);

				$parts = array_filter(explode(' ',$lead_title));
				$num = array_pop($parts);
				$store = implode(' ',$parts);

				$stage = $directions[$lead['STAGE_ID']]['NAME'];

				//UF_CRM_1659879523001 - статус зарегестрировано в рф
				//UF_CRM_1659879763963 - статус передано в доставку
				//UF_CRM_1652413077471 - тракномер
						//UF_CRM_1652413077471 - тракномер
		//UF_CRM_1663669969647 - вес
		//UF_CRM_1663669994797 - стоимость
				if ($lead['STAGE_ID']==='UC_DQZUKA') {
					if ($lead['UF_CRM_1652413077471']!='') $stage = "Посылка отправлена";
					if ($lead['UF_CRM_1659879523001']!='') $stage = "Транзит Москва";
					if ($lead['UF_CRM_1659879763963']!='') $stage = "На днях придет";
				}
				
				// $payement_order_image = "https://bundlebox.ru/mobile/close_order.png";
				// $payement_delivery_image = "https://bundlebox.ru/mobile/close_order.png";
				
				if (file_exists($_SERVER['DOCUMENT_ROOT'] . '/mobile/checks/' . $lead['ID'] . '-order.jpg')) $payement_order_image = "https://bundlebox.ru/mobile/checks/" . $lead['ID'] . '-order.jpg?'.uniqid(); else $payement_order_image = "";
				if (file_exists($_SERVER['DOCUMENT_ROOT'] . '/mobile/checks/' . $lead['ID'] . '-delivery.jpg')) $payement_delivery_image = "https://bundlebox.ru/mobile/checks/" . $lead['ID'] . '-delivery.jpg?'.uniqid(); else $payement_delivery_image = "";

				$response['deal'] = [
					'ID'=>$lead['ID'],
					'DATE'=>$date,
					'IMAGE'=>'https://bundlebox.ru/mobile/logo.png',
					'STORE'=>$store,
					'STAGE'=>$stage,
					'PARCEL_ID'=>'',
					'NUM'=>$num,
					'PAYEMENT_ORDER_IMAGE'=>$payement_order_image,
					'PAYEMENT_DELIVERY_IMAGE'=>$payement_delivery_image,					
					'PARCEL_TEXT'=>'Номер посылки',
					'HAS_REVIEW'=>false,
					'REVIEW'=>isset($reviews[$lead['ID']])?$reviews[$lead['ID']]:null,
					'WEIGHT'=>$lead['UF_CRM_1663669969647']?$lead['UF_CRM_1663669969647']:"",
//					'BARCODE' => $lead['UF_CRM_1668721376367'],
					'BARCODE' => ($lead['STAGE_ID']=='UC_MBDY88')?$lead['UF_CRM_1668721376367']:'',
					'PARCEL' => $lead['UF_CRM_1664092353750'],
					'CUSTOMER' => $lead['UF_CRM_1668784831705'],
					'CUSTOMER' =>trim($response['contact']['NAME'].' '.$response['contact']['LAST_NAME']),
					'MULTIPOINT_PRICE' => $lead['UF_CRM_1668785031029'],
					'OUTER_TRACKNUMBER_TEXT' => "Трек-номер",
					'OUTER_TRACKNUMBER' => $lead['UF_CRM_1681845692836']?$lead['UF_CRM_1681845692836']:'',
					'SUM'=>round($lead['OPPORTUNITY'],0) . " ₽",
					//'d'=>$lead
				];
				$response['deal_detail']['REVIEW'] = $response['deal']['REVIEW'];
				//номер посылки
				if ($lead['STAGE_ID']=='UC_MBDY88' && $lead['UF_CRM_1664092353750']!='') {
					$response['deal']['PARCEL_ID'] = $lead['UF_CRM_1664092353750'];
				}
				


				$result_detail= CRest::call('crm.deal.get',['id'=>$request['order_id']]);
				$response['deal_detail'] = $result_detail['result'];
				
//sleep(1);
				$status_detail= CRest::call('crm.stagehistory.list',['entityTypeId'=>2, "order"=> [ "CREATED_TIME"=> "ASC" ], 'filter' => ['OWNER_ID'=>$request['order_id'] ]]);
				$response['status_detail'] = $status_detail;

				//История статусов
				$history = [];
				$history[]= [
					'DATE'=>date("d.m.Y",$dt),
					'OPERATION'=>'Создание заказа'
				];
				//https://b24-hgi204.bitrix24.ru/bitrix/components/bitrix/crm.deal.show/show_file.php?ownerId=627&fieldName=UF_CRM_1650939466873&dynamic=Y&fileId=823&auth=efryo38qppec9s7kmv366zail4t5ruf8
				//https://b24-hgi204.bitrix24.ru/bitrix/components/bitrix/crm.deal.show/show_file.php?ownerId=627&fieldName=UF_CRM_1650939466873&dynamic=Y&fileId=823&auth=00a6c962005c7086005b705a000000010000073f97738c39f141d3537f32ddec416a27
				//https://b24-hgi204.bitrix24.ru/bitrix/components/bitrix/crm.deal.show/show_file.php?auth=c2a6c962005c7086005b705a00000001000007a2f0dd17eb00f014871deb6bc31fc049&ownerId=627&fieldName=UF_CRM_1650939466873&dynamic=Y&fileId=823
				if (isset($status_detail['result']['items'])) {
					foreach($status_detail['result']['items'] as $status) {
						$dt1 = strtotime($status['CREATED_TIME']);
						$date1 = date("j",$dt1).' '.$months[date('n',$dt1)].' '.date("Y",$dt1).' г.';

						$stage = $directions[$status['STAGE_ID']]['NAME'];
						if ($directions[$status['STAGE_ID']]['STATUS_ID']=='UC_DQZUKA' && $lead['UF_CRM_1652413077471']!=='') $stage = "Посылка отправлена";

						$history[]= [
							'DATE'=>$date = date("d.m.Y",$dt1),
							'OPERATION'=>$stage
						];
					}
				}

				// добавим статусы доставки

				if ($directions[$status['STAGE_ID']]['STATUS_ID']=='UC_DQZUKA' && $lead['UF_CRM_1659879523001']!='') {
					$parts = explode("|",$lead['UF_CRM_1659879523001']);
					if (isset($parts[0])) {
						$dt1 = strtotime($parts[0]);
						$date1 = date("j",$dt1).' '.$months[date('n',$dt1)].' '.date("Y",$dt1).' г.';
						$history[]= [
							'DATE'=>$date = date("d.m.Y",$dt1),
							'OPERATION'=>"Транзит Москва"
						];
					}
				}
				if ($directions[$status['STAGE_ID']]['STATUS_ID']=='UC_DQZUKA' && $lead['UF_CRM_1659879763963']!='') {
					$parts = explode("|",$lead['UF_CRM_1659879763963']);
					if (isset($parts[0])) {
						$dt1 = strtotime($parts[0]);
						$date1 = date("j",$dt1).' '.$months[date('n',$dt1)].' '.date("Y",$dt1).' г.';
						$history[]= [
							'DATE'=>$date = date("d.m.Y",$dt1),
							'DATE1'=>$parts,
							'OPERATION'=>"На днях придет"
						];
					}
				}


				$response['history'] = array_reverse($history);
				//$response['history'] = $history;

				//Оплата доставки
				$flash = false;
				$response['deal']['PAY_DELIVERY'] = $flash;
				if ($stage=='Оплатите доставку') {
					$flash = true;
					$response['deal']['PAY_DELIVERY'] = $flash;
					$response['deal']['DELIVERY_PRICE'] = $lead['UF_CRM_1663669994797'].' ₽';
					$response['deal']['DELIVERY_TEXT'] = "Доставка";
					$response['deal']['DELIVERY_TITLE'] = "Доставка";					
					$response['deal']['DELIVERY_BUTTON'] = "payment";					
				}
				
				if ($stage=='Оплатите заказ' || $stage=='Отправлен счёт') {
					$flash = true;
					$response['deal']['PAY_DELIVERY'] = $flash;
					$response['deal']['DELIVERY_PRICE'] = round($lead['OPPORTUNITY'],0).' ₽';
					$response['deal']['DELIVERY_TEXT'] = "";
					$response['deal']['DELIVERY_TITLE'] = "К оплате";	
					$response['deal']['DELIVERY_BUTTON'] = "order";						
				}




				//files
				$files=[];

				if (isset($response['deal_detail'][$files_field])) {
						$response['deal_detail']['IMAGE_DOWNLOAD']= "https://b24-hgi204.bitrix24.ru" . $response['deal_detail'][$files_field]['downloadUrl'];
					    $output_filename = $request['order_id'] . "_1.jpg";

						$host = $response['deal_detail']['IMAGE_DOWNLOAD'];
						$ch = curl_init();
						curl_setopt($ch, CURLOPT_URL, $host);
						curl_setopt($ch, CURLOPT_VERBOSE, 1);
						curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
						curl_setopt($ch, CURLOPT_AUTOREFERER, false);
						curl_setopt($ch, CURLOPT_REFERER, "https://b24-hgi204.bitrix24.ru");
						curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
						curl_setopt($ch, CURLOPT_HEADER, 0);
						$result = curl_exec($ch);
						curl_close($ch);
						// the following lines write the contents to a file in the same directory (provided permissions etc)
						$fp = fopen($_SERVER['DOCUMENT_ROOT'].'/mobile/orders/'.$output_filename, 'w');
						fwrite($fp, $result);
						fclose($fp);
						$response['deal_detail']['IMAGE']= "https://bundlebox.ru/mobile/orders/" . $output_filename;
						
						if ($response['deal_detail']['STAGE_ID']=='WON') $response['deal']['BARCODE'] = '';
				}
				
	


		}


		header("Content-type: application/json; charset=utf-8");
		//unset($response['deal_detail']);
		//unset($response['deal']);
		//unset($response['reviews']);
		//unset($response['history']);
		echo json_encode($response);

		//Сохраним
		$jsonString = json_encode($response, JSON_PRETTY_PRINT);
		$fp = fopen(__DIR__.'/leadscache/lead_'.$request['order_id'].'.json', 'w');
		fwrite($fp, $jsonString);
		fclose($fp);
		

	} else {

		header("Content-type: application/json; charset=utf-8");
		//echo json_encode($result);
		echo json_encode(['error'=>true, 'message'=>'Некорректный запрос!']);

	}
?>
