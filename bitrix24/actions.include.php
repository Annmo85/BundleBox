<?php
	
	class HelperClass {
		
		
		protected $dbhost = "localhost";
		protected $dbuser = "annamonh_prod";
		protected $dbpwd = "12345678";
		protected $dbname = "annamonh_prod";

		//Эта функция запросит данные по акциям из базы
		public function get_actions($limit = 0) {
			
			$return = [];
			
			$mysqli = mysqli_connect($this->dbhost, $this->dbuser, $this->dbpwd);
			
			if ($mysqli == false){
				$return['mysql_error'] = "Ошибка: Невозможно подключиться к MySQL " . mysqli_connect_error();
			} else {
				mysqli_select_db($mysqli, $this->dbname);
				$sql = "select ua.*, bc.name as country_name , bc.alias as country_alias, base_images.name as single_image_name, base_images.folder as single_image_folder  from user_orders ua 
				left join base_countries bc on bc.id=ua.country_id 
				left join base_images on base_images.id=ua.image_id_group 
				where ua.visible=1 
				order by ua.created_at desc
				";
				if ($limit!=0) $sql .= ' limit '.$limit;
				if ($result = $mysqli->query($sql)) { 
					while($obj = $result->fetch_assoc()){ 
						$item = $obj;
						$item['image'] = str_replace(' ', '%20', 'https://bundlebox.ru/image/'. $item['single_image_folder'] .'/'.$item['single_image_name']);
						
						$item['end_date'] = null;
						if ($item['discount_duration_group']!="" && !is_null($item['discount_duration_group'])) {
							
							$discount_duration_group = strtotime($item['discount_duration_group']);
							$discount_duration_group = date("Y-m-d 23:59:59",$discount_duration_group);
							
							//$replaced = str_replace('.', '-', $item['discount_duration_group']);
							//$end_date = substr($replaced, 12);
							
							//$item['end_date'] = date("Y-m-d 23:59:59",strtotime(' + 24 Hours',$discount_duration_group));	//????
							$item['end_date'] = $discount_duration_group;	//????


						}
						
						$item['action_type'] = "timer";
						if ($item['discount_condition_group']=="1") $item['action_type'] = "discont";					
						
						$return[]= $item;
					} 
					$result->close();
				}			
			}
			
			return $return;
		}
		
		
		
		//Эта функция запросит данные по акциям из базы
		public function get_news($start = 0, $limit = 3) {
			
			$return = [];
			
			$mysqli = mysqli_connect($this->dbhost, $this->dbuser, $this->dbpwd);
			
			if ($start!=0) $start = ($start) * $limit;
			
			if ($mysqli == false){
				$return['mysql_error'] = "Ошибка: Невозможно подключиться к MySQL " . mysqli_connect_error();
			} else {
				mysqli_select_db($mysqli, $this->dbname);
				$sql = "select mn.*, base_images.name as single_image_name, base_images.folder as single_image_folder, mnc.name as category_name  from main_news mn 
				left join base_images on base_images.id=mn.image_id 
				left join main_news_categories mnc on mnc.id=mn.category_id 
				order by mn.public_at desc 
				limit {$start}, {$limit}
				";
				if ($result = $mysqli->query($sql)) { 
					while($obj = $result->fetch_assoc()){ 
						$item = $obj;
						$item['image'] = str_replace(' ', '%20', 'https://bundlebox.ru/image/'. $item['single_image_folder'] .'/'.$item['single_image_name']);
						$item['public_date'] =  date("d.m.Y",strtotime($item['public_at']));
						$return[]= $item;
					} 
					$result->close();
				}			
			}
			
			return $return;
		}		
		
		//Эта функция запросит данные по магазинам из базы
		public function get_stores($start = 0, $limit = 6) {
			
			$return = [];
			
			$mysqli = mysqli_connect($this->dbhost, $this->dbuser, $this->dbpwd);
			
			if ($start!=0) $start = ($start) * $limit;
			
			if ($mysqli == false){
				$return['mysql_error'] = "Ошибка: Невозможно подключиться к MySQL " . mysqli_connect_error();
			} else {
				mysqli_select_db($mysqli, $this->dbname);
				$sql = "select ms.*, base_images.name as single_image_name, bi2.name as single_image_name2, base_images.folder as single_image_folder,  bi2.folder as single_image_folder2 from main_stores ms 
				left join base_images on base_images.id=ms.single_image_id 
				left join base_images bi2 on bi2.id=ms.image_id order by ms.id desc 
				limit {$start}, {$limit} 
				";
				if ($result = $mysqli->query($sql)) { 
					while($obj = $result->fetch_assoc()){ 
						$item = $obj;
						$item['image'] = str_replace(' ', '%20', 'https://bundlebox.ru/image/'. $item['single_image_folder'] .'/'.$item['single_image_name']);
						$item['image2'] = str_replace(' ', '%20', 'https://bundlebox.ru/image/'. $item['single_image_folder2'] .'/'.$item['single_image_name2']);
					
						$return[]= $item;
					} 
					$result->close();
				}			
			}
			
			return $return;
		}		
		
		//Эта функция вернет список валют
		public function get_currencies() {
			
			$return = [];
			
			$mysqli = mysqli_connect($this->dbhost, $this->dbuser, $this->dbpwd);
			
			
			if ($mysqli == false){
				$return['mysql_error'] = "Ошибка: Невозможно подключиться к MySQL " . mysqli_connect_error();
			} else {
				mysqli_select_db($mysqli, $this->dbname);
				$sql = "select * from cash_currency 
				";
				if ($result = $mysqli->query($sql)) { 
					while($obj = $result->fetch_assoc()){ 
						$item = $obj;
						$return[]= $item;
					} 
					$result->close();
				}			
			}
			
			return $return;
		}
	}
?>