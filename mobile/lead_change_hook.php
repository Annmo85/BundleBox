<?php
$postdata = file_get_contents("php://input");
$request = json_decode($postdata,true);
require_once (__DIR__.'/crest.php');
require_once (__DIR__.'/firebase-fcm.php');
$push_field = 'UF_CRM_1661758328983';

//android_key
$android_push_key = "AAAAPp2G1XA:APA91bG6YeokAH0f0Yx3cUvBwM12ODVqh7MPigiE4JFaiyklcxtx3fhVqegj3BFx-yJP_1ff06uvkSSUx5bHcI-2pnABrbOA_TxvIBMdEbMrziwh7y89DSxqdkxPaZ_CtXaCIISR2MJ7";
$ios_push_key = "AIzaSyD71CmDjxMhfARZkmSdwgPixSu6LmWTI8k";
	
/*file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log','_REQUEST'.print_r($_REQUEST,true),FILE_APPEND);
file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log','_POST'.print_r($_POST,true),FILE_APPEND);
file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log','_GET'.print_r($_GET,true),FILE_APPEND);
file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log','request'.print_r($request,true),FILE_APPEND);*/

$post = $_POST;
if (isset($post['event']) && ($post['event']=="ONCRMDEALUPDATE" || $post['event']=="ONCRMDEALADD")) {
	$fields = [];

	if (isset($post['data']['FIELDS'])) $fields = $post['data']['FIELDS'];

	
	if (isset($fields['ID']) && $fields['ID']!='') {

		if (file_exists($_SERVER['DOCUMENT_ROOT'].'/mobile/leadscache/lead_busy-'.$fields['ID'].'.txt')) return;
		file_put_contents($_SERVER['DOCUMENT_ROOT'].'/mobile/leadscache/lead_busy-'.$fields['ID'].'.txt',time());
		
		$directions = [];
		/*$directions_result = CRest::call('crm.status.list',['filter' => ['ENTITY_ID' => 'DEAL_STAGE']]);
		foreach($directions_result['result'] as $d) {
			$directions[$d['STATUS_ID']] = $d['NAME'];
		}
		sleep(2);
		$directions;	*/	
		
		if (file_exists(__DIR__.'/leadscache/statuses.json')) {
			$jsonString = file_get_contents(__DIR__.'/leadscache/statuses.json');
			$directions = json_decode($jsonString, true);
			
		} else {
			$directions_result = CRest::call('crm.status.list',['filter' => ['ENTITY_ID' => 'DEAL_STAGE']]);
			foreach($directions_result['result'] as $d) {
				$directions[$d['STATUS_ID']] = $d['NAME'];
			}
			// Convert JSON data from an array to a string
			$jsonString = json_encode($directions, JSON_PRETTY_PRINT);
			// Write in the file
			$fp = fopen(__DIR__.'/leadscache/statuses.json', 'w');
			fwrite($fp, $jsonString);
			fclose($fp);			
			sleep(2);
		}
		$response['directions'] = $directions;
		
		$result_detail= CRest::call('crm.deal.get',['id'=>$fields['ID']]);
		$deal = $result_detail['result'];		
		
		//Получим прошлый статус
		$old_status = "";
		$new_status = $directions[$deal['STAGE_ID']];
		$status_file = $_SERVER['DOCUMENT_ROOT'].'/mobile/orders/status.'.$fields['ID'];
		if (file_exists($status_file) ) {
			$fp = fopen($status_file, 'r');
			$old_status = fread($fp,filesize($status_file));
			fclose($fp);					
		}
		
		
		
		
		//UF_CRM_1659879523001 - статус зарегестрировано в рф
		//UF_CRM_1659879763963 - статус передано в доставку
		//UF_CRM_1652413077471 - тракномер
		if ($deal['STAGE_ID']==='UC_DQZUKA') {
			if ($deal['UF_CRM_1652413077471']!='') $new_status = "Посылка отправлена";
			if ($deal['UF_CRM_1659879523001']!='') $new_status = "Транзит Москва";
			if ($deal['UF_CRM_1659879763963']!='') $new_status = "На днях придет";
		}		
		
		$user_result = null;
		
		if ($new_status!=$old_status) {
			
			//получим клиента
			$user_result = CRest::call('crm.contact.get',[ "id"=> $deal['CONTACT_ID']]);
			
			$push_id = "";
			if (isset($user_result['result'][$push_field])) {
				$push_id = $user_result['result'][$push_field];
				//file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log',print_r($push_id,true),FILE_APPEND);	
			}
			
			if ($push_id!='') {
				
				$lead_title = trim($deal['TITLE']);
				$lead_title = str_replace("\t"," ",$lead_title);
				
				$parts = array_filter(explode(' ',$lead_title));
				$num = array_pop($parts);
				$store = implode(' ',$parts);				
				
				if ($new_status=='Заказ завершен') {
				$fcm_android = new FCM($android_push_key);
					$arrNotification["title"] ="Заказ {$store} {$num} завершен";
					$arrNotification["body"] = "Ваш заказ {$store} {$num} завершен. Пожалуйста, поделитесь впечатлением о полученных товарах.";
					$arrNotification["sound"] = "default";
					$arrNotification["type"] = 1;				
					$data['route'] = "open_win_order/".$deal['ID'];				
					$push_result = $fcm_android->send_notification($push_id, $arrNotification,"Android",$data);					
				} else  {
					$fcm_android = new FCM($android_push_key);
					$arrNotification["title"] ="Заказ {$store} {$num}";
					$arrNotification["body"] = "Статус заказа: {$new_status}";
					$arrNotification["sound"] = "default";
					$arrNotification["type"] = 1;				
					$push_result = $fcm_android->send_notification($push_id, $arrNotification,"Android");
				}
				//file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log',print_r($push_result,true),FILE_APPEND);	
			}
			
				
			
			//отправим пуш
			$fp = fopen($_SERVER['DOCUMENT_ROOT'].'/mobile/orders/status.'.$fields['ID'], 'r');
			$code = fread($fp,filesize($filename));
			fclose($fp);				
		}
		
		//сохраним
		$fp = fopen($status_file, 'w');
		fwrite($fp,$new_status);
		fclose($fp);		
		
		//Обновим цену доставки, если указан вес
		// UF_CRM_1663669969647 - вес
		// UF_CRM_1663669994797 - стоимость
		$fields = [];
		$weight = str_replace(",",".",$deal['UF_CRM_1663669969647']);
		if ($weight!="" && floatval($weight)>0) {
			
			//Сделаем запрос к базе, узнаем курс и стоимость доставки
			$mysqli = mysqli_connect("localhost", "annamonh_prod", "12345678");
			if ($mysqli == false){
				$response['mysql_error'] = "Ошибка: Невозможно подключиться к MySQL " . mysqli_connect_error();
			} else {
				
				$lead_title = trim($deal['TITLE']);
				$lead_title = str_replace("\t"," ",$lead_title);
				
				$parts = array_filter(explode(' ',$lead_title));
				$num = array_pop($parts);
				$store = strtolower(trim(implode(' ',$parts)));
				
				mysqli_select_db($mysqli, "annamonh_prod");
				$response['mysql_error'] = false;
				$stores = [];
				$stores_alt = [];
				$sql = "select bc.alias as country_alias, msc.country_id, main_stores.id, main_stores.name, main_stores.alias, main_stores.image_id,main_stores.single_image_id,main_stores.visible 
				from main_stores 
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

				/*$fields['UF_CRM_1663669994797']= number_format((float)floatval($weight) * 3, 2, '.', '');
				$fields['UF_CRM_1663669994797']= $store . ' '.print_r($stores[$store],true);
				CRest::call('crm.deal.update',['id'=>$deal['ID'],"fields"=> $fields]);	*/
					
				if (isset($stores[$store]) || isset($stores_alt[$store])) {
					$d = null;
					if (isset($stores[$store])) $d = $stores[$store];
					if (isset($stores_alt[$store])) $d = $stores_alt[$store];
					
					$price_per_kg = 1600;
					if ($d['country_alias']=='us') $price_per_kg = 1600; 
					else if ($d['country_alias']=='kitaj') $price_per_kg = 1000;
					else $price_per_kg = 1350;
					
					$summ = round($weight * $price_per_kg,0,PHP_ROUND_HALF_UP);
					
					//Сравним старое значение с новым и перезапишем его, если что
					$old_summ = $deal['UF_CRM_1663669994797'];
					if ($deal['UF_CRM_1663669994797']=="" || intval($old_summ)!=intval($summ)) {
						$fields['UF_CRM_1663669994797']= number_format($summ, 2, '.', '');
						if ($fields['UF_CRM_1663669994797']=="") unset($fields['UF_CRM_1663669994797']);
						//Перенесено вниз
						/*sleep(2);
						CRest::call('crm.deal.update',['id'=>$deal['ID'],"fields"=> $fields]);	
						$test = $_SERVER['DOCUMENT_ROOT'].'/mobile/test_lead.txt';
						file_put_contents($test, $deal['ID'] .": ". intval($summ) ."<>".intval($old_summ) . "\n",FILE_APPEND);
						*/

					}					

				}
				
		
				
			}			
			

		}
		
		//Заполним ПВЗ из контакта
		if ($deal['UF_CRM_1685890838711']=="") {
			if (!$user_result) $user_result = CRest::call('crm.contact.get',[ "id"=> $deal['CONTACT_ID']]);
			$pvz_id = $user_result['result']['UF_CRM_1661242171103'];
			$pvz_name="";
			$fields_result = CRest::call('crm.contact.userfield.get',['id'=>275]);
			if (isset($fields_result['result'])) {
				foreach($fields_result['result']['LIST'] as $pvz) {
					if ((int)$pvz['ID']==(int)$pvz_id) $pvz_name = $pvz['VALUE'];
				}
			}
			
			if ($pvz_name!="") $fields['UF_CRM_1685890838711'] = $pvz_name;
			//$fields['UF_CRM_1685890838711'] = print_r($fields_result['result']['LIST'],true);
			
			// перенесено вниз
			/*sleep(2);
			CRest::call('crm.deal.update',['id'=>$deal['ID'],"fields"=> $fields]);*/
	
		
		}
		

		
		//Если есть что - обновим
		if (count($fields)>0) {
			$test = __DIR__.'/test_lead1.txt';
			/*file_put_contents($test,"1" . "\n",FILE_APPEND);
			file_put_contents($test,print_r($directions,true) . "\n",FILE_APPEND);
			file_put_contents($test,"2" . "\n",FILE_APPEND);
			file_put_contents($test, print_r($post,true) . "\n",FILE_APPEND);
			file_put_contents($test, print_r($deal,true) . "\n",FILE_APPEND);
			file_put_contents($test, print_r(['id'=>$deal['ID'],"fields"=> $fields],true) . "\n",FILE_APPEND);*/
			CRest::call('crm.deal.update',['id'=>$deal['ID'],"fields"=> $fields]);
			sleep(2);		
		
		}

		//удалим кеш
		@unlink(__DIR__.'/leadscache/leads_'.$deal['CONTACT_ID'].'.json');
		@unlink(__DIR__.'/leadscache/closedleads_'.$deal['CONTACT_ID'].'.json');
		@unlink(__DIR__.'/leadscache/lead_'.$deal['ID'].'.json');		
		
		@unlink($_SERVER['DOCUMENT_ROOT'].'/mobile/leadscache/lead_busy-'.$deal['ID'].'.txt');
			
	}
	
}

?>