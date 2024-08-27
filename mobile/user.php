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
	require_once (__DIR__.'/crest.php');
	require_once (__DIR__.'/sms.ru.php');
	require_once (__DIR__.'/delivery_calc_class.php');

	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata,true);
	
	$pvz_field = "UF_CRM_1661242171103";
	$city_field = "UF_CRM_1682675253591";
	$password_field = 'UF_CRM_1657095390383';
	$push_field = 'UF_CRM_1661758328983';

	$index_field = "UF_CRM_1702312039677";
	$street_field = "UF_CRM_1702312063387";
	$dom_field = "UF_CRM_1702312072251";
	$kv_field = "UF_CRM_1702312081707";
	
	$smsru = new SMSRU('797CD0B2-0676-DE9E-1432-F8178F6361C1');
	
	$deliveryClass = new DeliveryClass();
	
	
	if (isset($request['user_id']) && isset($request['action']) && $request['action']==='delete') {
		$fp = fopen($_SERVER['DOCUMENT_ROOT'].'/mobile/users/delete.'.$request['user_id'], 'w');
		fwrite($fp, "1");
		fclose($fp);
		$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $request['user_id'], "ENTITYTYPEID"=>3, 'POST_TITLE'=>'Запрос на удаление пользователя', 'MESSAGE'=>"Пользователь запросил удаление аккаунта и всех данных через приложение."]]);
	}
	
	else if (isset($request['user_id']) && isset($request['action']) && $request['action']==='get') {
		$result = CRest::call('crm.contact.get',[ "id"=> $request['user_id']]);
		
		$address_value = implode(", ",array_filter([$result['result'][$index_field], $result['result'][$city_field], $result['result'][$street_field], $result['result'][$dom_field], $result['result'][$kv_field]]));
		$response['user'] = [
			'NAME'=>$result['result']['NAME'],
			'SECOND_NAME'=>$result['result']['SECOND_NAME'],
			'LAST_NAME'=>$result['result']['LAST_NAME'],
			'PVZ_VALUE'=>$result['result'][$pvz_field],
			'ADDRESS_VALUE'=>$address_value,
			'CITY_VALUE'=>$result['result'][$city_field],
			'INDEX_VALUE'=>$result['result'][$index_field],
			'STREET_VALUE'=>$result['result'][$street_field],
			'DOM_VALUE'=>$result['result'][$dom_field],
			'KV_VALUE'=>$result['result'][$kv_field],
			'PHONE'=>'',
			'PVZ' => ['TITLE'=>null, "DESCRIPTION"=>[]]
		];

		if ($result['result']['HAS_EMAIL']=='Y') $response['user']['EMAIL'] = $result['result']['EMAIL'][0]['VALUE']; else $response['user']['EMAIL']='';
		
		//phone
		if (isset($result['result']['PHONE'][0]['VALUE'])) $response['user']['PHONE'] = $result['result']['PHONE'][0]['VALUE'];
		
		//Получим ПВЗ
		$pvz_result = CRest::call('crm.contact.userfield.get',[ "id"=> 275]);
		$response['pvz_list'] = [];
		if (isset($pvz_result['result']['LIST'])) {
			foreach ($pvz_result['result']['LIST'] as $pvz) {
				
				$pvz_descriptions = explode('|', $pvz['VALUE']);
				$pvz['TITLE'] = array_shift($pvz_descriptions);
				$pvz['DESCRIPTION'] = $pvz_descriptions;
				
				$response['pvz_list'][] = $pvz;
			}
			
		}
		
		//выберем наш
		if ($response['user']['PVZ_VALUE']!='') {
			foreach($response['pvz_list'] as $pvz) if ($pvz['ID']==$response['user']['PVZ_VALUE']) $response['user']['PVZ'] = $pvz;
		}
		
		//города
		$response['citites']=$deliveryClass->regions;
		
	}	else if (isset($request['user_id']) && isset($request['action']) && $request['action']==='updatePwd') {
		$result = CRest::call('crm.contact.update',["id"=> $request['user_id'], 'fields'=>[$password_field=>$request['pwd']]]);
		$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $request['user_id'], "ENTITYTYPEID"=>3, 'POST_TITLE'=>'Смена пароля в приложении', 'MESSAGE'=>'Пользователь сменил пароль в приложении.']]);
		
		$response = $result;
		
	}	else if (isset($request['phone']) && isset($request['action']) && $request['action']==='createProfile') {
		

		$phone = str_replace(" ","",$request['phone']);
		$phone = str_replace("-","",$phone);
		$phone = str_replace("(","",$phone);
		$phone = str_replace(")","",$phone);
		$phone = "7" . str_replace("-","",$phone);	
		
		$city = $request['city'];
		
		//Проверим код на совпадение
		$fp = fopen($_SERVER['DOCUMENT_ROOT'].'/mobile/phone_codes/code.+'.$phone, 'r');
		$code = fread($fp,4);
		fclose($fp);
		
		if ($code!=$request['sms']) {
			$response = ['error'=>true, 'message'=>"Код не совпадает!", 'code'=>$code, 'phone'=>$phone, 'redirect'=>false];
		} else {
			
			if ($request['email']!='') $arNewEmail = [ ['VALUE' => $request['email'],'VALUE_TYPE' => 'HOME']]; else $arNewEmail = [];
			$arNewPhone = [['VALUE' => '+'.$phone,'VALUE_TYPE' => 'HOME']];			
			$newContact = CRest::call('crm.contact.add',['fields'=>['NAME'=>$request['name'], "UF_CRM_1698999098271"=>true, 'LAST_NAME'=>$request['last_name'], 'EMAIL'=>$arNewEmail, 'PHONE'=>$arNewPhone, $city_field=>$city, $password_field=>$request['password']]]);
			
			if (isset($newContact['error']) && $newContact['error_description']!='') {
				$response = ['error'=>true, 'message'=>$newContact['error_description'], 'result'=>$newContact];
			} else {
				$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $newContact['result'], "ENTITYTYPEID"=>3, 'POST_TITLE'=>'Регистрация пользователя', "MESSAGE"=>"Регистрация пользователя в приложении"]]);
				$response = ['error'=>false, 'message'=>"Пользователь создан", 'phone'=>substr($phone,1), 'result'=>$newContact];				
			}
			

		}
		
	}	else if (isset($request['user_id']) && isset($request['action']) && $request['action']==='updateProfile') {
		//$result = CRest::call('crm.contact.update',["id"=> $request['user_id'], 'fields'=>[$password_field=>$request['pwd']]]);
		//$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $request['user_id'], "ENTITYTYPEID"=>3, 'POST_TITLE'=>'Смена пароля в приложении', 'MESSAGE'=>'Пользователь сменил пароль в приложении.']]);
		$result = CRest::call('crm.contact.get',[ "id"=> $request['user_id']]);
		$arUpdateEmail  = [
			[
				'VALUE' => $request['email'],
				'VALUE_TYPE' => 'HOME'
			]
		];		

		if (!empty($result['result']['EMAIL'][0])) {
			$arUpdateEmail  = [
				[
					'VALUE' => $request['email'],
					'ID' => $result['result']['EMAIL'][0]['ID']
				]
			];		
			
		}
		
		$result = CRest::call('crm.contact.update',["id"=> $request['user_id'], 'fields'=>['NAME'=>$request['name'], 'LAST_NAME'=>$request['last_name'], 'EMAIL'=>$arUpdateEmail  ]]);
		$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $request['user_id'], "ENTITYTYPEID"=>3, 'POST_TITLE'=>'Пользователь обновил персональные данные', "MESSAGE"=>"Пользователь обновил персональные данные в приложении"]]);
		
		
		$response = $result;
		
	}	else if (isset($request['user_id']) && isset($request['action']) && $request['action']==='updateAddress') {

		
		$fields = [
			$city_field => $request['city'],
			$index_field => $request['index'],
			$street_field => $request['street'],
			$dom_field => $request['dom'],
			$kv_field => $request['kv'],
		];
		
		$result = CRest::call('crm.contact.update',["id"=> $request['user_id'], 'fields'=>$fields]);
		$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $request['user_id'], "ENTITYTYPEID"=>3, 'POST_TITLE'=>'Пользователь обновил адрес', "MESSAGE"=>"Пользователь обновил адрес в приложении"]]);
		
		
		$response = $result;
		
	}	else if (isset($request['user_id']) && isset($request['action']) && $request['action']==='updatePushId') {
		$result = CRest::call('crm.contact.update',["id"=> $request['user_id'], 'fields'=>[$push_field=>$request['token']]]);
		$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $request['user_id'], "ENTITYTYPEID"=>3, 'POST_TITLE'=>'Пользователь получил PUSH ID', 'MESSAGE'=>"Пользователь получил PUSH ID {$request['token']}"]]);
		$response = $result;
		
	}	else if (isset($request['user_id']) && isset($request['action']) && $request['action']==='setPvz') {
		$result = CRest::call('crm.contact.update',["id"=> $request['user_id'], 'fields'=>[$pvz_field=>$request['pvz']['ID']]]);
		$title = $request['pvz']['TITLE'];
		$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $request['user_id'], "ENTITYTYPEID"=>3, 'POST_TITLE'=>'Пользователь выбрал пункт ПВЗ в приложении', 'MESSAGE'=>"Пользователь сменил ПВЗ в приложении. Новый город {$title}"]]);
		$response = $result;
		
	}	else if (isset($request['user_id']) && isset($request['action']) && $request['action']==='setCity') {
		$result = CRest::call('crm.contact.update',["id"=> $request['user_id'], 'fields'=>[$city_field=>$request['city']]]);
		$title = $request['city'];
		$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $request['user_id'], "ENTITYTYPEID"=>3, 'POST_TITLE'=>'Пользователь обновил свой город в приложении', 'MESSAGE'=>"Пользователь обновил свой город в приложении. Новый пункт {$title}"]]);
		$response = $result;
		
	}	else if (isset($request['phone']) && isset($request['action']) && $request['action']==='resetPassword') {
		$phone = str_replace(" ","",$request['phone']);
		$phone = str_replace("-","",$phone);
		$phone = str_replace("(","",$phone);
		$phone = str_replace(")","",$phone);
		$phone = "+7" . str_replace("-","",$phone);
		//Проверим на существование
		$users=[];
		$result = CRest::call('crm.contact.list',['filter'=> [ "PHONE"=> $phone], 'select'=> [ "ID", "NAME", "LAST_NAME", "TYPE_ID", "SOURCE_ID" , "PHONE", "EMAIL", "UF_*"  ]]);
		foreach ($result['result'] as $u) {
				$users[] = $u;

		}		
		if (count($users)>0) {
			
			$code = mt_rand(1000000,9999999);		
			$data = new stdClass();
			$data->to = $phone;
			$data->text = 'Ваш пароль: '.$code;
			$request = $smsru->send($data);
			if ($request->status == "OK") {
				$result = CRest::call('crm.contact.update',["id"=> $users[0]['ID'], 'fields'=>[$password_field=>$code]]);
				$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $users[0]['ID'], "ENTITYTYPEID"=>3, 'POST_TITLE'=>'Сброс пароля', 'MESSAGE'=>"Пользователь сбросил пароль в приложении через СМС"]]);
				$response = ['status'=>true, 'message'=>"Новый пароль отправлен в СМС"];
			} else {
				$response = ['status'=>false, 'message'=>"Ошибка отправки СМС"];
			}			
			
		} else {
			$response = ['status'=>false, 'message'=>"Пользователь с таким номером не существует!"];
		}
		
	}	else if (isset($request['phone']) && isset($request['action']) && $request['action']==='sendSms') {

		$phone = str_replace(" ","",$request['phone']);
		$phone = str_replace("-","",$phone);
		$phone = str_replace("(","",$phone);
		$phone = str_replace(")","",$phone);
		$phone = "+7" . str_replace("-","",$phone);
		// print_r($phone);
		//Проверим на существование
		$users=[];
		$result = CRest::call('crm.contact.list',['filter'=> [ "PHONE"=> $phone], 'select'=> [ "ID", "NAME", "LAST_NAME", "TYPE_ID", "SOURCE_ID" , "PHONE", "EMAIL", "UF_*"  ]]);
		foreach ($result['result'] as $u) {
				$users[] = $u;

		}		
		
		if (count($users)>0) {
			$response = ['status'=>false, 'message'=>"Пользователь с таким номером уже существует!"];
		} else {
			$code = mt_rand(1000,9999);		
			$data = new stdClass();
			$data->to = $phone;
			$data->text = 'Ваш код: '.$code;
			$request = $smsru->send($data);
			if ($request->status == "OK") {
				$fp = fopen($_SERVER['DOCUMENT_ROOT'].'/mobile/phone_codes/code.'.$phone, 'w');
				fwrite($fp, $code);
				fclose($fp);
				$response = ['status'=>true, 'request'=>$request, 'data'=>$data];
			} else {
				$response = ['status'=>false, 'message'=>"Ошибка отправки СМС"];
			}			
		}
		
	}
	else {
		$response = ['Request accepted'];		
	}


	header("Content-type: application/json; charset=utf-8");	
	echo json_encode($response);	
	