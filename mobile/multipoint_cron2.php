<?php

	/*
	По крону опрашиваем статусы посылок из статусf Отправлено в ПВЗ
	*/
	
	
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
	

	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
    set_time_limit(0);
	error_reporting(E_ALL);
    require_once (__DIR__.'/crest.php');
    $leads = [];
    $load_all = false;
    $start = 0;
    while (!$load_all) {
        $result = CRest::call('crm.deal.list',['select'=>['ID','TITLE','CONTACT_ID','STAGE_ID','UF_CRM_1652413077471','UF_CRM_1659879523001','UF_CRM_1659879763963','UF_CRM_1664092353750'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['STAGE_ID'=>['UC_MBDY88','UC_H3ZYIB']],'start'=>$start]);
        if (isset($result['next'])) {
            $start = $result['next'];
        } else $load_all=true;
        foreach($result['result'] as $lead) $leads[]=$lead;
		sleep(2);
     }
	 
	 //print_r($leads);


	//Запросим посылки
	$date_start = date("Y-m-d",strtotime("-3 days"));
    $url = 'http://api.multi-point.net/index.php?route=parcel/parcel&api_key='.$mp_api_key.'&state=issued&limit=5000&&date_start='.$date_start;
    	
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
 
    $response = curl_exec($ch);
    
    curl_close($ch);
    
    $orders = json_decode($response, true);
	//print_r($orders);
	$response = [];
	$response['b_leads'] = [];
	$response['m_leads'] = [];

	//Отберем сделки, которые надо перенести в следующий статус
	if (isset($orders['parcels'])) foreach($orders['parcels'] as $order) {
		foreach($leads as $lead) {
			if (trim($lead['UF_CRM_1664092353750'])==trim($order['parcel_id']) && $order['status']=='Выдана') {
				$response['m_leads'][]=$lead;
				$response['m_leads'][]=$order;
				//Сменим статус, отправим пуш
				$fields = ['STAGE_ID'=>'WON'];
				CRest::call('crm.deal.update',['id'=>$lead['ID'],"fields"=> $fields, 'params'=> ["REGISTER_SONET_EVENT"=>"Y"]]);	
				//удалим кеш
				@unlink(__DIR__.'/leadscache/leads_'.$lead['CONTACT_ID'].'.json');
				@unlink(__DIR__.'/leadscache/closedleads_'.$lead['CONTACT_ID'].'.json');
				@unlink(__DIR__.'/leadscache/lead_'.$lead['ID'].'.json');				
				sleep(2);
				//print_r($lead);
				//break;
				//exit;
				
				//Отиправим ПУШ
				
			}
		}
		
	}
	header("Content-type: application/json; charset=utf-8");
	echo json_encode($response);
?>