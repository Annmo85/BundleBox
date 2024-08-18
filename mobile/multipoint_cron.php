<?php

	/*
	По крону опрашиваем статусы посылок из статусf Отправлено в ПВЗ
	*/
	ini_set("display_errors", "0");
	error_reporting(0);
	
	//$mp_api_key = "2140b316179aff2c30943f041098fec32949fecf";
	$mp_api_key = "3c4b629e6c820bd1f170826e0cd4d1218b74a3f5";

	require_once (__DIR__.'/firebase-fcm.php');
	$push_field = 'UF_CRM_1661758328983';

	//android_key
	$android_push_key = "AAAAPp2G1XA:APA91bG6YeokAH0f0Yx3cUvBwM12ODVqh7MPigiE4JFaiyklcxtx3fhVqegj3BFx-yJP_1ff06uvkSSUx5bHcI-2pnABrbOA_TxvIBMdEbMrziwh7y89DSxqdkxPaZ_CtXaCIISR2MJ7";
	$ios_push_key = "AIzaSyD71CmDjxMhfARZkmSdwgPixSu6LmWTI8k";

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
	

	//ini_set('display_errors', 1);
	//ini_set('display_startup_errors', 1);
    set_time_limit(0);
	//error_reporting(E_ALL);
    require_once (__DIR__.'/crest.php');
    $leads = [];
    $load_all = false;
    $start = 0;
    while (!$load_all) {
        $result = CRest::call('crm.deal.list',['select'=>['ID','TITLE','CONTACT_ID','STAGE_ID','UF_CRM_1652413077471','UF_CRM_1659879523001','UF_CRM_1659879763963','UF_CRM_1664092353750'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['STAGE_ID'=>'UC_H3ZYIB'],'start'=>$start]);
        //print_r($result);
		if (isset($result['next'])) {
            $start = $result['next'];
        } else $load_all=true;
        foreach($result['result'] as $lead) $leads[]=$lead;
		sleep(2);
     }
	 
	 //print_r($leads);


	//Запросим посылки
	$date_start = date("Y-m-d",strtotime("-10 days"));
    // $url = 'http://api.multi-point.net/index.php?route=parcel/parcel&api_key='.$mp_api_key.'&limit=100000';
    $url = 'http://api.multi-point.net/index.php?route=parcel/parcel&api_key='.$mp_api_key.'&limit=100000';
    	
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
 
    $response = curl_exec($ch);
    //print_r($response);
    curl_close($ch);
    
    $orders = json_decode($response, true);
	//print_r($leads);
	//print_r($orders);
	$response = [];
	$response['b_leads'] = [];
	$response['m_leads'] = [];

	//Отберем сделки, которые надо перенести в следующий статус
	if (isset($orders['parcels'])) foreach($orders['parcels'] as $order) {
		//print_r($order);
		foreach($leads as $lead) {
			if ($order['status']!='Готов к выдаче' && $order['status']!='Истёк срок хранения' ) $response['b_leads'][] = $order;
			/*if (trim($lead['UF_CRM_1664092353750'])==trim($order['parcel_id'])) {
				print_r($lead);
				print_r($order);				
			}*/
			if (trim($lead['UF_CRM_1664092353750'])==trim($order['parcel_id']) && $order['status']=='Готов к выдаче') {

				//Сменим статус, отправим пуш
				$fields = ['STAGE_ID'=>'UC_MBDY88','UF_CRM_1668721376367'=>$order['barcode'], 'UF_CRM_1668784831705'=>$order['customer'], 'UF_CRM_1668785031029'=>$order['price']];
				CRest::call('crm.deal.update',['id'=>$lead['ID'],"fields"=> $fields]);	
				//удалим кеш
				@unlink(__DIR__.'/leadscache/leads_'.$lead['CONTACT_ID'].'.json');
				@unlink(__DIR__.'/leadscache/closedleads_'.$lead['CONTACT_ID'].'.json');
				@unlink(__DIR__.'/leadscache/lead_'.$lead['ID'].'.json');				

				
				//пуш
				$user_result = CRest::call('crm.contact.get',[ "id"=> $lead['CONTACT_ID']]);
				$push_id = "";
				if (isset($user_result['result'][$push_field])) {
					$push_id = $user_result['result'][$push_field];
					//$push_id = 'd0FSj46zSzKC-W_Qq99w6d:APA91bEqrJ_tNULBa9IGGvXEfzl96v6VSDYalpVjO8eSaLAOAgC9vq8tXPXk0RTG5prsPC4ZknDKeyvuKBvAgI7nArLtUJea7W3ATY2RztvvkPNtmi39ojzaQB8MEht16aWlGdYtmE9I';
					//file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log',print_r($push_id,true),FILE_APPEND);	
				}
				
				if ($push_id!='') {
					
					$lead_title = trim($lead['TITLE']);
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
				
				//print_r($lead);
				//break;
				//exit;
				sleep(2);
			}
		}
		
	}
	header("Content-type: application/json; charset=utf-8");
	echo json_encode($response);
?>