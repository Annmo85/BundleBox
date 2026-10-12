<?php
	header('Access-Control-Allow-Origin: *');
	$target_path = "checks/";
	$filename = date("YmdHis") . '.jpg';
	
	if ($_POST['type']=='order') $filename = $_POST['lead_id'] . '-order.jpg'; 
	else if ($_POST['type']=='delivery') $filename = $_POST['lead_id'] . '-delivery.jpg'; 
	
	$target_path = $target_path . $filename;
	@unlink($target_path);

	if(move_uploaded_file($_FILES['file']['tmp_name'], $target_path)) {
		header('Content-type: application/json');
		$data = ['success' => true, 'message' => 'Файл успешно загружен. Заказ обновиться в течении нескольких минут.']; 
		$data['post'] = $_POST;

		
		//change stage
		require_once (__DIR__.'/crest.php');
		$result_detail= CRest::call('crm.deal.get',['id'=>$_POST['lead_id']]);
		$deal = $result_detail['result'];

		$fields = [];
		if ($_POST['type']=='order') {
			$fields['STAGE_ID'] ='PREPAYMENT_INVOICE';
			
			//UF_CRM_1670510435755
			$UF_CRM_1670510894504 = array('fileData'=>array($filename, base64_encode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/mobile/checks/'. $filename))));
			$fields['UF_CRM_1670510894504'] = $UF_CRM_1670510894504;
			
			$notifify_file = [$filename,base64_encode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/mobile/checks/'. $filename))];
			$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $deal['ID'], "ENTITYTYPEID"=>2, 'POST_TITLE'=>'Добавлено фото оплаты заказа', 'MESSAGE'=>"Пользователь прикрепил фото оплаты заказа через приложение",'FILES'=>[$notifify_file]]]);
			
		} else if ($_POST['type']=='delivery') {
			$fields['STAGE_ID'] ='UC_WW865W';
			$UF_CRM_1670510435755 = array('fileData'=>array($filename, base64_encode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/mobile/checks/'. $filename))));
			$fields['UF_CRM_1670510435755'] = $UF_CRM_1670510435755;	
			$notifify_file = [$filename,base64_encode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/mobile/checks/'. $filename))];			
			$result1 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $deal['ID'], "ENTITYTYPEID"=>2, 'POST_TITLE'=>'Добавлено фото оплаты доставки', 'MESSAGE'=>"Пользователь прикрепил фото оплаты доставки через приложение",'FILES'=>[$notifify_file]]]);
		}
		
		//Передвинем
		$r = CRest::call('crm.deal.update',['id'=>$deal['ID'],"fields"=> $fields, 'params'=> ["REGISTER_SONET_EVENT"=>"Y"]]);
		@unlink(__DIR__.'/leadscache/leads_'.$deal['CONTACT_ID'].'.json');
		@unlink(__DIR__.'/leadscache/lead_'.$deal['ID'].'.json');
			
		/*$data['deal'] = $deal;
		$data['fields'] = $fields;
		$data['r'] = $r;*/
		echo json_encode( $data ); 
	} else{
		header('Content-type: application/json'); 
		$data = ['success' => false, 'message' => 'There was an error uploading the file, please try again!']; 
		$data['post'] = $_POST;
		echo json_encode( $data ); 
	} 

?>