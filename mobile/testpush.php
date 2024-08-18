<?php
$postdata = file_get_contents("php://input");
$request = json_decode($postdata,true);
require_once (__DIR__.'/crest.php');
require_once (__DIR__.'/firebase-fcm.php');
$push_field = 'UF_CRM_1661758328983';

//android_key
$android_push_key = "AAAAPp2G1XA:APA91bG6YeokAH0f0Yx3cUvBwM12ODVqh7MPigiE4JFaiyklcxtx3fhVqegj3BFx-yJP_1ff06uvkSSUx5bHcI-2pnABrbOA_TxvIBMdEbMrziwh7y89DSxqdkxPaZ_CtXaCIISR2MJ7";
$ios_push_key = "AIzaSyD71CmDjxMhfARZkmSdwgPixSu6LmWTI8k";
$push_id = "dy4-YV6wQ6ao7pVLv9Nh6v:APA91bGdHClbtBbmM7YWcOhasGyoc7ICsC4cnqVpjbM86Ojeln9HNOBX5kRFQxQH4S9iTag0Z9uq52a8ksUcgBpDlxIicLpAAaPvhPF_AA_5XVwDIqlTtuEI7beLF1b8FezdSMqbMJOc";

				$fcm_android = new FCM($android_push_key);
				$arrNotification["title"] ="Заказ 123 завершен";
				$arrNotification["body"] = "Ваш заказ 123 завершен. Пожалуйста, поделитесь впечатлением о полученных товарах.";
				$arrNotification["sound"] = "default";
				$arrNotification["type"] = 1;				
				$data['route'] = "open_win_order/11207";				
				$push_result = $fcm_android->send_notification($push_id, $arrNotification,"Android",$data);

?>