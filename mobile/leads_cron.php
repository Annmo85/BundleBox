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
    $leads = [];
    $load_all = false;
    $start = 0;
    while (!$load_all) {
        $result = CRest::call('crm.deal.list',['select'=>['ID','UF_CRM_1652413077471','UF_CRM_1659879523001','UF_CRM_1659879763963'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['STAGE_ID'=>'UC_DQZUKA'],'start'=>$start]);
        if (isset($result['next'])) {
            $start = $result['next'];
        } else $load_all=true;
        foreach($result['result'] as $lead) if ($lead['UF_CRM_1652413077471']!='' && ($lead['UF_CRM_1659879523001']=='' || $lead['UF_CRM_1659879763963']=='')) $leads[]=$lead;
		sleep(2);
     }

     //UF_CRM_1659879523001 - статус зарегестрировано в рф
     //UF_CRM_1659879763963 - статус передано в доставку

     //сдернем список траков
     $track_numbers = [];
     foreach ($leads as $lead) {
        $track_number = $lead['UF_CRM_1652413077471'];
        $track_numbers[$track_number] = [];
     }

     //опросим статусы
     $token = "6043f77821e3a34e6a8c5511b6b3f8261d0d866202bee940470628c8f17bb415d999cf4d63740e06";
     foreach ($track_numbers as $track_number=>$value) {
        sleep(2);
        $headers = array();
        $headers[] = "X-Authorization-Token: {$token}";
        $headers[] = 'Content-Type: application/x-www-form-urlencoded; charset=utf-8';
        $state_ch = curl_init();
        curl_setopt($state_ch, CURLOPT_URL,"https://gdeposylka.ru/api/v4/tracker/detect/{$track_number}");
        curl_setopt($state_ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($state_ch, CURLOPT_HTTPHEADER, $headers);
        $state_result = curl_exec ($state_ch);
        curl_close($state_ch);
        $state_result = json_decode($state_result,true); 
        $track_numbers[$track_number]['detect'] = $state_result;
        if (isset($state_result['data'][0]['tracker_url'])) {
            $state_ch = curl_init();
            sleep(2);
            curl_setopt($state_ch, CURLOPT_URL,"https://gdeposylka.ru" . $state_result['data'][0]['tracker_url']);
            curl_setopt($state_ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($state_ch, CURLOPT_HTTPHEADER, $headers);
            $state_result = curl_exec ($state_ch);
            curl_close($state_ch);
            $state_result = json_decode($state_result,true);         

            $track_numbers[$track_number]['track'] = $state_result;

            
        }        

     }

    //обновим данные в битрикс
    foreach($leads as $lead) {
        $track_number = $lead['UF_CRM_1652413077471'];
        if (isset($track_numbers[$track_number])) {
            $import_string = "";
            $custom_left_string = "";
            $track_event = $track_numbers[$track_number];
            //print_r($track_event);
            if (isset($track_event['track']['data']['checkpoints'])) {
                $checkpoints = $track_event['track']['data']['checkpoints'];

                foreach($checkpoints as $checkpoint) {
                    if ($checkpoint['status_code'] === 'customs_left') {
                        $custom_left_string = $checkpoint['time'].' | ' . $checkpoint['status_name'].' | ' . $checkpoint['location_zip_code'].', ' . $checkpoint['location_raw'];
                    }
                    if ($checkpoint['status_code'] === 'import') {
                        $import_string = $checkpoint['time'].' | ' . $checkpoint['status_name'].' | ' . $checkpoint['location_zip_code'].', ' . $checkpoint['location_raw'];
                    }
                }

                if ($import_string!='' || $custom_left_string!='') {
                    $fields = [];
                    if ($import_string!='') $fields['UF_CRM_1659879523001'] = $import_string;
                    if ($custom_left_string!='') $fields['UF_CRM_1659879763963'] = $custom_left_string;
                    $response['update_result'][] = CRest::call('crm.deal.update',['id'=>$lead['ID'],"fields"=> $fields]);
                    sleep(2);
                }
            }
        }
    }

    $response['leads'] = $leads;
    $response['track_numbers'] = $track_numbers;


    header("Content-type: application/json; charset=utf-8");	
    echo json_encode($response);
