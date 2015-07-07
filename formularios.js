$.fn.formularios = function() {
//Formularios
$(this).on("submit", function() {
    //Declaracion de variables de los formularios
    var status = [];
    var alert_sindatos =[];
    var alert_invalido =[];
    var alert_yaexiste= [];
    var alert_imagen="";
    var alert_repass="";
    var inputs = [];
    tipo=$(this).attr('tipo');
    result=$(this).find('div.result');
    $(result).empty();
    btncontrol=$(this).find('button[type="submit"]');
    datatable=$(this).attr("datatable");
    progreso=$(this).find('.progress');
    progresobarra=$(this).find('.progress-bar');
    imgpreview=$(this).find('img');

 //Inputs de los formularios para verificar si existen y si son correctas
    if($(this).find('input[name="correo"]:not(:disabled)').length){ 
        status["correo"]=checkINPUT($(this).find('input[name="correo"]')); 
        inputs["correo"]=$(this).find('input[name="correo"]'); 
    }
    if($(this).find('input[name="nombre"]:not(:disabled)').length){ 
        status["nombre"]=checkINPUT($(this).find('input[name="nombre"]')); 
        inputs["nombre"]=$(this).find('input[name="nombre"]');
    }
    if($(this).find('textarea[name="comentario"]:not(:disabled)').length){ 
        status["comentario"]=checkINPUT($(this).find('textarea[name="comentario"]')); 
        inputs["comentario"]=$(this).find('textarea[name="comentario"]');
    }
    if($(this).find('input[name="titulo"]:not(:disabled)').length){ 
        status["titulo"]=checkINPUT($(this).find('input[name="titulo"]')); 
        inputs["titulo"]=$(this).find('input[name="titulo"]');
        contenido=$(this).find('input[name="titulo"]').val();
    }
    if($(this).find('input[name="escritor"]:not(:disabled)').length){ 
        status["escritor"]=checkINPUT($(this).find('input[name="escritor"]')); 
        inputs["escritor"]=$(this).find('input[name="escritor"]');
        contenido=$(this).find('input[name="escritor"]').val();
    }
    if($(this).find('input[name="imagen"]:not(:disabled)').length){ 
        status["imagen"]=checkINPUT($(this).find('input[name="imagen"]')); 
        inputs["imagen"]=$(this).find('input[name="imagen"]');
        contenido=$(this).find('input[name="imagen"]').val();
    }
    if($(this).find('input[name="pass"]:not(:disabled)').length){ 
        status["pass"]=checkINPUT($(this).find('input[name="pass"]'));
        inputs["pass"]=$(this).find('input[name="pass"]');
    }
    if(tipo=="password"){
        if(($(this).find('input[name="pass"]:not(:disabled)').val())!=($(this).find('input[name="repass"]:not(:disabled)').val())){
        status["repass"]="diferente";   
        } 
        else {status["repass"]="igual";}
    }
    if($(this).find('input[name="correoaenviar"]:not(:disabled)').length){ 
        status["correoaenviar"]=checkINPUT($(this).find('input[name="correoaenviar"]'));
        inputs["correoaenviar"]=$(this).find('input[name="correoaenviar"]');
    }
    if($(this).find('input[name="enlacepdf"]:not(:disabled)').length){ 
        status["enlacepdf"]=checkINPUT($(this).find('input[name="enlacepdf"]'));
        inputs["enlacepdf"]=$(this).find('input[name="enlacepdf"]');
    }
//Detectar la verificacion de los inputs 
for(var name in status) {
    type="input";
    if(name=="mensaje"){type="textarea";}
    if(status[name]=="sindatos"){
        $(this).find(type+'[name="'+name+'"]').removeClass('inp_success').addClass('inp_error');
        alert_sindatos.push(name);      
    }
   
    if(status[name]=="invalido"){
        $(this).find(type+'[name="'+name+'"]').removeClass('inp_success').addClass('inp_error');
        alert_invalido.push(name);
    }
   if(status[name]=="yaexiste"){
        $(this).find(type+'[name="'+name+'"]').removeClass('inp_success').addClass('inp_error');
        alert_yaexiste.push(name);
    }
    if(status[name]=="valido"){
        $(this).find(type+'[name="'+name+'"]').removeClass('inp_error').addClass('inp_success');
        if(name=="imagen"){$(this).find('img').removeClass('inp_error').addClass('inp_success');}
    }
   if(status[name]=="muygrande" || status[name]=="noimagen"){
        $(this).find('img').addClass('inp_error').removeClass('inp_success');
        if(status[name]=="muygrande"){alert_imagen="muygrande";}
        if(status[name]=="noimagen"){alert_imagen="noimagen";}
    }
    if(status[name]=="diferente"){
        $(this).find(type+'[name="'+name+'"]').removeClass('inp_success').addClass('inp_error');
        alert_repass="diferente";
    }
    if(status[name]=="igual"){
        $(this).find(type+'[name="'+name+'"]').removeClass('inp_error').addClass('inp_success'); 
    }
}
//Mostrar mensajes de los resultados de verificacion de los inputs
    if(alert_sindatos!=""){ mostrarMENSAJE(alert_sindatos,"sindatos",result);}
    if(alert_invalido!=""){ mostrarMENSAJE(alert_invalido,"invalido",result);}
    if(alert_yaexiste!=""){ mostrarMENSAJE(alert_yaexiste,"yaexiste",result);}
    if(alert_imagen!=""){ mostrarMENSAJE("imagen",alert_imagen,result);}
    if(alert_repass!=""){ mostrarMENSAJE("repass",alert_repass,result);}

//Si todos los inputs estan correctos se procede a preparar el envio
if(alert_sindatos=="" && alert_invalido=="" && alert_imagen=="" && alert_repass=="" && alert_yaexiste==""){
    //Se crea el formulario y agregan elementos de ser necesario
    var formulario = new FormData($(this)[0]);
    formulario.append("tipo", tipo);
    if (localStorage.getItem("token") === null) {} else {
        formulario.append("token", localStorage.getItem("token")); }
    if (localStorage.getItem("device") === null) {} else {
        formulario.append("device", localStorage.getItem("device")); }
    //Contabiliza el numero de intentos
    if(typeof(x) != "undefined") {x=x+1; } else {x=1}
    //Determina la ruta de envio del formulario
    path="../js/formularios.php";
    if(tipo=="preregistro" || tipo=="password" || tipo=="ingresar" || tipo=="salir"){ path="../js/login.php"}
    //Envio del formulario con AJAX
        $.ajax({
            type: "POST",
            url: path,
            dataType: "json",
            data: formulario,
            cache: false,
            contentType: false,
            processData: false,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                $(progresobarra).html(Math.round(percentComplete * 100) + "%");
                $(progresobarra).width(Math.round(percentComplete * 100)+ "%");
                console.log(percentComplete);
                }
                }, false);
            return xhr;
            }, 
            complete: function(data){
                if(tipo=="imgupload"){
                    $(progreso).addClass("hidden");
                    $(progresobarra).width(0).empty().append('0%');
                }
             
            },
            success: function(data){  
                successAJAX(data.resultado,tipo,result,btncontrol,inputs);
                if(data.token!=undefined || data.device!=undefined){ addLS(data)} 
                   //Si hay que actualizar una tabla se realiza
                if(data.resultado=="guardado"){
                    if(typeof(datatable) != "undefined"){ DatatableAdd(datatable,tipo,contenido); }
                } 
            },
            beforeSend: function(){ 
                beforesendAJAX(tipo,result,btncontrol,inputs);
                if(tipo=="imgupload"){
                    $(progreso).removeClass("hidden");
                    $(imgpreview).css("opacity",".5");
                } 
            },
            error: function(){   errorAJAX(tipo,result,btncontrol,x) }
         });
}


event.preventDefault();
});
}
function checkINPUT(input){
    var status ="";
    if($(input).val()!=""){
        length=6;
        if($(input).attr("name")=="nombre" || $(input).attr("name")=="pass"){ length = 3; }
        if($(input).attr("name")=="comentario"){ length = 10; }
        if($(input).val().length <= length){
            status="invalido";
        }
        else {
            if($(input).attr("type")=="email"){ 
                if($(input).val().indexOf('@') == -1 || $(input).val().indexOf('.') == -1){
                    status="invalido";
                }
                else {
                    status="valido";
                }
            }
            else {
                if($(input).attr("name")=="imagen"){
                    ext=0;
                    if($(input).val().lastIndexOf('.jpg') != -1){ ext=1;}
                    if($(input).val().lastIndexOf('.png') != -1){ ext=1;}
                    if($(input).val().lastIndexOf('.gif') != -1){ ext=1;}
                    if($(input).val().lastIndexOf('.JPG') != -1){ ext=1;}
                    if($(input).val().lastIndexOf('.PNG') != -1){ ext=1;}
                    if($(input).val().lastIndexOf('.GIF') != -1){ ext=1;}
                    if(ext != 1){
                        status="noimagen";
                    }
                    else {
                        if($(input)[0].files[0].size > 1024 * 1024 * 2){
                            status="muygrande";
                        }
                        else{
                            status="valido";
                        }
                    }

                }
                else {
                    if($(input).attr("name")=="enlacepdf"){
                        if($(input).val().indexOf('.pdf') == -1 || $(input).val().indexOf('http://') == -1){
                            status="invalido";
                        }
                        else {
                            status="valido";
                        }

                    }
                    else {
                    status="valido";
                    }
                }
            }
        }
    }
    else {
            status="sindatos";
    }
    return status
}

function mostrarMENSAJE(inputs,status,result){
    text ="Favor de poner el ";
    text1="";
    for(var name in inputs) {
        if(inputs[name]=="imagen"){text ="Favor de seleccionar una ";}
        if(inputs.length == 1 && inputs[name]=="pass"){text="Favor de poner la ";}
    }
    for (index = 0; index < inputs.length; index++) {
        
        if(inputs[index]!="pass"){
            text1 += "<b>"+inputs[index]+"</b> ";    
        }else{
            text1 += "<b>contraseña</b> ";   
        }
        
        if(index < inputs.length -2 ){ text1 +=", "; }
        if(index < inputs.length -1 && index > inputs.length - 3 ){ text1 +=" y "; }
    }


    if(status=="sindatos"){

        $(result).append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-exclamation-circle"></i> '+text+''+text1+'.</div></div>');
    }
     if(status=="invalido"){
        if(inputs.length>1){ text2='no son correctos';}else { text2='no es correcto'; }
        text3='El '+text1;
        if(inputs[name]=="pass"){text3="La contraseña"; text2="no es correcta, debe tener al menos 4 digitos";}
        $(result).append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-exclamation-circle"></i> '+text3+' '+text2+'.</div></div>');
    }
    if(status=="noguardado"){
        $(result).append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-warning"></i> <b>Error !!</b>, favor de intenterlo mas tarde.</div></div>');
    }
     if(status=="noimagen"){
        $(result).append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-warning"></i> <b>Error !!</b>, seleccione una imagen (.jpg, .png o .gif).</div></div>');
    }
     if(status=="muygrande"){
        $(result).append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-warning"></i> <b>Error !!</b>, Seleccione una imagen menor de 2Mb.</div></div>');
    }
    if(status=="duplicado"){
        $(result).append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-warning"></i> Ya existe una cuenta registrada con este correo.</div></div>');
    }
    if(status=="diferente"){
        $(result).append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-warning"></i> Repita la misma contraseña.</div></div>');
    }
    if (status=="igual") {
        $(result).append('');
    }

}
function successAJAX(resultado,tipo,result,btncontrol,inputs){

    if(tipo=="contacto"){ texto = '<i class="fa fa-check-circle"></i>Su comentario se a enviado. <b>Gracias por contactarnos</b>.'}
    if(tipo=="titulo" || tipo=="escritor"){ texto= '<i class="fa fa-check-circle"></i> <b>Gracias por tu aportacion !!</b>.';}
    if(tipo=="imgupload"){ texto='<i class="fa fa-check-circle"></i> <b>Gracias por compartir !</b>, pronto la publicaremos.';}
    if(tipo=="password"){ texto='<i class="fa fa-check-square-o"></i> <b>Registro completado !!</b>, revisa tu bandeja.';}
    if(tipo=="edicion"){ texto='<i class="fa fa-check-square-o"></i> <b>Cambio realizado !!</b>';}

        if(resultado=="sindatos"){ 
                mostrarMENSAJE(inputs,"sindatos",result);
                $(btncontrol).removeAttr("disabled");
                $(btncontrol).empty().append('<i class="fa fa-warning"> Reenviar');
             } 
        if(resultado=="noguardado") {
                mostrarMENSAJE(inputs,"noguardado",result);
                $(btncontrol).empty().append('<i class="fa fa-warning"> Reintentar').removeAttr("disabled");
            }
        if(resultado=="guardado") {
            $(result).append('<div class="col-xs-12"><div class="alert alert-text alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>'+texto+'</div></div>');
            if(tipo=="contacto"){$(btncontrol).empty().append("Comentario <b>enviado !!</b>"); }
            if(tipo=="titulo" || tipo=="escritor"){
                $(btncontrol).empty().append('<i class="fa fa-check-circle"></i> <i class="fa fa-share"></i>').removeAttr("disabled"); 
                for(var name in inputs) {
                    $(inputs[name]).val("").attr("placeholder","Agregar otro "+name+" ...").removeAttr("disabled");
                } 
            }
            if(tipo=="imgupload"){
                $(btncontrol).empty().append('<i class="fa fa-check"></i> Completado !');
            }
            if(tipo=="edicion"){
                $(btncontrol).empty().append('<i class="fa fa-check-square-o"></i>'); 
            }
            }
        if(resultado=="muygrande") {
            mostrarMENSAJE(inputs,"muygrande",result);
            $(btncontrol).empty().append('<i class="fa fa-times-circle"></i> Seleccione otra');
        }
        if(resultado=="correcto"){
            if(tipo=="preregistro"){
                collapse=$(btncontrol).attr("collapseid");
                $(btncontrol).empty().append('<i class="fa fa-check-circle"></i> <span class="hidden-xxs hidden-sm">Registrarme</span>').attr("disabled","disabled");
                $('#'+collapse).collapse('toggle');
                $('#'+collapse).find('input[name="correo"]').val($(inputs["correo"]).val()); 
            }
            if(tipo=="password"){
                $(result).append('<div class="col-xs-12"><div class="alert alert-text alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>'+texto+'</div></div>');
                $(btncontrol).empty().append('<i class="fa fa-check-circle"></i> <span class="hidden-xxs hidden-sm"><b>Registrado !!</b></span>');
            }
        }
        if(resultado=="incorrecto"){
            $(btncontrol).empty().append('<i class="fa fa-warning"></i> <span class="hidden-xxs hidden-sm">Reintentar !!</span>').removeAttr("disabled");
            $(inputs["correo"]).removeAttr("disabled");
            mostrarMENSAJE(inputs,"noguardado",result);
        }
        if(resultado=="duplicado"){
            $(btncontrol).empty().append('<i class="fa fa-user-times"></i> <span class="hidden-xxs hidden-sm">Ya existe !!</span>').removeAttr("disabled");
            $(inputs["correo"]).removeAttr("disabled");
            mostrarMENSAJE(inputs,"duplicado",result);
        }
        if(resultado=="logout"){
            location.reload();
        }
        if(resultado=="nologin"){
            $(result).empty().append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-warning"></i> <b>Error !</b>, correo o contraseña no son correctas.</div></div>');
            $(btncontrol).empty().append('<i class="fa fa-sign-in"></i> Ingresar').removeAttr("disabled");
            $(inputs["correo"]).removeAttr("disabled");
            $(inputs["pass"]).removeAttr("disabled"); 
        }
        if(resultado=="errorpwd"){
            $(result).empty().append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-warning"></i> <b>Error !</b>, La contraseña no es correcta, <button class="btn btn-default btn-danger">Enviar a mi correo !</button>. </div></div>'); 
            $(btncontrol).empty().append('<i class="fa fa-sign-in"></i> Ingresar').removeAttr("disabled");
            $(inputs["correo"]).removeAttr("disabled");
            $(inputs["pass"]).removeAttr("disabled");
        }
        if(resultado=="login"){
            $(result).empty().append('<div class="col-xs-12"><div class="alert alert-text alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-info-circle"></i> Bienvenido. </div></div>');
            $(btncontrol).empty().append('<i class="fa fa-check-circle"></i> Correcto !! '); 
        }
        if(resultado=="yaexiste"){
        $(btncontrol).empty().append('<i class="fa fa-warning"></i> <i class="fa fa-share"></i>').removeAttr("disabled"); 
            for(var name in inputs) {
                $(inputs[name]).val("").attr("placeholder","Agregar otro "+name+" ...").removeAttr("disabled");
                $(result).append('<div class="col-xs-12"><div class="alert alert-text alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>Ya existe este <b>'+name+'</b></div></div>');
            } 
            
    }
    
}
function beforesendAJAX(tipo,result,btncontrol,inputs){
    for(var name in inputs) {
        if(name!="imagen"){$(inputs[name]).attr("disabled","disabled");}
    }
    if (tipo=="contacto") {
        $(btncontrol).empty().append('Enviado comentario ... <i class="fa fa-refresh fa-spin"></i>').attr("disabled","disabled");
    }
    if (tipo=="titulo" || tipo=="escritor"){
        $(btncontrol).empty().append('<i class="fa fa-refresh fa-spin"></i>').attr("disabled","disabled");
    }
    if (tipo=="imgupload"){
        $(btncontrol).empty().append('<i class="fa fa-cog fa-spin"></i>').attr('disabled','disabled');
    }
    if(tipo=="preregistro"){
        $(btncontrol).empty().append('<i class="fa fa-refresh fa-spin"></i> <span class="hidden-xxs hidden-sm">Registrarme</span>').attr("disabled","disabled");
    }
    if(tipo=="password"){
         $(btncontrol).empty().append('<i class="fa fa-refresh fa-spin"></i> <span class="hidden-xxs hidden-sm">Enviando registro</span>').attr("disabled","disabled");
    }
    if(tipo=="ingresar"){
        $(btncontrol).empty().append('<i class="fa fa-refresh fa-spin"></i> <span class="hidden-xxs hidden-sm"> Ingresar</span>').attr("disabled","disabled");
    }
    if(tipo=="salir"){
        $(btncontrol).empty().append('Salir <i class="fa fa-refresh fa-spin"></i>').attr("disabled","disabled");
    }
    if(tipo=="edicion"){
        $(btncontrol).empty().append('<i class="fa fa-refresh fa-spin"></i>').attr("disabled","disabled");
    }
}
function errorAJAX(tipo,result,btncontrol,intentos){
    $(result).append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-warning"></i> <b>Error !</b>, no se puede conectar al servidor, si persiste intente mas tarde (intentos : '+intentos+').</div></div>'); 
    $(btncontrol).removeAttr("disabled");
    $(btncontrol).empty().append('<i class="fa fa-warning"> Reintentar');  
}
function addLS(resultado){
    if(resultado.token!=undefined){ localStorage.setItem("token", resultado.token); }
    if(resultado.device!=undefined){ localStorage.setItem("device", resultado.device); }
}
function readURL(input) {
    progresobarra=$(this).find(".progress-bar");
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            btnupload=$(input).parents('form').find('button[type="submit"]');
            notificarme=$(input).parents('form').find('label.checkbox-pdfl');
            imgpreview=$(input).parents('form').find('img');
            
            reader.onload = function (e) {
                $(imgpreview).attr('src', e.target.result).removeClass("hidden").css("opacity","1");
                $(btnupload).removeAttr('disabled').empty().append('Subir <i class="fa fa-cloud-upload"></i>');
                $(progresobarra).width(0).empty().append('0%');
                $(notificarme).removeClass('hidden');
            }
            
            reader.readAsDataURL(input.files[0]);
        }
}
function DatatableAdd (datatable,tipo,contenido) {
        if(tipo=="titulo"){tipo='<b>T<span class="hidden-xxs">itulo</span></b>'; }
        if(tipo=="escritor"){tipo='<b>E<span class="hidden-xxs">scritor</span></b>'; }
        if(tipo=="imgupload"){tipo='<b>F<span class="hidden-xxs">rase</span></b>'; }

     var table = $('#'+datatable).DataTable();
 
var rowNode = table
    .row.add( [
            '<span class="badge hidden-xxs">En proceso...</span>',
            tipo,
            contenido,
            Fecha(),
            '<i class="fa fa-exclamation-circle"></i>'
        ] )
    .draw()
    .node();
 
$( rowNode ).css( { color :'#907164' } );
}
function Fecha(){
    fecha = new Date();
    dia= fecha.getDate();
    dia = ( dia < 10 ) ? '0'+dia : dia;
    mes = (fecha.getMonth() +1);
    mes = ( mes < 10 ) ? '0'+mes : mes;
    anio = fecha.getFullYear();

    hora=fecha.getHours();
    minuto=fecha.getMinutes();
    segundo=fecha.getSeconds();

    return (anio+'-'+mes+'-'+dia+' '+hora+':'+minuto+':'+segundo);
}
