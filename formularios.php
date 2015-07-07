<?php
if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {

include 'db.php';
session_start();
$dominio=$_SERVER['HTTP_HOST'];


#Caracteres a sustituir
	$caracteresB= array('+','*','=','|','&','<','>','(',')',';','#','"',"'");
	$caracteresR= array('','','','','','','','','','','','','');
#Filtrar datos del formulario
foreach( $_POST as $name => $value ) {
	#Creando un array con los datos del formulario ya filtrados
	$dataForm[$name]=str_replace($caracteresB, $caracteresR, strtolower($_POST[$name]));
}
#Validar datos del formulario
foreach ($dataForm as $name => $value) {
	  if($dataForm[$name]!=""){
	  	$minLength=6;
	  	$maxLength=32;
	  	if($name=='id'){$minLength=1; $maxLength=10;}
	  	if($name=='rating'){$minLength=1; $maxLength=1;}
	  	if($name=='nombre' || $name=='pass'){ $minLength=4; $maxLength=64;}
	  	if($name=='mensaje' || $name=='comentario'){ $minLength=10; $maxLength=1024;}
	  	if($name=='token'){$minLength=10; $maxLength=10;}
	  	if($name=='device'){$minLength=12; $maxLength=12;}

	  	if(strlen($dataForm[$name])<$minLength && strlen($dataForm[$name])>$maxLength){
	  		$dataStatus[$name]="invalido";
	  	}
	  	else {
	  		if($name=='correo' || $name=='correoaenviar'){
	  			if(preg_match('#^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,6}$#',$dataForm[$name])){
	  				$dataStatus[$name]="valido";
	  			}
	  			else {
	  				$dataStatus[$name]="invalido";
	  			}
	  		}
	  		else{
	  			if($name=='enlacepdf'){
	  				if(preg_match('#^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})\/[\w \/.-]+?\.pdf$#',$dataForm[$name])){
	  					$dataStatus[$name]="valido";
	  				}
	  				else {
	  					$dataStatus[$name]="invalido";
	  				}
	  			}
	  			else {
	  				if($name=='token'||$name=='device'||$name=='tipo'){
	  				}
	  				else{
	  					$dataStatus[$name]="valido";
	  				}
	  			}
	  		}
	  	}
	  }
	  else {
	  	$dataStatus[$name]="sindatos";
	  }
}

	  #Detectar si existe imagen a recibir
if(!empty($_FILES)){ 
		if(preg_match('#\.(?:jpe?g|png|gif)$#',$_FILES['imagen']['name'])){
			if(filesize($_FILES['imagen']['tmp_name']) < 1024 * 1024 * 2){
	  			$dataStatus['imagen']="valido";
	  		}
	  		else {
	  			$dataStatus['imagen']="muygrande";
	  		}
	  	}
	  	else {
	  		$dataStatus['imagen']="noimagen";
	  	}
}

#Verificar que todos los datos esten correctos
$dataError=0;
foreach ($dataStatus as $name => $value) {
	if(!$dataStatus[$name]=='valido'){ $dataError++;}

}
if($dataError==0){
	ConectarDB();
}	

include 'cuentas.php';


$tipo=$dataForm["tipo"];

}

##FORMULARIO DE CONTACTO
if($tipo=="contacto"){

	if($dataForm['correo'] == "" || $dataForm['nombre'] == "" || ($dataForm['mensaje'] == "" || $dataForm['comentario'] == "") ) {
	  $dataStatus["resultado"]="sindatos";
	}
	else{
		if(mysql_query("INSERT INTO `correos_contacto` (`id`, `id_c`, `fecha`, `comentario`) VALUES (NULL, '".$cuenta."', '".date("Y-m-d H:i:s")."', '".strtolower($dataForm['mensaje'])."')")) {
    		$dataStatus["resultado"]="guardado";
		}
		else {
    	$dataStatus["resultado"]="noguardado";
		}
	}
}

###FORMULARIO APORTAR IMAGEN
if($tipo=="imgupload"){

    //obtenemos el archivo a subir
    $file = $_FILES['imagen']['name'];
     
	if(filesize($_FILES['imagen']['tmp_name']) < 1024 * 1024 * 2){	
		if(mysql_query("INSERT INTO `aportaciones` (`id`, `id_c`, `fecha`, `tipo`, `contenido`) VALUES (NULL, '".$cuenta."', '".date("Y-m-d H:i:s")."', 'frase', '".$file."' )")) {	
			$id = mysql_insert_id();
		}
   		else { 
   			$dataStatus["resultado"]="noguardado";
   		}
    
    	//comprobamos si el archivo ha subido
    	if ($file && move_uploaded_file($_FILES['imagen']['tmp_name'],"../imagenes/aportaciones/".$id."-".$file)){ 
    		$dataStatus["resultado"]="guardado"; }
		else { 
			//throw new Exception("Error Processing Request", 1); 
		}
	} 
	else { 
		$dataStatus["resultado"]="muygrande";
	}
}
##FORMULARIO EDITAR PREFERENCIAS
if($tipo=="edicion"){
	foreach( $_POST as $name => $value ) {
		if($name=="pass"){$name="password";}
		if($name!="token" && $name!="device" && $name!="tipo"){
			if(mysql_query("UPDATE `cuentas` SET `".$name."` = '".$value."' WHERE `token` = '".$dataForm["token"]."' LIMIT 1")){
				$dataStatus["resultado"]="guardado";
			}
			else {
				$dataStatus["resultado"]="noguardado";
			}
		}
}  
}
###FORMULARIO APORTAR DATO
if($tipo!="contacto" && $tipo!="imgupload" && $tipo!="edicion" && $tipo!="verificacion"){
	foreach ($dataForm as $name => $value) {
		if($name!="tipo" && $name!="token" && $name!="device"){
			$columna=$name;
			$dato=$value;

			if($name=="titulo"){$columnaB="tlatino";}
			if($name=="escritor"){$columnaB="director";}
			$siexiste=mysql_query("SELECT * FROM `contenidos` WHERE `".$columnaB."` = '".$dato."' LIMIT 1");

			if(mysql_num_rows($siexiste)==0){

				if(mysql_query("INSERT INTO `aportaciones` (`id`, `id_c`, `fecha`, `tipo`, `contenido`) VALUES (NULL, '".$cuenta."', '".date("Y-m-d H:i:s")."', '".$columna."', '".$dato."')")){
    			$dataStatus["resultado"]="guardado";
				}
				else {
    			$dataStatus["resultado"]="noguardado";
				}	
			}
			else 
			{
				$dataStatus["resultado"]="yaexiste";
			}
			
		}
	}
}
###Agregar un rating
if($dataForm['rating']){
	if($dataForm['rating']==0){
	if(mysql_query("UPDATE `rating` SET `rating` = '0' WHERE `id_c` = '".$cuenta."' AND  `id_a` = '".$dataForm['id']."'  LIMIT 1")){
		$dataStatus["resultado"]="cancelado";
	}
	else {
		$dataStatus["resultado"]="error";
	}

}
if($dataForm['rating']!=0){
	$ratings=mysql_query("SELECT * FROM `rating` WHERE `id_a` = '".$dataForm['id']."' AND `id_c` = '".$cuenta."' LIMIT 1");
	$db_rating=mysql_fetch_row($ratings);
	$registros = mysql_num_rows($ratings);
	if($registros==0){
		if(mysql_query("INSERT INTO `rating` (`id`, `id_c`, `id_a`, `rating`, `fecha`) VALUES (NULL, '".$cuenta."', '".$dataForm['id']."', '".$dataForm['rating']."', '".date("Y-m-d H:i:s")."')")){
			$dataStatus["resultado"]="registrado";
		}
		else {
			$dataStatus["resultado"]="error";
		}
	}
	else {
		if(mysql_query("UPDATE `rating` SET `rating` = '".$dataForm['rating']."' WHERE `id` = '".$db_rating[0]."' LIMIT 1")){
			$dataStatus["resultado"]="actualizado";
		}
		else {
			$dataStatus["resultado"]="error";
		}
	}
}
}
##Agregar un Me gusta
if($dataForm['text']){
		$likes=mysql_query("SELECT * FROM `likes` WHERE `id_a` = '".$dataForm['id']."' AND `tipo` = '".$dataForm['text']."' AND `id_c` = '".$cuenta."' LIMIT 1");
	$db_likes=mysql_fetch_row($likess);
	$registros = mysql_num_rows($likes);
	if($registros==0){
		if(mysql_query("INSERT INTO `likes` (`id`, `id_c`, `id_a`, `tipo`, `fecha`) VALUES (NULL, '".$cuenta."', '".$dataForm['id']."', '".$dataForm['text']."', '".date("Y-m-d H:i:s")."')")){
			$dataStatus["resultado"]="correcto";
		}
		else {
			$dataStatus["resultado"]="incorrecto";
		}
	}
	else {
			$dataStatus["resultado"]="correcto";
	}
}
#cierre de JSON
echo json_encode($dataStatus);
?>
