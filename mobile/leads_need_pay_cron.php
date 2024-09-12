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
    set_time_limit(0);
	error_reporting(E_ALL);
    require_once (__DIR__.'/crest.php');

	require_once (__DIR__.'/firebase-fcm.php');
	$push_field = 'UF_CRM_1661758328983';

	//android_key
	$android_push_key = "AAAAPp2G1XA:APA91bG6YeokAH0f0Yx3cUvBwM12ODVqh7MPigiE4JFaiyklcxtx3fhVqegj3BFx-yJP_1ff06uvkSSUx5bHcI-2pnABrbOA_TxvIBMdEbMrziwh7y89DSxqdkxPaZ_CtXaCIISR2MJ7";
	$ios_push_key = "AIzaSyD71CmDjxMhfARZkmSdwgPixSu6LmWTI8k";
	

    $leads = [];
    $load_all = false;
    $start = 0;
    while (!$load_all) {
        $result = CRest::call('crm.deal.list',['select'=>['ID','*'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['STAGE_ID'=>['PREPARATION','UC_4NZEBU']],'start'=>$start]);
        if (isset($result['next'])) {
            $start = $result['next'];
        } else $load_all=true;
        foreach($result['result'] as $lead)  $leads[]=$lead;
		sleep(2);
     }

	//По каждой сделке получаем контакт
	$contacts = [];
	foreach($leads as $lead) $contacts[$lead['CONTACT_ID']] = $lead['CONTACT_ID'];
	
    $response['leads'] = $leads;
    $response['contact_ids'] = array_values($contacts);
	
	$load_all = false;
    $start = 0;
	$users = [];
	while (!$load_all) {
		$user_result = CRest::call('crm.contact.list',[ 
			'order'=>["DATE_CREATE"=>"ASC"],
			'filter'=>["ID"=>array_values($contacts)],
			'select'=> [ "ID", 'UF_*','*'],
			'start'=>$start
		]);		
        if (isset($user_result['next'])) {
            $start = $user_result['next'];
        } else $load_all=true;		
		foreach ($user_result['result'] as $user) $users[$user['ID']] = $user;
		sleep(2);
	}

	
	foreach ($user_result['result'] as $user) $users[$user['ID']] = $user;	
	$response['users'] = $users;
	$response['user_result'] = $user_result;
	
	foreach($leads as $lead) {
		
		if (!$users[$lead['CONTACT_ID']]) print_r($lead);
		
		$contact = $users[$lead['CONTACT_ID']];
		if (isset($contact[$push_field]) && $contact[$push_field]!="") {
		
			$push_id = $contact[$push_field];
			//$push_id = "dy4-YV6wQ6ao7pVLv9Nh6v:APA91bGdHClbtBbmM7YWcOhasGyoc7ICsC4cnqVpjbM86Ojeln9HNOBX5kRFQxQH4S9iTag0Z9uq52a8ksUcgBpDlxIicLpAAaPvhPF_AA_5XVwDIqlTtuEI7beLF1b8FezdSMqbMJOc";
		
			$lead_title = trim($lead['TITLE']);
			$lead_title = str_replace("\t"," ",$lead_title);
			$parts = array_filter(explode(' ',$lead_title));
			$num = array_pop($parts);
			$store = implode(' ',$parts);
		
			$title = "";
			$message = "";
			if ($lead['STAGE_ID']=="PREPARATION") {
				$title = "Заказ {$store} {$num} ожидает оплаты доставки";
				$message = "Оплатите доставку и ваш заказ {$store} {$num} устремится к вам!";
			} else if ($lead['STAGE_ID']=="UC_4NZEBU") {
				$title = "Заказ {$store} {$num} ожидает оплату";
				$message = "Оплатите заказ {$store} {$num} и он отправится в путешествие к вам!";
			}
			
			$fcm_android = new FCM($android_push_key);
			$arrNotification["title"] =$title;
			$arrNotification["body"] = $message;
			$arrNotification["sound"] = "default";
			$arrNotification["type"] = 1;				
			$data['route'] = "open_action_order/".$lead['ID'];				
			$push_result = $fcm_android->send_notification($push_id, $arrNotification,"Android",$data);			
			$response['push_result'][$lead['CONTACT_ID']] = $push_result;
		}
		//break;
	}
 

    header("Content-type: application/json; charset=utf-8");	
    echo json_encode($response);
