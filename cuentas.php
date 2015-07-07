<?php
#COMPROBAR SI HAN UTILIZADO ESTE EQUIPO 
if($_SESSION['cuenta']!="" || $dataForm["token"]!="" || $dataForm["device"]!="" || $_COOKIE["token"]!="" || $_COOKIE["device"]!=""){
	if($_SESSION["cuenta"]!=""){
		$cuenta=$_SESSION["cuenta"];
	}
	else {
		if($dataForm["token"]!="" || $_COOKIE["token"]!=""){
			if($dataForm["token"]!=""){$token=$dataForm["token"];}else {$token=$_COOKIE["token"];}
			$usuarios=mysql_query("SELECT * FROM `cuentas` WHERE `token` = '".$token."' LIMIT 1");
  			$usuario=mysql_fetch_row($usuarios);
  			$cuenta=$usuario[0];
  			
  				#Si el correo no es el mismo de la cuenta ALERTA
  				if ($correo!=$usuario[4]) {
  					if(mysql_query("INSERT INTO `alertas` (`id`, `dominio`, `fecha`, `codigo`, `descripcion`) VALUES (NULL, '".$dominio."', '".date("Y-m-d H:i:s")."', 'ERROR01', 'El correo no es el mismo de la cuenta (".$cuenta.":".$correo.")')")){}
  				}
  				#Si esta mandando nombre y no esta registrado
  				if($dataForm["nombre"]!="" && $usuario[3]==""){
  					
  					if(mysql_query("UPDATE `cuentas` SET `nombre` = '".$dataForm['nombre']."' WHERE `id` = '".$cuenta."'  LIMIT 1")){}
  				}

		}
		else {
			if($dataForm["device"]!="" || $_COOKIE["device"]!=""){
				if($dataForm["device"]!=""){$device=$dataForm["device"];}else {$device=$_COOKIE["device"];}
				$ids=mysql_query("SELECT `id` FROM `cuentas` WHERE `device` = '".$device."' LIMIT 1");
  				$usuario=mysql_fetch_row($ids);
  				$cuenta=$usuario[0];
  				$status="APORTACION"; 
  				#Si estan mandando correo
  				if($dataForm["correo"]!=""){
  					$status="NOTIFICACION";
  					$token=strtoupper(substr(md5(uniqid(rand())),0,10));
  					#si estan mandando nombre(Form de contacto)
  					if($dataForm["nombre"]!=""){$set="`nombre`= '".$dataForm['nombre']))."', "; $status="CONTACTO";}
  					if(mysql_query("UPDATE `cuentas` SET ".$set."`correo` = '".$correo."', `token` = '".$token."', `status` = '".$status."' WHERE `device` = '".$dataForm["device"]."'  LIMIT 1")){
  						setcookie("token",$token,time()+7776000,"/");
  						$dataStatus["token"]=$token;
					}
  				}
			}
		}

	}

}
#No lo han utilizado
else {
	#comprobar si estan mandando correo
	if($dataForm['correo']!=""){
		#Verificar si existe alguna cuenta relasionada
		$ids=mysql_query("SELECT * FROM `cuentas` WHERE `correo` = '".$dataForm['correo']."' LIMIT 1");
		$registros = mysql_num_rows($ids);
		if($registros==0){
		#No hay usuarios, crear uno
			$status="NOTIFICACION";
			if($dataForm["nombre"]!=""){ $status="CONTACTO";}
			$device=substr(md5(uniqid(rand())),0,12);
			$token=strtoupper(substr(md5(uniqid(rand())),0,10));
			if(mysql_query("INSERT INTO `cuentas` (`id`, `dominio`, `fecha`, `nombre`, `correo`, `status`, `token`, `device`) VALUES (NULL, '".$dominio."', '".date("Y-m-d H:i:s")."', '".$dataForm['correo']."', '".$dataForm['nombre']."', '".$status."','".$token."','".$device."')")){
					$cuenta=mysql_insert_id();
					setcookie("token",$token,time()+7776000,"/");
					$dataStatus["token"]=$token;
					setcookie("device",$device,time()+7776000,"/");
					$dataStatus["device"]=$device;
					}

		}
		#Si hay una cuenta relasionada
		else {
			#Asignar id y token de la cuenta
			$usuario=mysql_fetch_row($ids);
			$cuenta=$usuario[0];
			setcookie("token",$usuario[7],time()+7776000,"/");
			$dataStatus["token"]=$usuario[7];
		}
	}
	#No estan mandando correo
	else {
		#Registrar equipo
		$status="APORTACION";
		if($dataForm["text"]!=""){$status="LIKE";}
		if($dataForm["rating"]!=""){ $status="RATING"; }
		$device=substr(md5(uniqid(rand())),0,12);
 		if(mysql_query("INSERT INTO `cuentas` (`id`, `dominio`, `fecha`, `nombre`, `correo`, `status`, `token`, `device`) VALUES (NULL, '".$dominio."', '".date("Y-m-d H:i:s")."', '', '', '".$status."','','".$device."')")){
		$cuenta=mysql_insert_id();
		setcookie("device",$device,time()+7776000,"/");
		$dataStatus["device"]=$device;
		}
	}
}
?>