<?php
//Новые пуши
require_once (__DIR__.'/firebase/php-jwt/JWT.php');
use Firebase\JWT\JWT;

class FCM {
	private $auth_key;
	private $fcmUrl;
	private $accessToken;
	private $oauth;
	
    function __construct($key) {
		$this->auth_key = $key;
		$this->fcmUrl  = 'https://fcm.googleapis.com/v1/projects/bundlebox38-ec14c/messages:send';
		
		
		// Загрузка данных из JSON-файла сервисного аккаунта
		$serviceAccount = json_decode(file_get_contents(__DIR__.'/firebase_key.json'), true);

		// Параметры для JWT токена
		$now = time();
		$header = ['alg' => 'RS256', 'typ' => 'JWT'];
		$payload = [
			'iss' => $serviceAccount['client_email'],
			'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
			'aud' => 'https://oauth2.googleapis.com/token',
			'iat' => $now,
			'exp' => $now + 3600
		];

		// Подпись JWT токена с использованием приватного ключа
		$jwt = JWT::encode($payload, $serviceAccount['private_key'], 'RS256');

		// Получение OAuth 2.0 токена
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
		curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
			'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			'assertion' => $jwt
		]));
		$response = curl_exec($ch);
		curl_close($ch);

		$this->oauth = json_decode($response, true);
		$this->accessToken = $this->oauth['access_token'];	
    }
   /**
    * Sending Push Notification
   */
  public function send_notification($registatoin_ids, $notification,$device_type,$data = null) {
	  
	$notification_new = [
		'message' => [
			'token' => $registatoin_ids,  // Токен устройства
			'notification' => [
				'title' => $notification['title'],
				'body' => $notification['body']
			],
		]
	];	 

	if ($data) $notification_new['message']['data'] = $data;	
	// Отправка уведомления через CURL
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $this->fcmUrl);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, [
		'Authorization: Bearer ' . $this->accessToken,
		'Content-Type: application/json'
	]);
	curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($notification_new));
	$response = curl_exec($ch);
	curl_close($ch);

	// Вывод результата
	return $response;	  
  }
  
  
  public function send_notification_old($registatoin_ids, $notification,$device_type,$data = null) {
      $url = 'https://fcm.googleapis.com/fcm/send';
      if($device_type == "Android"){
            $fields = array(
                'to' => $registatoin_ids,
                'notification' => $notification
            );
      } else {
            $fields = array(
                'to' => $registatoin_ids,
                'notification' => $notification
            );
      }
	  
	  if ($data) $fields['data'] = $data;
	  
      // Firebase API Key
      $headers = array('Authorization:key='.$this->auth_key,'Content-Type:application/json');
     // Open connection
      $ch = curl_init();
      // Set the url, number of POST vars, POST data
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      // Disabling SSL Certificate support temporarly
      curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
      curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
      $result = curl_exec($ch);
      if ($result === FALSE) {
          
		  return curl_error($ch);
      }
      curl_close($ch);
	  return $result;
  }
}   
?>