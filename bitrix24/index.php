<?php

$client_id = "local.62c70c38a8d839.54122474";
$client_secret = "lF40vlOcYODpbLj1GEOSpfDhUyj9MGV5rWHncs30dKrdJ3Y8pg";

if (!isset($_GET['refresh_token']) && !isset($_GET['store_token'])) {
	header("location: https://b24-hgi204.bitrix24.ru/oauth/authorize/?client_id={$client_id}&response_type=code&redirect_uri=https://bundlebox.ru/mobile/index.php?refresh_token=1");
} else if (isset($_GET['refresh_token']) ){
	if (isset($_GET['code'])) {
		// Это уже переадресация, получим аккес токены
		$code = $_GET['code'];
		//https://my.bitrix24.ru/oauth/token/?client_id=clidxxx&grant_type=authorization_code&client_secret=clsecretxxx&redirect_uri=https%3A%2F%2Fsite.ru%3Aindex.php&code=xxx&scope=crm,sonet_group
		//header("location: https://b24-hgi204.bitrix24.ru/oauth/token/?client_id={$client_id}&grant_type=authorization_code&client_secret={$client_secret}&code={$code}&scope=crm&redirect_uri=https://bundlebox.ru/mobile/index.php?store_token=1");
		
		/* получаем новый аксес_токен с помощью refresh_token */
		$ref = file_get_contents("https://b24-hgi204.bitrix24.ru/oauth/token/?client_id={$client_id}&grant_type=authorization_code&client_secret={$client_secret}&code={$code}&scope=crm&redirect_uri=https://bundlebox.ru/mobile/index.php?store_token=1");
		$ref = json_decode($ref);
		$ref = (array)$ref;
		file_put_contents($_SERVER['DOCUMENT_ROOT'].'/mobile/b24-hgi204-240.rtoken',$ref['access_token']);		
		file_put_contents($_SERVER['DOCUMENT_ROOT'].'/mobile/b24-hgi204-240.rtoken',$ref['refresh_token']);		
	}
} else if (isset($_GET['store_token']) ){

	/*$postdata = file_get_contents("php://input");
	$request = json_decode($postdata,true);
	file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log',print_r($_REQUEST,true),FILE_APPEND);
	file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log',print_r($_POST,true),FILE_APPEND);
	file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log',print_r($_GET,true),FILE_APPEND);
	file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook24.log',print_r($request,true),FILE_APPEND);*/
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Quick start. Local server-side application</title>
</head>
<body>
	<div id="name">
	Token stored.
	</div>
</body>
</html>
<?php

//require_once (__DIR__.'/crest.php');

//$result = CRest::call('user.get');

//print_r($result);
?>