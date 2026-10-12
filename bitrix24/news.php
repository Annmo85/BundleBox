<?php
	
	//Список новостей
	

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
	//error_reporting(0);
	require_once (__DIR__.'/actions.include.php');
	$helperClass = new HelperClass();

	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata,true);
	$response = [];
	
	$limit = $request['limit']?$request['limit']:20;
	$start = $request['start']?$request['start']:0;
	
	$response['news'] = $helperClass->get_news($start, $limit);
	$response['request'] = $request;
	
	
	header("Content-type: application/json; charset=utf-8");	
	echo json_encode($response);	