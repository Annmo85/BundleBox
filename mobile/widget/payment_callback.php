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
	
	require_once (__DIR__.'/../crest.php');
	
	$request = file_get_contents("php://input");
	$post = json_decode($request,true);
	
	if (isset($post['Data']) && $post['Status']=="CONFIRMED") {
		$post = $post["Data"];
		$contact_id = $post["AccountId"];
		$leads = explode(",",$post['leads']);
		$result = CRest::call('crm.deal.list',['select'=>['*','UF_CRM_1652413077471','UF_CRM_1670510435755','UF_CRM_1670510894504','UF_CRM_1663669969647','UF_CRM_1663669994797','UF_CRM_1659879523001','UF_CRM_1664092353750','UF_CRM_1668785031029','UF_CRM_1668784831705','UF_CRM_1668721376367','UF_CRM_1659879763963'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['CONTACT_ID' => $contact_id, 'STAGE_ID'=>"PREPARATION", "ID"=>$leads]]);
		foreach ($result['result'] as $lead) {
			
			//удалим кеш и сменим статус
			$fields = ['STAGE_ID'=>'PREPAYMENT_INVOICE'];
			@unlink(dirname(__DIR__).'/leadscache/leads_'.$lead['CONTACT_ID'].'.json');
			@unlink(dirname(__DIR__).'/leadscache/closedleads_'.$lead['CONTACT_ID'].'.json');
			@unlink(dirname(__DIR__).'/leadscache/lead_'.$lead['ID'].'.json');				
			CRest::call('crm.deal.update',['id'=>$lead['ID'],"fields"=> $fields, 'params'=> ["REGISTER_SONET_EVENT"=>"Y"]]);		
		}		
	}
	
	// $data = $post["Data"];
	// $contact_id = $post["AccountId"];
	// $leads = json_decode($data,true);
	// $leads = explode(",",$leads['leads']);
	
	// $result = CRest::call('crm.deal.list',['select'=>['*','UF_CRM_1652413077471','UF_CRM_1670510435755','UF_CRM_1670510894504','UF_CRM_1663669969647','UF_CRM_1663669994797','UF_CRM_1659879523001','UF_CRM_1664092353750','UF_CRM_1668785031029','UF_CRM_1668784831705','UF_CRM_1668721376367','UF_CRM_1659879763963'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['CONTACT_ID' => $contact_id, 'STAGE_ID'=>"PREPARATION", "ID"=>$leads]]);
	// foreach ($result['result'] as $lead) {
		
		// //удалим кеш и сменим статус
		// $fields = ['STAGE_ID'=>'PREPAYMENT_INVOICE'];
		// @unlink(dirname(__DIR__).'/leadscache/leads_'.$lead['CONTACT_ID'].'.json');
		// @unlink(dirname(__DIR__).'/leadscache/closedleads_'.$lead['CONTACT_ID'].'.json');
		// @unlink(dirname(__DIR__).'/leadscache/lead_'.$lead['ID'].'.json');				
		// CRest::call('crm.deal.update',['id'=>$lead['ID'],"fields"=> $fields, 'params'=> ["REGISTER_SONET_EVENT"=>"Y"]]);		
	// }	
	
	
	file_put_contents(__DIR__.'/1112.log',print_r($request,true),FILE_APPEND);
?>