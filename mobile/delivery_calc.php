<?php
	//Калькулятор доставки
	/*
	Добрый день,
	Документация
	https://docs.google.com/document/d/1Mmj4ndp6gqxkv7F1iBe5cyqHkiork0brxOMbhG46db4/edit

	​​​​​​​Ключ можно получить сделав запрос к api/auth используя свои логин и пароль от аккаунта. Если это по каким-то причинам не подходит, вот ключ

	KuWhFkbz9IYNvUxL7CkD7Ia-3OfgqkLq

	​​​​​​​Спасибо

	Thanks for your cooperation

	--
	Shopogolic Ltd, Unit 2, Bermuda Road, Ipswich, IP3 9RU
	*/


	require_once (__DIR__.'/delivery_calc_class.php');

	
	$text = <<<EOF
<p><b>Заказ можно получить 2-мя способами:</b></p>

<p>📦 <b>Отдельной посылкой:</b><br>
Заказ высылается из страны покупки напрямую по вашему адресу.</p>
<p>➕ Плюсы:<br>
+ посылка доходит быстрее (10-20 дней)<br>
+ меньше рисков знакомства с таможней<br></p>
<p>➖ Минусы:<br>
- выше стоимость<br>
- дороже участие в совместных заказах<br>
*стоимость доставки рассчитывается с помощью калькулятора выше</p>

<p>📦 <b>Сборной посылкой</b><br>
Заказ сперва приезжает на территорию РФ в составе общего груза, затем отправляется по вашему адресу почтой или курьерской службой.</p>
➕ Плюсы:<br>
+ дешевле стоимость доставки <br>
+ участие в совместных заказах<br>
+ возможность получать в одной посылке заказы из разных стран<br>
+ небольшие заказы (до 1 кг) выгоднее отправлять сборной посылкой<br></p>
<p>➖ Минусы:<br>
- выше срок доставки (20-40 дней)<br>
- выше риск задержек<br>
*со стоимостью доставки можно ознакомиться в условиях (ссылка на условия)</p>

EOF;

$note_text = <<<EOF
	<p>Жителям Иркутска <b>скидка на доставку 30%</b> при отправке заказа в общей посылке</p>
EOF;

	
	$text1 = <<<EOF
<p><b>Заказ можно получить 2-мя способами:</b></p>
EOF;

	$text2 = <<<EOF
<p>📦 <b>Отдельной посылкой:</b><br>
Заказ высылается из страны покупки напрямую по вашему адресу.</p>
<p><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
  <g clip-path="url(#a)">
    <circle cx="7" cy="7" r="5.833" stroke="url(#b)" stroke-width="1.2"/>
    <path stroke="url(#c)" stroke-linecap="round" stroke-width="1.2" d="M8.75 7H7m0 0H5.25M7 7V5.25M7 7v1.75"/>
  </g>
  <defs>
    <linearGradient id="b" x1="7" x2="7" y1="1.167" y2="12.833" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EF7004"/>
      <stop offset="1" stop-color="#FFB422"/>
    </linearGradient>
    <linearGradient id="c" x1="7" x2="7" y1="5.25" y2="8.75" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EF7004"/>
      <stop offset="1" stop-color="#FFB422"/>
    </linearGradient>
    <clipPath id="a">
      <path fill="#fff" d="M0 0h14v14H0z"/>
    </clipPath>
  </defs>
</svg>

 Плюсы:<br>
- посылка доходит быстрее (10-20 дней)<br>
- меньше рисков знакомства с таможней<br></p>
<p><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
  <g clip-path="url(#a)">
    <circle cx="7" cy="7" r="5.833" stroke="url(#b)" stroke-width="1.2"/>
    <path stroke="url(#c)" stroke-linecap="round" stroke-width="1.2" d="M8.75 7h-3.5"/>
  </g>
  <defs>
    <linearGradient id="b" x1="7" x2="7" y1="1.167" y2="12.833" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EF7004"/>
      <stop offset="1" stop-color="#FFB422"/>
    </linearGradient>
    <linearGradient id="c" x1="8.75" x2="5.25" y1="7.5" y2="7.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EF7004"/>
      <stop offset="1" stop-color="#FFB422"/>
    </linearGradient>
    <clipPath id="a">
      <path fill="#fff" d="M0 0h14v14H0z"/>
    </clipPath>
  </defs>
</svg>


 Минусы:<br>
- выше стоимость<br>
- дороже участие в совместных заказах<br>
*стоимость доставки рассчитывается с помощью калькулятора выше</p>
EOF;

	$text3 = <<<EOF
<p>📦 <b>Сборной посылкой</b><br>
Заказ сперва приезжает на территорию РФ в составе общего груза, затем отправляется по вашему адресу почтой или курьерской службой.</p>
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
  <g clip-path="url(#a)">
    <circle cx="7" cy="7" r="5.833" stroke="url(#b)" stroke-width="1.2"/>
    <path stroke="url(#c)" stroke-linecap="round" stroke-width="1.2" d="M8.75 7H7m0 0H5.25M7 7V5.25M7 7v1.75"/>
  </g>
  <defs>
    <linearGradient id="b" x1="7" x2="7" y1="1.167" y2="12.833" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EF7004"/>
      <stop offset="1" stop-color="#FFB422"/>
    </linearGradient>
    <linearGradient id="c" x1="7" x2="7" y1="5.25" y2="8.75" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EF7004"/>
      <stop offset="1" stop-color="#FFB422"/>
    </linearGradient>
    <clipPath id="a">
      <path fill="#fff" d="M0 0h14v14H0z"/>
    </clipPath>
  </defs>
</svg>

 Плюсы:<br>
- дешевле стоимость доставки <br>
- участие в совместных заказах<br>
- возможность получать в одной посылке заказы из разных стран<br>
- небольшие заказы (до 1 кг) выгоднее отправлять сборной посылкой<br></p>
<p><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
  <g clip-path="url(#a)">
    <circle cx="7" cy="7" r="5.833" stroke="url(#b)" stroke-width="1.2"/>
    <path stroke="url(#c)" stroke-linecap="round" stroke-width="1.2" d="M8.75 7h-3.5"/>
  </g>
  <defs>
    <linearGradient id="b" x1="7" x2="7" y1="1.167" y2="12.833" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EF7004"/>
      <stop offset="1" stop-color="#FFB422"/>
    </linearGradient>
    <linearGradient id="c" x1="8.75" x2="5.25" y1="7.5" y2="7.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EF7004"/>
      <stop offset="1" stop-color="#FFB422"/>
    </linearGradient>
    <clipPath id="a">
      <path fill="#fff" d="M0 0h14v14H0z"/>
    </clipPath>
  </defs>
</svg>


 Минусы:<br>
- выше срок доставки (20-40 дней)<br>
- выше риск задержек<br>
*со стоимостью доставки можно ознакомиться в условиях (ссылка на условия)</p>
EOF;

$note_text = <<<EOF
	<p>Жителям Иркутска <b>скидка на доставку 30%</b> при отправке заказа в общей посылке</p>
EOF;

	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL); 
	error_reporting(0);
	// Access-Control headers are received during OPTIONS requests
	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
			header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");         

		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
			header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
		exit;
	}
	
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata,true);	


	if (!isset($request['city']) || ($request['city']!="Иркутск" && $request['city']!="Иркутская область")) $note_text = "";	//Текст видят только жители иркутска


	$email = 'annamoiseevaa@gmail.com';
	$password = 'Moiseevaanna85!';
	$api_url = 'https://shopogolic.net/api/auth';

	// Кодируем email и пароль в формат MIME base64
	$token = base64_encode($email . ':' . $password);

	// Создаем POST запрос с заголовком Authorization
	$ch = curl_init($api_url);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		'Authorization: Basic ' . $token
	));
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$response = curl_exec($ch);
	curl_close($ch);

	$response = json_decode($response, true);

	$key = "";
	if (isset($response['auth_key'])) $key=$response['auth_key'];
	
	if ($key!="") {
		
		if ($request['action']=="getWarehouses") {
			$response = [];
			$response['warehouses'] = getWarehouse($key,$text,$note_text, $text1, $text2, $text3);
		}		
		if ($request['action']=="getDeliveryPrice") {
			$response = [];
			$response['rates'] = getDeliveryPrice($key, $request['warehouse_id'], (float)$request['weight'],$request['city']);
		}		
		if ($request['action']=="getCities") {
			$response = [];
			$response['cities'] = getCities();
		}
	}

	//Получить список складов
	function getWarehouse($key, $text, $note_text, $text1, $text2, $text3) {
		$api_url = 'https://shopogolic.net/api/warehouses';
		$expand = 'country,address'; // дополнительные свойства

		// Кодируем ключ пользователя в формат MIME base64
		$token = base64_encode($key.':');

		// Создаем GET запрос с параметром expand и заголовками Authorization, Accept и Content-Type
		$ch = curl_init($api_url . '?expand=' . $expand);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, [
			'Authorization: Basic ' . $token,
			'Accept: application/json',
			'Content-Type: application/json'
		]);

		$response = curl_exec($ch);
		curl_close($ch);

		$warehouses = json_decode($response, true);
		foreach($warehouses as &$warehouse) {
			if ($warehouse['country']['name']=="UK") $warehouse['country']['name_ru'] = "Англия";
			else if ($warehouse['country']['name']=="Germany") $warehouse['country']['name_ru'] = "Германия";
			else if ($warehouse['country']['name']=="Poland") $warehouse['country']['name_ru'] = "Польша";
			else if ($warehouse['country']['name']=="Israel") $warehouse['country']['name_ru'] = "Израиль";
			else if ($warehouse['country']['name']=="Italy") $warehouse['country']['name_ru'] = "Италия";
			else if ($warehouse['country']['name']=="France") $warehouse['country']['name_ru'] = "Франция";
			else if ($warehouse['country']['name']=="Spain") $warehouse['country']['name_ru'] = "Испания";
			else if ($warehouse['country']['name']=="Kazakhstan") $warehouse['country']['name_ru'] = "Казахстан";
			else $warehouse['country']['name_ru'] = $warehouse['country']['name'];
		}
		
		$warehouses[] = [
			"id"=>9999,
			"country_id"=>9999,
			"currency"=>"EUR",
			"country"=>[
				"name"=>"USA",
				"name_ru"=>"США",
				"id"=>9999,
			],
			
		];
		
		$warehouses[] = [
			"id"=>9998,
			"country_id"=>9998,
			"currency"=>"RUB",
			"country"=>[
				"name"=>"China",
				"name_ru"=>"Китай",
				"id"=>9998,
			],
			
		];
		
		return ['warehouses'=>$warehouses,'text'=>$text,'text1'=>$text1,'text2'=>$text2,'text3'=>$text3,'note_text'=>$note_text];
		
	}
	
	function getCities() {
		$deliveryClass = new DeliveryClass();
		return $deliveryClass->regions;
	}
	
	function getDeliveryPrice($key,$warehouse_id,$weight, $city='') {
		
		//Если запрос к классу, то обрабатываем иначе
		if ($warehouse_id==9999) {
			$deliveryClass = new DeliveryClass($city);
			$rates = [];
			$rate = [
				"id"=>9999,
				"warehouse_id"=>9999,
				"name"=>"USA",
				"calculated_price"=>$weight>20?'-':$deliveryClass->calc($weight),
			];
			return ['rates'=>$rates,'rate'=>$rate,'city1'=>$city];
		}		
		
		//Если запрос к классу, то обрабатываем иначе
		if ($warehouse_id==9998) {
			$deliveryClass = new DeliveryClass($city);
			$rates = [];
			$number = $weight;
			$r = 0.5;
			// разделим число на коэффициент, а результат округлим в большую сторону. Потом умножим число на округленный коэффициент
			$rest = ceil($number / $r) * $r;			
			$rate = [
				"id"=>9998,
				"warehouse_id"=>9998,
				"name"=>"Китай",
				"calculated_price"=>(int)(1100*$rest),
			];
			return ['rates'=>$rates,'rate'=>$rate,'city1'=>$city];
		}
		
		
		
		$api_url = 'https://shopogolic.net/api/parcels/rate';
		$expand = 'country,address,price,prices'; // дополнительные свойства
		$data = array(
			'warehouse_id' => $warehouse_id,
			'weight' => (float)$weight,
			'length' => "0",
			'width' => "0",
			'height' => "0",			
			'country_code' => 'RU'
		); // дополнительные свойства

		// Кодируем ключ пользователя в формат MIME base64
		$token = base64_encode($key.':');

		// Создаем GET запрос с параметром expand и заголовками Authorization, Accept и Content-Type
		$ch = curl_init($api_url  . '?expand=' . $expand );
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_HTTPHEADER, [
			'Authorization: Basic ' . $token,
			'Accept: application/json',
			'Content-Type: application/json'
		]);

		$response = curl_exec($ch);
		curl_close($ch);

		$rates = json_decode($response, true);
		

		$max_price = max(array_column(array_filter($rates['couriers'], function($item) {
			return isset($item['calculated_price']);
		}), 'calculated_price'));

		$max_price_item = current(array_filter($rates['couriers'], function($item) use ($max_price) {
			return isset($item['calculated_price']) && $item['calculated_price'] == $max_price;
		}));
		
		//найдем максимум, округлим
		$rate = $rates['couriers'][0];
		//print_r($rate);
		foreach($rates['couriers'] as $r) {
			//print_r($r);
			if ($rate['calculated_price']<$r['calculated_price']) $rate = $r;
		}
		
		return ['rates'=>$rates,'rate'=>$rate,'city'=>$city];
		
	}
	
	

	

	header("Content-type: application/json; charset=utf-8");	
	echo json_encode($response);
?>