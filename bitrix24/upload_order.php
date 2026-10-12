<?php
	header('Access-Control-Allow-Origin: *');
	$target_path = "user_orders/";
	
	
	require_once (__DIR__.'/crest.php');	
	$count = $_POST['count']? (int)$_POST['count'] : 0;
	$data = ['post' => $_POST, 'files'=>$_FILES, 'count'=>$count]; 
	
	if ($count>0) {

		for($i=0;$i<$count;$i++) {
			//Сначала создадим сделку
			$fields = [];
			$fields['CONTACT_ID'] = $_POST['user_id'];
			$fields['TITLE'] = "Заказ пользователя #".$_POST['user_id']."/".($i+1)." ".date("Y-m-d H:i:s");
			$fields['SOURCE_DESCRIPTION'] = "Мобильное приложение";
			
			if (isset($_POST['url_'.$i])) $fields['UF_CRM_1724510548758'] = $_POST['url_'.$i];
			if (isset($_POST['attrubutes_'.$i])) $fields['UF_CRM_1724510575518'] = $_POST['attrubutes_'.$i];
			if (isset($_POST['additional_'.$i])) $fields['UF_CRM_1724510595229'] = $_POST['additional_'.$i];
			if (isset($_POST['price_'.$i])) $fields['UF_CRM_1724510639598'] = $_POST['price_'.$i];
			if (isset($_POST['qty_'.$i])) $fields['UF_CRM_1724510618350'] = $_POST['qty_'.$i];
			
			
			
			$result_detail= CRest::call('crm.lead.add',['fields'=>$fields]);
			$data['result_detail'] = $result_detail;
			$lead_id = $result_detail['result'];
			
			
			//Сохраним файлы
			$files = [];
			$images_count = (int)$_POST['images_count_'.$i];
			if ($images_count>0) {
				
				for($current_image_index=0;$current_image_index<$images_count;$current_image_index++) {
					
					$file = $_FILES['image_'.$i.'_'.$current_image_index];
					$filename = "lead_".$lead_id."_".$i."_".$current_image_index."_".$file['name'];
					
					@unlink($target_path . $filename);	//Удалим на всякий случай
					if(move_uploaded_file($file['tmp_name'], $target_path . $filename)) {
						$lead_field = array('fileData'=>array($filename, base64_encode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/mobile/user_orders/'. $filename))));
						$files['UF_CRM_1724510528106'][] = $lead_field;
					}
				}
				$r = CRest::call('crm.lead.update',['id'=>$lead_id,"fields"=> $files, 'params'=> ["REGISTER_SONET_EVENT"=>"Y"]]);
				$data['img_detail'][] = $r;				
			}
			
			//Прикрепим их к сделке			
			
		}

		
		//Выход
		$data['success'] = true;
		$data['message'] = "Заказ отправлен. С вами свяжутся для уточнения деталей.";
		
		
	} else {
		$data['success'] = false;
		$data['message'] = "Возникла ошибка. Попробуйте позже.";	
		
	}
	



	header('Content-type: application/json'); 

	echo json_encode( $data ); 
?>	