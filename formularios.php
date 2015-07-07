<?php
if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') 
{
include 'db.php';
session_start();
$dominio=$_SERVER['HTTP_HOST'];
$ConectarDB();

$caracteresB= array('+','*','=','|','&','<','>','(',')',';','#','"',"'");
$caracteresR= array('','','','','','','','','','','','','');



$correo=str_replace($caracteresB, $caracteresR, strtolower($_POST['correo']));


#COMPROBAR SI HAN UTILIZADO ESTE EQUIPO 
if($_SESSION['cuenta']!="" || $_POST["token"]!="" || $_POST["device"]!="" || $_COOKIE["token"]!="" || $_COOKIE["device"]!=""){
	if($_SESSION["cuenta"]!=""){
		$cuenta=$_SESSION["cuenta"];
	}
	else {
		if($_POST["token"]!="" || $_COOKIE["token"]!=""){
			if($_POST["token"]!=""){$token=$_POST["token"];}else {$token=$_COOKIE["token"];}
			$usuarios=mysql_query("SELECT * FROM `cuentas` WHERE `token` = '".$token."' LIMIT 1");
  			$usuario=mysql_fetch_row($usuarios);
  			$cuenta=$usuario[0];
  			
  				#Si el correo no es el mismo de la cuenta ALERTA
  				if ($correo!=$usuario[4]) {
  					if(mysql_query("INSERT INTO `alertas` (`id`, `dominio`, `fecha`, `codigo`, `descripcion`) VALUES (NULL, '".$dominio."', '".date("Y-m-d H:i:s")."', 'ERROR01', 'El correo no es el mismo de la cuenta (".$cuenta.":".$correo.")')")){}
  				}
  				#Si esta mandando nombre y no esta registrado
  				if($_POST["nombre"]!="" && $usuario[3]==""){
  					$nombre=str_replace($caracteresB, $caracteresR, strtolower($_POST['correo']));
  					if(mysql_query("UPDATE `cuentas` SET `nombre` = '".$nombre."' WHERE `id` = '".$cuenta."'  LIMIT 1")){}
  				}

		}
		else {
			if($_POST["device"]!="" || $_COOKIE["device"]!=""){
				if($_POST["device"]!=""){$device=$_POST["device"];}else {$device=$_COOKIE["device"];}
				$ids=mysql_query("SELECT `id` FROM `cuentas` WHERE `device` = '".$device."' LIMIT 1");
  				$usuario=mysql_fetch_row($ids);
  				$cuenta=$usuario[0];
  				$status="APORTACION"; 
  				#Si estan mandando correo
  				if($_POST["correo"]!=""){
  					$status="NOTIFICACION";
  					$token=strtoupper(substr(md5(uniqid(rand())),0,10));
  					#si estan mandando nombre(Form de contacto)
  					if($_POST["nombre"]!=""){$set="`nombre`= '".str_replace($caracteresB, $caracteresR, strtolower($_POST['nombre']))."', "; $status="CONTACTO";}
  					if(mysql_query("UPDATE `cuentas` SET ".$set."`correo` = '".$correo."', `token` = '".$token."', `status` = '".$status."' WHERE `device` = '".$_POST["device"]."'  LIMIT 1")){
  						setcookie("token",$token,time()+7776000,"/");
  						$resultados["token"]=$token;
					}
  				}
			}
		}

	}

}
#No lo han utilizado
else {
	#comprobar si estan mandando correo
	if($correo!=""){
		#Verificar si existe alguna cuenta relasionada
		$ids=mysql_query("SELECT * FROM `cuentas` WHERE `correo` = '".$correo."' LIMIT 1");
		$registros = mysql_num_rows($ids);
		if($registros==0){
		#No hay usuarios, crear uno
			$status="NOTIFICACION";
			if($_POST["nombre"]!=""){$nombre=str_replace($caracteresB, $caracteresR, strtolower($_POST['nombre'])); $status="CONTACTO";}
			$device=substr(md5(uniqid(rand())),0,12);
			$token=strtoupper(substr(md5(uniqid(rand())),0,10));
			if(mysql_query("INSERT INTO `cuentas` (`id`, `dominio`, `fecha`, `nombre`, `correo`, `status`, `token`, `device`) VALUES (NULL, '".$dominio."', '".date("Y-m-d H:i:s")."', '".$correo."', '".$nombre."', '".$status."','".$token."','".$device."')")){
					$cuenta=mysql_insert_id();
					setcookie("token",$token,time()+7776000,"/");
					$resultados["token"]=$token;
					}

		}
		#Si hay una cuenta relasionada
		else {
			#Asignar id y token de la cuenta
			$usuario=mysql_fetch_row($ids);
			$cuenta=$usuario[0];
			setcookie("token",$usuario[7],time()+7776000,"/");
			$resultados["token"]=$usuario[7];
		}
	}
	#No estan mandando correo
	else {
		#Registrar equipo
		$device=substr(md5(uniqid(rand())),0,12);
 		if(mysql_query("INSERT INTO `cuentas` (`id`, `dominio`, `fecha`, `nombre`, `correo`, `status`, `token`, `device`) VALUES (NULL, '".$dominio."', '".date("Y-m-d H:i:s")."', '', '', 'APORTACION','','".$device."')")){
		$cuenta=mysql_insert_id();
		setcookie("device",$device,time()+7776000,"/");
		$resultados["device"]=$device;
		}
	}
}



$tipo=$_POST["tipo"];
}

##FORMULARIO DE CONTACTO
if($tipo=="contacto"){

	$nombre=str_replace($caracteresB, $caracteresR, strtolower($_POST['nombre']));
	$comentario=str_replace($caracteresB, $caracteresR, strtolower($_POST['comentario']));

	if($correo == "" || $nombre == "" || $comentario == "") {
	  $resultados["resultado"]="sindatos";
	}
	else{
		if(mysql_query("INSERT INTO `correos_contacto` (`id`, `id_c`, `fecha`, `comentario`) VALUES (NULL, '".$cuenta."', '".date("Y-m-d H:i:s")."', '".strtolower($comentario)."')")) {
    		$resultados["resultado"]="guardado";
		}
		else {
    	$resultados["resultado"]="noguardado";
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
   			$resultados["resultado"]="noguardado";
   		}
    
    	//comprobamos si el archivo ha subido
    	if ($file && move_uploaded_file($_FILES['imagen']['tmp_name'],"../imagenes/aportaciones/".$id."-".$file)){ 
    		$resultados["resultado"]="guardado"; }
		else { 
			//throw new Exception("Error Processing Request", 1); 
		}
	} 
	else { 
		$resultados["resultado"]="muygrande";
	}
}
##FORMULARIO EDITAR PREFERENCIAS
if($tipo=="edicion"){
	foreach( $_POST as $name => $value ) {
		if($name=="pass"){$name="password";}
		if($name!="token" && $name!="device" && $name!="tipo"){
			if(mysql_query("UPDATE `cuentas` SET `".$name."` = '".$value."' WHERE `token` = '".$_POST["token"]."' LIMIT 1")){
				$resultados["resultado"]="guardado";
			}
			else {
				$resultados["resultado"]="noguardado";
			}
		}
}  
}
###FORMULARIO APORTAR DATO
if($tipo!="contacto" && $tipo!="imgupload" && $tipo!="edicion" && $tipo!="verificacion"){
	foreach ($_POST as $name => $value) {
		if($name!="tipo" && $name!="token" && $name!="device"){
			$columna=$name;
			$dato=str_replace($caracteresB, $caracteresR, strtolower($_POST[$name]));

			if($name=="titulo"){$columnaB="tlatino";}
			if($name=="escritor"){$columnaB="director";}
			$siexiste=mysql_query("SELECT * FROM `contenidos` WHERE `".$columnaB."` = '".$dato."' LIMIT 1");

			if(mysql_num_rows($siexiste)==0){

				if(mysql_query("INSERT INTO `aportaciones` (`id`, `id_c`, `fecha`, `tipo`, `contenido`) VALUES (NULL, '".$cuenta."', '".date("Y-m-d H:i:s")."', '".$columna."', '".$dato."')")){
    			$resultados["resultado"]="guardado";
				}
				else {
    			$resultados["resultado"]="noguardado";
				}	
			}
			else 
			{
				$resultados["resultado"]="yaexiste";
			}
			
		}
	}
}
#cierre de JSON
echo json_encode($resultados);
?>
