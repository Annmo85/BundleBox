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
	
	$password_field_id = 'UF_CRM_1657095390383';
	$push_field = 'UF_CRM_1661758328983';
	$city_field = "UF_CRM_1682675253591";
	
	if (isset($request['phone']) && isset($request['password'])) {
	
		$response = ['error'=>true,'message'=>'Пользователь с таким номером телефона и паролем не найден!'];
	
		//Приведем телефон к номальному виду
		if ($request['password']=="") $request['password']="2ekjbngflday5";
		if ($request['phone']=="") $request['phone']="9990009900";
		$phone = '+7'.preg_replace("/[^0-9]/", "", $request['phone']);
	
		$response['request'] = ["PHONE"=> $phone, "PASSWORD"=>$request['password']];
	
		require_once (__DIR__.'/crest.php');

		$users=[];
		//'filter'=> [ "PHONE"=> '+79501107140' ], 79643506552
		

		
		$result = CRest::call('crm.contact.list',['filter'=> [ "PHONE"=> $phone, "{$password_field_id}"=> $request['password']], 'select'=> [ "ID", "NAME", "LAST_NAME", "TYPE_ID", "SOURCE_ID" , "PHONE", "EMAIL", "UF_*"  ]]);
		foreach ($result['result'] as $u) {
				$users[] = $u;

		}

		if (count($users)>0) {
			
			if (isset($users[0][$city_field])) $users[0]['CITY_NAME'] = $users[0][$city_field]; else $users[0]['CITY_NAME']=="";
			
			if (file_exists($_SERVER['DOCUMENT_ROOT'].'/mobile/users/delete.'.$users[0]['ID'])) {
				$response = ['error'=>true,'message'=>'Пользователь с таким номером телефона и паролем не найден!'];
			} else {
				$response = ['error'=>false,'message'=>'Пользователь найден.', 'user'=>$users[0]];
				
				//push_id
				//обновим емупуш ид, если он есть
				//if (isset($request['push_id']))  $result = CRest::call('crm.contact.update',["id"=> $users[0]['ID'], 'fields'=>[$push_field=>$request['push_id']]]);
				
				$response = ['error'=>false,'message'=>'Пользователь найден.', 'user'=>$users[0], /*'push_id'=>$request['push_id']*/];
				
			}

			//$response = ['error'=>false,'message'=>'Пользователь найден.', 'user'=>$users[0]];
		}
		
		
		header("Content-type: application/json; charset=utf-8");	
		echo json_encode($response);


		
	} else {
		
		header("Content-type: application/json; charset=utf-8");
		//echo json_encode($result);
		echo json_encode(['error'=>true, 'message'=>'Некорректный запрос!']);
		
	}
?>