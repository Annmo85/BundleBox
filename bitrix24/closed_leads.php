<?php

	//Вернем список завершенных заказов

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

	require_once (__DIR__.'/crest.php');
	require_once (__DIR__.'/actions.include.php');
	$helperClass = new HelperClass();
	
	if (isset($request['id'])) {
	
	
		if (file_exists(__DIR__.'/leadscache/closedleads_'.$request['id'].'.json')) {
			$jsonString = file_get_contents(__DIR__.'/leadscache/closedleads_'.$request['id'].'.json');
			$response = json_decode($jsonString, true);
		
			
			$response['cache'] = true;
			header("Content-type: application/json; charset=utf-8");	
			echo json_encode($response);
			exit;
		}

		$mysqli = mysqli_connect("localhost", "annamonh_prod", "12345678");



		$response = ['deals'=>[]];
		$response['request'] = ["ID"=>$request['id']];
	


		$directions = [];
		$directions_result = CRest::call('crm.status.list',['filter' => ['ENTITY_ID' => 'DEAL_STAGE']]);
		foreach($directions_result['result'] as $d) {
			$directions[$d['STATUS_ID']] = $d;
		}
		$response['directions'] = $directions;

		$stores = [];
		$stores_alt = [];
		$reviews =[];

		if ($mysqli == false){
			$response['mysql_error'] = "Ошибка: Невозможно подключиться к MySQL " . mysqli_connect_error();
		} else {
			mysqli_select_db($mysqli, "annamonh_prod");
			$response['mysql_error'] = false;

			$sql = "select bc.alias as country_alias, msc.country_id, main_stores.id, main_stores.name, main_stores.alias, main_stores.image_id,main_stores.single_image_id,main_stores.visible, base_images.name as single_image_name, base_images.folder as single_image_folder , b2.name as image_name, b2.folder as image_folder 
			from main_stores 
			left join base_images on base_images.id=main_stores.single_image_id 
			left join base_images b2 on b2.id=main_stores.image_id 
			left join main_store_country_many_to_many msc on msc.store_id=main_stores.id
			left join base_countries bc on bc.id=msc.country_id
			";
			if ($result = $mysqli->query($sql)) { 
				while($obj = $result->fetch_assoc()){ 
					$stores[strtolower($obj['alias'])] = $obj;
					$stores_alt[strtolower($obj['name'])] = $obj;
				} 
				$result->close();
			} 	

			//Получим отзывы этого пользователя
			$sql = "select * from main_comments where bitrix_user_id=".(int)$request['id'];
			if ($result = $mysqli->query($sql)) { 
				while($obj = $result->fetch_assoc()){ 
					$reviews[strtolower($obj['order_id'])] = $obj;
				} 
				$result->close();			
			}
			
			
		}

		//$response['stores']=$stores;

		//UF_CRM_1659879523001 - статус зарегестрировано в рф
    	//UF_CRM_1659879763963 - статус передано в доставку
		//UF_CRM_1652413077471 - тракномер
	//Штрихкод
	//UF_CRM_1668721376367		
	
	//клиент
	//UF_CRM_1668784831705	
	
	//К оплате (мультипоинт)
	//UF_CRM_1668785031029

		//UF_CRM_1663669969647 - вес
		//UF_CRM_1663669994797 - стоимость доставки
	
		$users=[];
		$response['deals_for_payement'] = [];
		$result = CRest::call('crm.deal.list',['select'=>['*','UF_CRM_1652413077471','UF_CRM_1670510435755','UF_CRM_1663669969647','UF_CRM_1663669994797','UF_CRM_1670510894504','UF_CRM_1659879523001','UF_CRM_1664092353750','UF_CRM_1668785031029','UF_CRM_1668784831705','UF_CRM_1668721376367','UF_CRM_1659879763963'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['CONTACT_ID' => $request['id'], 'STAGE_ID'=>"WON"]]);
		foreach ($result['result'] as $lead) {
				

				
				
				$dt = strtotime($lead['DATE_CREATE']);
				
				$date = date("j",$dt).' '.$months[date('n',$dt)].' '.date("Y",$dt).' г.';
				
				$lead_title = trim($lead['TITLE']);
				$lead_title = str_replace("\t"," ",$lead_title);
				
				$parts = array_filter(explode(' ',$lead_title));
				$num = array_pop($parts);
				$store = implode(' ',$parts);
				$store_id = null;
				
				//list($store, $num) = explode(' ',$lead['TITLE']);
				
				$stage = $directions[$lead['STAGE_ID']]['NAME'];

				if ($lead['STAGE_ID']==='UC_DQZUKA') {
					if ($lead['UF_CRM_1652413077471']!='') $stage = "Посылка отправлена";
					if ($lead['UF_CRM_1659879523001']!='') $stage = "Транзит Москва";
					if ($lead['UF_CRM_1659879763963']!='') $stage = "На днях придет";
				}

				$flag = "";
				
				$image = 'https://bundlebox.ru/mobile/logo.png';
				if (isset($stores[strtolower($store)])) {
					$d = $stores[strtolower($store)];
					$image = 'https://bundlebox.ru/image/'. $d['image_folder'] .'/'.$d['image_name'];
					$store_id = $d['id'];
					if (file_exists($_SERVER['DOCUMENT_ROOT']."/image/flags/".$d['country_alias'].'.png')) $flag = 'https://bundlebox.ru/image/flags/'.$d['country_alias'].'.png';
				}
				if (isset($stores_alt[strtolower($store)])) {
					$d = $stores_alt[strtolower($store)];
					$store_id = $d['id'];
					$image = 'https://bundlebox.ru/image/'. $d['image_folder'] .'/'.$d['image_name'];
					if (file_exists($_SERVER['DOCUMENT_ROOT']."/image/flags/".$d['country_alias'].'.png')) $flag = 'https://bundlebox.ru/image/flags/'.$d['country_alias'].'.png';

				}
				
				$stage_helper = "";
				if ($stage=="Оплатите заказ") $stage_helper = "Вам отправлено уведомление о необходимости оплатить заказ. Оплачивайте как можно скорее и заказ отправится дальше";
				elseif ($stage=="Оплачено") $stage_helper = "Благодарю за своевременную оплату. Ваш заказ оплачен и готовится магазином к отправке.";
				elseif ($stage=="Ожидает выкупа") $stage_helper = "Мы работаем над вашей заявкой. Подбираем компанию, чтобы вы меньше заплатили. Как только заказ соберется - вы получите уведомление о необходимости оплаты";
				elseif ($stage=="Отправлено магазином") $stage_helper = "Магазин выслал ваш заказ. Теперь мы получим его на складе и соберём посылку для отправки в Россию";
				elseif ($stage=="Получено на складе") $stage_helper = "Ваш заказ прибыл на склад в стране покупки. Еще немного и посылка отправится в ваш город";
				elseif ($stage=="Посылка отправлена") $stage_helper = "Посылка с вашим заказом отправлена в Россию. Вы увидите новый статус когда она пересечет границу";
				elseif ($stage=="Регистрация в РФ") $stage_helper = "Посылка с вашим заказом прибыла на территорию РФ. В ближайшие дни ее проверит таможня и отправит в ваш город";
				elseif ($stage=="Передано в доставку") $stage_helper = "Самое страшное позади. Еще несколько дней и посылка придет в ваш город";
				elseif ($stage=="Транзит Москва") $stage_helper = "Заказ прибыл в Москву, после таможенной проверки он направится в ваш город";
				elseif ($stage=="На днях придет") $stage_helper = "Осталось несколько дней до прибытия заказа";
				elseif ($stage=="Оплатите доставку") $stage_helper = "Заказ пришёл в ваш город, взвешан и ждет оплаты доставки. Скорее оплачивайте, скидывайте чек и он отправится в офис выдачи заказов.";
				elseif ($stage=="Готовится к выдаче") $stage_helper = "Ваш заказ готовится к выдаче. В течение нескольких дней он будет доставлен в ПВЗ и вам придет уведомление о том, что заказ можно получить.";
				elseif ($stage=="Получите заказ") $stage_helper = "Ваш заказ готов к выдаче. Сверьтесь с расписанием работы пункта и получайте посылку.Получить заказ в пункте выдачи можно либо по имени и фамилии, либо по Номеру посылки, который вы найдете в подробностях заказа.";
				elseif ($stage=="Заказ завершен") $stage_helper = "Вы получили свой заказ.";


				$flash = false;
				if ($stage=='Оплатите заказ' || $stage=='Отправлен счёт' || $stage=='Оплатите доставку' || $stage=='Получите заказ') $flash = true;
				
				
				//payment and delivery images
				if (file_exists($_SERVER['DOCUMENT_ROOT'] . '/mobile/checks/' . $lead['ID'] . '-order.jpg')) $payement_order_image = "https://bundlebox.ru/mobile/checks/" . $lead['ID'] . '-order.jpg?'.uniqid(); else $payement_order_image = "";
				if (file_exists($_SERVER['DOCUMENT_ROOT'] . '/mobile/checks/' . $lead['ID'] . '-delivery.jpg')) $payement_delivery_image = "https://bundlebox.ru/mobile/checks/" . $lead['ID'] . '-delivery.jpg?'.uniqid(); else $payement_delivery_image = "";

				$response['deals'][] = [
					'ID'=>$lead['ID'],
					'ID1'=>$lead,
					'DATE'=>$date,
					'IMAGE'=>$image,
					'STORE'=>$store,
					'STORE_ID'=>$store_id,
					'NUM'=>$num,
					'STAGE'=>$stage,
					'FLASH'=>$flash,
					'FLAG'=>$flag,
					'WEIGHT'=>$lead['UF_CRM_1663669969647']?$lead['UF_CRM_1663669969647']:"",
					'DELIVERY_COST'=>$lead['UF_CRM_1663669994797']?$lead['UF_CRM_1663669994797']." ₽":"", 
					'REVIEW'=>isset($reviews[$lead['ID']])?$reviews[$lead['ID']]:null,
					'PAYEMENT_ORDER_IMAGE'=>$payement_order_image,
					'PAYEMENT_DELIVERY_IMAGE'=>$payement_delivery_image,
					'BARCODE' => "",//$lead['UF_CRM_1668721376367'],
					'PARCEL' => $lead['UF_CRM_1664092353750'],
					'CUSTOMER' => $lead['UF_CRM_1668784831705'],
					'MULTIPOINT_PRICE' => $lead['UF_CRM_1668785031029'],
					'STAGE_HELPER'=>$stage_helper,
					'SUM'=>round($lead['OPPORTUNITY'],0) . " ₽", 
					'd'=>$lead
				];


		}
		
		//$response['reviews']=$reviews;
		
		header("Content-type: application/json; charset=utf-8");	
		echo json_encode($response);

		//Сохраним
		$jsonString = json_encode($response, JSON_PRETTY_PRINT);
		$fp = fopen(__DIR__.'/leadscache/closedleads_'.$request['id'].'.json', 'w');
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

