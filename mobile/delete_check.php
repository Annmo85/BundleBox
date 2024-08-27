<?php

	//Удаление картинки

	header('Access-Control-Allow-Origin: *');
	$target_path = "checks/";
	$filename = date("YmdHis") . '.jpg';
	
	if ($_POST['type']=='order') $filename = $_POST['lead_id'] . '-order.jpg'; 
	else if ($_POST['type']=='delivery') $filename = $_POST['lead_id'] . '-delivery.jpg'; 
	
	$target_path = $target_path . $filename;
	@unlink($target_path);
	
	//change stage
	require_once (__DIR__.'/crest.php');
	$result_detail= CRest::call('crm.deal.get',['id'=>$_POST['lead_id']]);
	$deal = $result_detail['result'];
	
		
	$fields = [];
	if ($_POST['type']=='order') {

		
		//UF_CRM_1670510435755
		$UF_CRM_1670510894504 = "";
		$fields['UF_CRM_1670510894504'] = $UF_CRM_1670510894504;
		
		$notifify_file = [$filename,base64_encode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/mobile/checks/'. $filename))];
		$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $deal['ID'], "ENTITYTYPEID"=>2, 'POST_TITLE'=>'Удалено фото оплаты заказа', 'MESSAGE'=>"Пользователь удалил фото оплаты заказа через приложение"]]);
		
	} else if ($_POST['type']=='delivery') {
		$UF_CRM_1670510435755 = array('fileData'=>array($filename, base64_encode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/mobile/checks/'. $filename))));
		$fields['UF_CRM_1670510435755'] = $UF_CRM_1670510435755;	
		$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $deal['ID'], "ENTITYTYPEID"=>2, 'POST_TITLE'=>'Удалено фото оплаты доставки', 'MESSAGE'=>"Пользователь удалил фото оплаты доставки через приложение"]]);
	}	
	
	//Передвинем
	$r = CRest::call('crm.deal.update',['id'=>$deal['ID'],"fields"=> $fields, 'params'=> ["REGISTER_SONET_EVENT"=>"Y"]]);
	@unlink(__DIR__.'/leadscache/leads_'.$deal['CONTACT_ID'].'.json');
	@unlink(__DIR__.'/leadscache/lead_'.$deal['ID'].'.json');
		
	/*$data['deal'] = $deal;
	$data['fields'] = $fields;
	$data['r'] = $r;*/
	echo json_encode( $data ); 	
	
	

?>