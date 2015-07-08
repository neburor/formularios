/* Procesar formularios con jQuery
*/
$.fn.formularios = function() {
        //solicitar que se notifique a correo
$($(this).find('input[name="opciones"]')).on('click', function() {
    collapse=$(this).parents('form').find('div.collapse');
    inputs=$(collapse).find('input,textarea,select');
    //email=$(this).parent().next().find('input[name="correo"]');
 if($(this).is(':checked')){
    $(inputs).each(function(){
        $(this).removeAttr('disabled');
    });
    //$(email).removeAttr('disabled');
    $(collapse).collapse('toggle');
 }
 else{
    $(inputs).each(function(){
        $(this).attr('disabled','disabled');
    });
    //$(email).attr('disabled','disabled');
    $(collapse).collapse('toggle');
 }
});
    //Solicitar contraseña automatica
$($(this).find('input[name="autopass"]')).on('click', function() {
    resultado=$(this).parents("form").find('div.result');
    pass=$(this).parents("form").find('input[name="pass"]');
    repass=$(this).parents("form").find('input[name="repass"]');
    
    if($(this).is(':checked')){
        $(pass).attr('disabled','disabled').addClass('inp_success').val("1234");
        $(repass).attr('disabled','disabled').addClass('inp_success').val("1234");
        $(resultado).empty().append('<div class="col-xs-12"><div class="alert alert-text alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-info-circle"></i> Se te enviara tu contraseña al correo.</div></div>');
    }
    else{
        $(pass).removeAttr('disabled').removeClass('inp_success').val("");
        $(repass).removeAttr('disabled').removeClass('inp_success').val("");
        $(resultado).empty().append('<div class="col-xs-12"><div class="alert alert-text alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-info-circle"></i> Proporcionenos una contraseña.</div></div>');
    }
});


//Mostrar imagen a subir
 $($(this).find('input[name="imagen"]')).on('change',function(){
        readURL(this);
    });

//Activar o desactivar edicion de formulario
$($(this).find('.btn-edit-disabled')).on("click", function(){
    type=$(this).parents("form").attr("tipo");
    input=$(this).parents("form").find('input');
    submit=$(this).parents("form").find('button[type="submit"]');
    if($(input).attr('disabled')=='disabled'){
    $(this).addClass('btn-active');
    $(input).removeAttr('disabled');
    $(submit).children('i').removeClass('fa-check-square-o').addClass('fa-mail-forward');
    if(type=="edicion"){$(submit).removeAttr("disabled");}
    } else {
    $(this).removeClass('btn-active');
    $(input).attr('disabled','disabled');
    $(submit).children('i').removeClass('fa-mail-forward').addClass('fa-check-square-o');
    if(type=="edicion"){$(submit).attr("disabled","disabled");}
    }
});
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
     $($(this).find('input,textarea,select')).each(function(){
        if($(this).is(':disabled')){}
        else {
            if($(this).attr('name')!='opciones'&&$(this).attr('name')!='autopass'){
            status[$(this).attr('name')]=checkINPUT($(this)); 
            inputs[$(this).attr('name')]=$(this);
                if($(this).attr('name')=='titulo'||$(this).attr('name')=='escritor'||$(this).attr('name')=='imagen'){
                    contenido=$(this).val();
                }
            }
        }
    }); 
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
    //Envio del formulario con AJAX
        $.ajax({
            type: "POST",
            url: "../js/formularios.php",
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
/*Procesar star rating*/
$.fn.stars = function(){
    //Mostrar el rating
   $(this).each(function() {
  id=$(this).attr('id-rating');
  content=$(this).attr('content');
  rating=$(this).attr('rating');
  $(this).rating('js/formularios.php', { maxvalue:5, curvalue:content, id:id, userRating:rating });
});
}
/*Procesar Me gusta*/
$.fn.likes = function (){
    //Enviar Me gusta, quiero leerlo, etc
$(this).on('click', function(){
    text=$(this).attr('like-text');
    id=$(this).attr('like-id');
    elemento=$(this).parents('div.input-group').first();
    showcontrol=$(elemento).find("span.input-group-addon");
    btncontrol=$(elemento).find("button.btn-pdfl").first();
    console.log(elemento);
    console.log(showcontrol);
    console.log(btncontrol);
     var formulario = new FormData();
    formulario.append("text", text);
    formulario.append("id", id);
    if (localStorage.getItem("token") === null) {} else {
        formulario.append("token", localStorage.getItem("token")); }
    if (localStorage.getItem("device") === null) {} else {
        formulario.append("device", localStorage.getItem("device")); }
         $.ajax({
           type: "POST",
           url: "../js/formularios.php",
           dataType: "json",
           data: formulario,// Adjuntar los campos del formulario enviado.
           cache: false,
           contentType: false,
           processData: false,
           success: function(data)
           {
                if(data.token!=undefined || data.device!=undefined){ addLS(data)}
                if(data.resultado=="correcto"){  
                    $(btncontrol).empty().html('<b>'+text+' !</b>');
                    $(showcontrol).empty().html('<i class="fa fa-check"></i>');// Si se envio correctamente.
                }
                if(data.resultado=="incorrecto"){
                    $(showcontrol).empty().html('<i class="fa fa-times"></i>');// Si no se pudo enviar.
                    $(btncontrol).empty().html('<i class="fa fa-warning"></i> Reintentar !').removeAttr("disabled");
                }
           },
           beforeSend: function() 
           {   
              $(showcontrol).empty().html('<i class="fa fa-cog fa-spin"></i>');// Mientras se envia.
              $(btncontrol).attr("disabled","disabled");
           },
            error: function()
           {    $(showcontrol).empty().html('<i class="fa fa-times"></i>');// Si no se pudo enviar.
                $(btncontrol).empty().html('<i class="fa fa-warning"></i> Reintentar !').removeAttr("disabled");
           }
         });
});
}
function checkINPUT(input){
    var status ="";
    if($(input).val()!=""){
        minLength=6;
        maxLength=32;
        if($(input).attr('name')=="id"){ minLength=1; maxLength=10;}
        if($(input).attr("name")=="nombre" || $(input).attr("name")=="pass"){ minLength = 4; maxLength=64;}
        if($(input).attr("name")=="comentario"){ minLength = 10; maxLength=1024;}
        if($(input).val().length < minLength && $(input).val().length > maxLength){
            status="invalido";
        }
        else {
            if($(input).attr("type")=="email"){ 
                if(!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,6}$/.test($(input).val())){
                    status="invalido";
                }
                else {
                    status="valido";
                }
            }
            else {
                if($(input).attr("name")=="imagen"){
                    if(!/\.(?:jpe?g|png|gif)$/.test($(input).val())){
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
                        if(!/^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})\/[\w \/.-]+?\.pdf$/.test($(input).val())){
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

    if(tipo=="contacto"){ texto = '<i class="fa fa-check-circle"></i>Su mensaje se a enviado. <b>Gracias por contactarnos</b>.'}
    if(tipo=="titulo" || tipo=="escritor" || tipo=="enlacepdf"){ texto= '<i class="fa fa-check-circle"></i> <b>Gracias por tu aportacion !!</b>.';}
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
                    $(inputs[name]).val("").attr("placeholder","Agregar otro "+name+" ...").removeAttr("readonly");
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
            $(inputs["correo"]).removeAttr("readonly");
            mostrarMENSAJE(inputs,"noguardado",result);
        }
        if(resultado=="duplicado"){
            $(btncontrol).empty().append('<i class="fa fa-user-times"></i> <span class="hidden-xxs hidden-sm">Ya existe !!</span>').removeAttr("disabled");
            $(inputs["correo"]).removeAttr("readonly");
            mostrarMENSAJE(inputs,"duplicado",result);
        }
        if(resultado=="logout"){
            location.reload();
        }
        if(resultado=="nologin"){
            $(result).empty().append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-warning"></i> <b>Error !</b>, correo o contraseña no son correctas.</div></div>');
            $(btncontrol).empty().append('<i class="fa fa-sign-in"></i> Ingresar').removeAttr("disabled");
            $(inputs["correo"]).removeAttr("readonly");
            $(inputs["pass"]).removeAttr("readonly"); 
        }
        if(resultado=="errorpwd"){
            $(result).empty().append('<div class="col-xs-12"><div class="alert alert-error alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-warning"></i> <b>Error !</b>, La contraseña no es correcta, <button class="btn btn-default btn-danger">Enviar a mi correo !</button>. </div></div>'); 
            $(btncontrol).empty().append('<i class="fa fa-sign-in"></i> Ingresar').removeAttr("disabled");
            $(inputs["correo"]).removeAttr("readonly");
            $(inputs["pass"]).removeAttr("readonly");
        }
        if(resultado=="login"){
            $(result).empty().append('<div class="col-xs-12"><div class="alert alert-text alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><i class="fa fa-info-circle"></i> Bienvenido. </div></div>');
            $(btncontrol).empty().append('<i class="fa fa-check-circle"></i> Correcto !! '); 
        }
        if(resultado=="yaexiste"){
        $(btncontrol).empty().append('<i class="fa fa-warning"></i> <i class="fa fa-share"></i>').removeAttr("disabled"); 
            for(var name in inputs) {
                $(inputs[name]).val("").attr("placeholder","Agregar otro "+name+" ...").removeAttr("readonly");
                $(result).append('<div class="col-xs-12"><div class="alert alert-text alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>Ya existe este <b>'+name+'</b></div></div>');
            } 
            
    }
    
}
function beforesendAJAX(tipo,result,btncontrol,inputs){
    for(var name in inputs) {
        if(name!="imagen"){$(inputs[name]).attr("readonly","readonly");}
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
//Agregar a una tabla de datos con datatable
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
//Crear fecha actual
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
