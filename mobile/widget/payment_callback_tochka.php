<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// error_reporting(0);
	
require_once (dirname(__DIR__).'/firebase/php-jwt/JWT.php');
require_once (dirname(__DIR__).'/firebase/php-jwt/JWK.php');
require_once (dirname(__DIR__).'/firebase/php-jwt/Key.php');
// require_once (dirname(__DIR__).'/firebase/php-jwt/CachedKeySet.php');
// require_once (dirname(__DIR__).'/firebase/php-jwt/BeforeValidException.php');
require_once (dirname(__DIR__).'/firebase/php-jwt/JWTExceptionWithPayloadInterface.php');
// require_once (dirname(__DIR__).'/firebase/php-jwt/ExpiredException.php');
require_once (dirname(__DIR__).'/firebase/php-jwt/SignatureInvalidException.php');
use Firebase\JWT\JWT;
use Firebase\JWT\JWK;

	// Access-Control headers are received during OPTIONS requests
	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
			header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");         

		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
			header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
		exit;
	}

	
	require_once (__DIR__.'/../crest.php');
	
	$request = file_get_contents("php://input");
	

	//key eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJaUUtKYU1RNkNvVERGZTJaVDZxY1ZWdUo0TjNOWk1jeiJ9.mEInKJLu5GL746bQ_N_HPrgKs8h16QVJDQIBNVhL8jfNSQra__RDyMexqVKLAL5eLMT9gJZ6a0PlDyytfyuErSaeaYaWdbjDukv9JyuB_Fwea2MZdHbupTuu9WH_0OxuQ01QOgmbckrn4P8R0vLS6dNpeW1pq5pdK91DvpwCcskBNe5P0PBKdrsDVaDZCOEZU2zDDUJWcD3y0VZGbrF370luOdYPzpajl6hTnPYBDJBE03jVY6dLGQhL8BKKTm5s6hQDvuvdzK1lnsGSYqid3NMP_yXU7T6F6GD48SlO2QMjvPtJ78EgZ81F1KiqTfN9Ms5-DibQn1ZKLRlXaB9dVEjwjmWmJgpIqo5kOht5k6nhQUt9SojFn8hNsCLH7xXmGQ3Jk6oKiflDAFf4utsDKh403d_kUrnjImg9clOyPplME_sLppgTjAqLk6ErOTbsqXJOLeEEZMiBLGulTCURHcuUVp91D--vKrZdTZOy4CNEJi-C1D4GdWUPLa3DR8Ur
	
	//получим публичный ключ https://enter.tochka.com/doc/v2/redoc/section/Opisanie-metodov#Vebhuki
	// https://enter.tochka.com/doc/openapi/static/keys/public
	$curl = curl_init();
	curl_setopt_array($curl, array(
	  CURLOPT_URL => 'https://enter.tochka.com/doc/openapi/static/keys/public',
	  CURLOPT_RETURNTRANSFER => true,
	  CURLOPT_ENCODING => '',
	  CURLOPT_MAXREDIRS => 10,
	  CURLOPT_TIMEOUT => 0,
	  CURLOPT_FOLLOWLOCATION => true,
	  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	  CURLOPT_HTTPHEADER => array(
		'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIwQnBodXdwd28zRjljYVhab1BwR2FVYUpUV1dNSHFMayJ9.pBeJe8Wpv5XCYFGJ5NtZxPc28pz59E2QBLE7O8ziJW5Me-7OPiQZZEbDUG0GF8hsuwkiwngkesLF84ojZY1hQYWMViEQecNkEfQj0CrvOjYeg3p9cEXzVchDbZ52ymGviKozS8WEJH-XO8wwtHqT4i49iNWRu0fPsQnRwDTv7RgBQBebkA1cpkmEJ7DhnnNQMECB9MB6ud-K2ZdTdGIlHGIGUodIrQRDyLjVYAxTf4TEUegKcu4ZLwidqg-G4HptTL0HtWDbUHoU7SIyzBmsi2Lo3lSrso4OgA3vpzzHglvib5jkWwUKUDiIGRwnzBOlojC6TWZzJlS65YaVXZihXit1owPKMmeE6VOlzFnskWCfW0RydwPZluqsy55SGlBleB3uBRQCJBH6-zCeKyMzIo7FYIFtzp_jgS2XgYVfm1ccUemnm2tjDfNHOcOw96lrHViDmOmBqj4sSfgrTNCg2qCLgD8xXVK9dlvOOqAxiF2j7QRv7uayha2vGg8NK1od',
		'Content-Type: application/json'
	  ),
	));

	$json_key  = curl_exec($curl);
	$jwks = json_decode($json_key, true, 512);
	
	$decoded = [];
	try {
		$decoded = JWT::decode($request, JWK::parseKey($jwks,"RS256"));
		
		// Тело вебхука
		$decoded_array = (array)$decoded;
		
		//Operation ID
		if (isset($decoded_array['webhookType']) && $decoded_array['webhookType']=="acquiringInternetPayment") {
			
			//Интернерт платеж
			$purpose = $decoded_array['purpose'];
			$deals_string = substr($purpose,strpos($purpose, "[")+1);
			$deals_string = str_replace("]","", $deals_string);
			$deals = explode(".",$deals_string);
			foreach ($deals as $lead) {
				
				$fields = ['STAGE_ID'=>'PREPAYMENT_INVOICE'];
				CRest::call('crm.deal.update',['id'=>$lead,"fields"=> $fields, 'params'=> ["REGISTER_SONET_EVENT"=>"Y"]]);
			}			

			file_put_contents(__DIR__.'/1113.log',print_r([$decoded_array,$deals_string],true),FILE_APPEND);	
		}

		
	} catch (\UnexpectedValueException $e) {
		// Неверная подпись, вебхук не от Точки или с ним что-то не так
		echo "Invalid webhook";
	}	
	
?>