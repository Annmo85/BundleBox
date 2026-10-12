<?php
$postdata = file_get_contents("php://input");
$request = json_decode($postdata,true);
require_once (__DIR__.'/crest.php');
require_once (__DIR__.'/sms.ru.php');
// file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log','_POST'.print_r($_POST,true),FILE_APPEND);
$smsru = new SMSRU('797CD0B2-0676-DE9E-1432-F8178F6361C1');
$password_field = 'UF_CRM_1657095390383';
	
$post = $_POST;
if (isset($post['event']) && ($post['event']=="ONCRMCONTACTADD" || $post['event']=="ONCRMCONTACTADD")) {
	$fields = [];
	if (isset($post['data']['FIELDS'])) $fields = $post['data']['FIELDS'];
	if (isset($fields['ID']) && $fields['ID']!='') {
		$contact_id = $fields['ID'];
		$result = CRest::call('crm.contact.get',[ "id"=> $contact_id]);
		$user=$result['result'];
		if ($user['UF_CRM_1698999098271']==0) {
			$phone = $user['PHONE'][0]['VALUE'];
			$phone = str_replace(" ","",$phone);
			$phone = str_replace("-","",$phone);
			$phone = str_replace("(","",$phone);
			$phone = str_replace(")","",$phone);	
			// file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log','_phone'.print_r($phone,true),FILE_APPEND);	
			//$phone = "+79060510120";			
			$sms_text = "Вам открыт доступ к мобильному приложению BundleBox!\nЛогин - ваш номер телефона\nПароль - 123456\nСкачать приложение: https://onelink.to/tmxn8c";
			$data = new stdClass();
			$data->to = $phone;
			$data->text = $sms_text;
			$request1 = $smsru->send($data);
			if ($request1->status == "OK") {
				$result2 = CRest::call('crm.contact.update',["id"=> $contact_id, 'fields'=>[$password_field=>"123456","UF_CRM_1698999098271"=>true]]);
				$result3 = CRest::call('crm.livefeedmessage.add', ['fields'=>["ENTITYID"=> $contact_id, "ENTITYTYPEID"=>3, 'POST_TITLE'=>'Отправка доступа', 'MESSAGE'=>$sms_text]]);
			} else {
				// file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log','_contact'.print_r($result,true),FILE_APPEND);	
			}
		
		}
		//file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log','_contact'.print_r($request1,true),FILE_APPEND);		
	}
	
}

?>