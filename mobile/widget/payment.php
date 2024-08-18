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

	
	
	foreach ($result['result'] as $lead) {
		
		$summ += (float)$lead["UF_CRM_1663669994797"];
		$ids[]=$lead["ID"];
		$ids1[]="#".$lead["TITLE"];
	}
	
	
	$title = "Оплата заказов ".implode(" ,",$ids1);
	if (isset($_GET['deal_id'])) {
		$title = "Оплата заказа ".implode(" ,",$ids1);
	}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?php echo $title;?></title>
    <script src="https://widget.cloudpayments.ru/bundles/cloudpayments.js"></script>
</head>
<body>

	<script>
	let language = "ru-RU"

	var payments = new cp.CloudPayments({
		language: "ru-RU",
		email: "",
		applePaySupport: true,
		googlePaySupport: true,
		yandexPaySupport: true,
		tinkoffPaySupport: true,
		tinkoffInstallmentSupport: false,
		sbpSupport: true,
	});


	payments.pay("charge", {
		publicId: "pk_eb46068d7ef49a3333127caabc127",
		description: "<?php echo $title?>",
		amount: <?php echo $summ?>,
		currency: "RUB",
		invoiceId: "155",
		accountId: "<?php echo $contact_id?>",
		email: "",
		skin: "classic",
		data: {
			leads: '<?php echo implode(",",$ids);?>',
		},
		requireEmail: false,
	}, {
		onSuccess: "https://bundlebox.ru/mobile/widget/delivery_done.php",
		onFail: "https://bundlebox.ru/mobile/widget/delivery_fail.php",
			
	});


	</script>

</body>

</html>