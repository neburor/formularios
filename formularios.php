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
	  	if($name=='token'||$name=='device'){
	  	}
	  	else{
	  		$dataStatus[$name]="sindatos";
	  	}
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
$tipo=$dataForm["tipo"];
if($tipo!="ingresar"&&$tipo!="salir"&&$tipo!="preregistro"&&$tipo!="password"){
include 'cuentas.php';
}

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
if($tipo=="titulo" || $tipo=="escritor"){
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
if($tipo=="enlacepdf"){
	if(mysql_query("INSERT INTO `enlacespdf` (`id`, `id_c`, `id_a`, `fecha`, `enlace`) VALUES (NULL, '".$cuenta."', '".$dataForm['id']."', '".date("Y-m-d H:i:s")."','".$dataForm['enlacepdf']."')")){
    	$dataStatus["resultado"]="guardado";
	}
	else {
    	$dataStatus["resultado"]="noguardado";
	}
}
###Agregar un rating
if($dataForm['rating']!=NULL){
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
###FORMULARIO INGRESAR
if($tipo=="ingresar"){
	if($dataForm['correo']=="" || $dataForm['pass']==""){
		$dataStatus["resultado"]='sindatos';
	}
	else
	{

		$logins=mysql_query("SELECT * FROM `cuentas` WHERE `correo` = '".$dataForm['correo']."' LIMIT 1");
		$login= mysql_fetch_row($logins);

		if($dataForm['correo'] == $login[4]){ 
			if($dataForm['pass'] == $login[5]){
				$_SESSION["cuenta"]=$login[0];
				setcookie("token",$login[7],time()+7776000,"/");
				$dataStatus["token"]=$login[7];
				$dataStatus["resultado"]='login';

			}
			else {
				$dataStatus["resultado"]='errorpwd';
			}
		}
		else {
			$dataStatus["resultado"]='nologin';
		}

	}
}
###FORMULARIO SALIR
if($tipo=="salir"){
	session_destroy();
	session_start();
	$dataStatus["resultado"]='logout';
}
###FORMULARIO DE PREREGISTRO
if($tipo=="preregistro"){
	
	if($dataForm['correo'] != ""){

		$usuarios=mysql_query("SELECT * FROM `cuentas` WHERE `correo` = '".$dataForm['correo']."' LIMIT 1");
		$usuario=mysql_fetch_row($usuarios);
		$registros = mysql_num_rows($usuarios);
		if($registros==0){
			#No hay registros con ese correo
			$token=strtoupper(substr(md5(uniqid(rand())),0,10));
			#Comprobar si hay usuario registrado en este equipo
			if($_SESSION['cuenta']!="" || $dataForm["token"]!="" || $_COOKIE["token"]!=""){
				#Crear uno nuevo y asignar credenciales al equipo
				if(mysql_query("INSERT INTO `cuentas` (`id`, `dominio`, `fecha`, `correo`, `status`, `token`,`device`) VALUES (NULL, '".$dominio."', '".date("Y-m-d H:i:s")."', '".$dataForm['correo']."', 'PREREGISTRO','".$token."','')")) {
					setcookie("token",$token,time()+7776000,"/");
					$dataStatus["token"]=$token;
    				$dataStatus["resultado"]='correcto';
				}
				else {
    				$dataStatus["resultado"]='incorrecto';
				}
			}
			else {
				#Comprobar si ha habido actividad desde este equipo
				if($dataForm["device"]!="" ||  $_COOKIE["device"]!=""){
					#Actualizar la cuenta con actividad
					if($dataForm["device"]!=""){$device=$dataForm["device"];} else {$device=$_COOKIE["device"];}
					if(mysql_query("UPDATE `cuentas` SET `correo` = '".$dataForm['correo']."', `status` = 'PREREGISTRO', `token` = '".$token."' WHERE `device` = '".$device."'  LIMIT 1")){
						setcookie("token",$token,time()+7776000,"/");
						$dataStatus["token"]=$token;
						$dataStatus["resultado"]='correcto';
					}
					else {
    					$dataStatus["resultado"]='incorrecto';
					}
				}
			}
			
		}
		#Hay registro con ese correo
		else {
			#Comprobar si esta registrado
			if($usuario[6]=="REGISTRO" || $usuario[6]=="LOGIN"){ 
				$dataStatus["resultado"]='duplicado'; }
				
			else {
				#Esta su ficha incompleta, actualizar
				if(mysql_query("UPDATE `cuentas` SET `status` = 'PREREGISTRO' WHERE `token` = '".$usuario[7]."'  LIMIT 1")){
					setcookie("token",$usuario[7],time()+7776000,"/");
					$dataStatus["token"]=$usuario[7];
					$dataStatus["resultado"]='correcto';
				}
				else {
    				$dataStatus["resultado"]='incorrecto';
				} 
			
			}
		}

	}
	else { $dataStatus["resultado"]='sindatos';}
}
###FORMULARIO DE FINALIZAR REGISTRO
if($tipo=="password"){
	if($dataForm["autopass"]=="on"){$pass=substr(md5(uniqid(rand())),0,4);}
	else { $pass=$dataForm['pass'];}
	if($dataForm["token"]!=""){$token=$dataForm["token"];} else {$token=$_COOKIE["token"];}

	if($token==""){ $busqueda="`correo` = '".$dataForm['correo']."'";}
		else {$busqueda="`token`= '".$token."'";}

	
	if(mysql_query("UPDATE `cuentas` SET `password` = '".$pass."', `status` = 'REGISTRO' WHERE ".$busqueda." LIMIT 1")){  
		$idlogin=mysql_query("SELECT `id` FROM `cuentas` WHERE ".$busqueda." LIMIT 1");
		//$_SESSION["cuenta"]=mysql_fetch_row($idlogin)[0];
    	$dataStatus["resultado"]='correcto';
	}
	else {
    	$dataStatus["resultado"]='incorrecto';
	}
}
#cierre de JSON
echo json_encode($dataStatus);
?>
