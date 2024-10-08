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
	
	$contact_id = (int)$_GET['id'];

	if (!$contact_id) exit;
	
	
	//Выбеерем сделки на оплату
	(float)$summ = 0;
	$ids = [];
	$ids1 = [];

	if (isset($_GET['deal_id'])) {
		$result = CRest::call('crm.deal.list',['select'=>['*','UF_CRM_1652413077471','UF_CRM_1670510435755','UF_CRM_1670510894504','UF_CRM_1663669969647','UF_CRM_1663669994797','UF_CRM_1659879523001','UF_CRM_1664092353750','UF_CRM_1668785031029','UF_CRM_1668784831705','UF_CRM_1668721376367','UF_CRM_1659879763963'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['CONTACT_ID' => $contact_id, 'STAGE_ID'=>"PREPARATION","ID"=>$_GET['deal_id']]]);	
	} else {
		$result = CRest::call('crm.deal.list',['select'=>['*','UF_CRM_1652413077471','UF_CRM_1670510435755','UF_CRM_1670510894504','UF_CRM_1663669969647','UF_CRM_1663669994797','UF_CRM_1659879523001','UF_CRM_1664092353750','UF_CRM_1668785031029','UF_CRM_1668784831705','UF_CRM_1668721376367','UF_CRM_1659879763963'],"order"=> [ "DATE_CREATE"=> "DESC" ], 'filter' => ['CONTACT_ID' => $contact_id, 'STAGE_ID'=>"PREPARATION"]]);	
		
	}

	$result1 = CRest::call('crm.contact.get',[ "id"=> $contact_id]);
	$user = $result1['result'];
	$email = "";
	$phone = "";
	if ($user['HAS_EMAIL']=='Y') $email = $user['EMAIL'][0]['VALUE']; else $email='';
	
	//phone
	if (isset($user['PHONE'][0]['VALUE'])) $phone = $user['PHONE'][0]['VALUE'];	
	
	
	foreach ($result['result'] as $lead) {
		
		$summ += (float)$lead["OPPORTUNITY"];
		$ids[]=$lead["ID"];
		$ids1[]="#".$lead["TITLE"];
	}
	
	
	$title = "Оплата заказов ".implode(" ,",$ids1);
	if (isset($_GET['deal_id'])) {
		$title = "Оплата заказа ".implode(" ,",$ids1);
	}
	
	
	$receipt = [
		"Phone"=> str_replace("+","",$phone),
		"Email"=> $email,
		"Taxation"=> "usn_income",
		"FfdVersion"=> "1.2",
		"Items"=> [
			[
				"Name" =>$title,
				"Price"=> $summ *100,
				"Quantity"=> 1.00,
				"Amount"=> $summ*100,
				"PaymentMethod"=> "full_prepayment",
				"PaymentObject"=> "service",
				"Tax"=> "none",
				"MeasurementUnit"=> "pc",
			]
		]	
	];

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?php echo $title;?></title>
	<style>
		.payform-tbank {
			display: -webkit-box;
			display: -ms-flexbox;
			display: flex;
			margin: 2px auto;
			-webkit-box-orient: vertical;
			-webkit-box-direction: normal;
			-ms-flex-direction: column;
			flex-direction: column;
			max-width: 250px;
		}
		.payform-tbank-row {
			margin: 2px;
			border-radius: 4px;
			-webkit-box-flex: 1;
			-ms-flex: 1;
			flex: 1;
			-webkit-transition: 0.3s;
			-o-transition: 0.3s;
			transition: 0.3s;
			border: 1px solid #DFE3F3;
			padding: 15px;
			outline: none;
			background-color: #DFE3F3;
			font-size: 15px;
		}
		.payform-tbank-row:focus {
			background-color: #FFFFFF;
			border: 1px solid #616871;
			border-radius: 4px;
		}
		.payform-tbank-btn {
			background-color: #FBC520;
			border: 1px solid #FBC520;
			color: #3C2C0B;
		}
		.payform-tbank-btn:hover {
			background-color: #FAB619;
			border: 1px solid #FAB619;
		}
	</style>

</head>
<body>
<?php //print_r($result['result']);?>
    <script src="https://securepay.tinkoff.ru/html/payForm/js/tinkoff_v2.js"></script>
	<form class="payform-tbank" name="payform-tbank" id="payform-tbank"  onsubmit="pay(this); return false;" style="display:none;">
		<input class="payform-tbank-row" type="hidden" name="terminalkey" value="1723684640198">
		<input class="payform-tbank-row" type="hidden" name="DATA" value="AccountId=<?php echo $contact_id?>|leads=<?php echo implode(",",$ids);?>">
		<input class="payform-tbank-row" type="hidden" name="frame" value="false">
		<input class="payform-tbank-row" type="hidden" name="language" value="ru">
		<input class="payform-tbank-row" type="hidden" name="receipt" value='<?php echo json_encode($receipt)?>'>
		<input class="payform-tbank-row" type="text" placeholder="Сумма заказа" name="amount" required value="<?php echo $summ?>">
		<input class="payform-tbank-row" type="hidden" placeholder="Номер заказа" name="order">
		<input class="payform-tbank-row" type="text" placeholder="Описание заказа" name="description" value="<?php echo $title?>">
		<input class="payform-tbank-row" type="text" placeholder="ФИО плательщика" name="name">
		<input class="payform-tbank-row" type="email" placeholder="E-mail" name="email" value="<?php echo $email?>">
		<input class="payform-tbank-row" type="tel" placeholder="Контактный телефон" name="phone" value="<?php echo str_replace("+","",$phone)?>">
		 <input class="payform-tbank-row" type="hidden" name="deal_id" value="<?php echo $_GET['deal_id']?>"> 
		 <input class="payform-tbank-row" type="hidden" name="id" value="<?php echo $_GET['id']?>"> 
		<input class="payform-tbank-row payform-tbank-btn" id="submit_button" type="submit" value="Оплатить" >
	</form>

	<script>
	
	    window.onload=function(){
			setTimeout(function() { submitform() }, 300);
			

			function submitform(){
			  
			  var hangoutButton = document.getElementById("submit_button");
			  hangoutButton.click();
			}
    }
	
	// let language = "ru-RU"

	// var payments = new cp.CloudPayments({
		// language: "ru-RU",
		// email: "",
		// applePaySupport: true,
		// googlePaySupport: true,
		// yandexPaySupport: true,
		// tinkoffPaySupport: true,
		// tinkoffInstallmentSupport: false,
		// sbpSupport: true,
	// });


	// payments.pay("charge", {
		// publicId: "pk_eb46068d7ef49a3333127caabc127",
		// description: "<?php echo $title?>",
		// amount: <?php echo $summ?>,
		// currency: "RUB",
		// invoiceId: "155",
		// accountId: "<?php echo $contact_id?>",
		// email: "",
		// skin: "classic",
		// data: {
			// leads: '<?php echo implode(",",$ids);?>',
		// },
		// requireEmail: false,
	// }, {
		// onSuccess: "https://bundlebox.ru/mobile/widget/delivery_done.php",
		// onFail: "https://bundlebox.ru/mobile/widget/delivery_fail.php",
			
	// });


	</script>

</body>

</html>