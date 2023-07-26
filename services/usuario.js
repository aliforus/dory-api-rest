const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const bcrypt= require('bcrypt');
const nodemailer = require('nodemailer');
const {validarToken} = require ('../middelware/auth');

/* ----------------------getUserId-----------------------------*/
async function getUserId(page = 1, idUser){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT distinctrow   u.id,u.cedula,concat(u.nombres," ",u.apellidos) as nombre_completo,
                          u.celular,u.direccion,u.email,tu.id_tipo_usuario,tu.nombre_tipo_usuario as tipo_usuario,u.id_area_experticia,u.url_sisben,u.url_imagen_cedula,u.carnet,
                          (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                          (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                          (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                          (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                          (select a.nombre from areas_experticias as a  where a.id_area=u.id_area_experticia) as area_experticia,u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
                          (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                          (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                          (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                          (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                          u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.estaVerificado,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.informacion_adicional_direccion
      FROM tipos_usuarios as tu, usuarios as u
      WHERE u.id_tipo_usuario=tu.id_tipo_usuario and
            u.id=?
      LIMIT ?,?`, 
      [idUser, offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*End getUserId */

/* ----------------------getMultiple-----------------------------*/
async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT u.id, u.cedula,u.nombres, u.apellidos,concat(u.nombres,' ',u.apellidos) as nombre_completo,u.celular,u.direccion,u.email,u.id_tipo_usuario,u.id_area_experticia,u.url_sisben,u.url_imagen_cedula,u.carnet,
            (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
            (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
            (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
            (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
            u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
            u.id_departamento,u.id_municipio,u.id_corregimiento,u.id_vereda,
            u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.estaVerificado,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.informacion_adicional_direccion
     FROM usuarios as u 
     LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*End getMultiple*/

/* ----------------------------------CREATE-----------------------------*/
async function create(usuario,token){
       if(usuario.id_tipo_usuario == -1){
              if(token && validarToken(token)){
                    let payload=helper.parseJwt(token);
                    let rol= payload.rol; 
                    if(rol!="Administrador"){
                           throw createError(401,"Usted no tiene autorización");
                    }   
                  }
        }    
            if(usuario.nombres === undefined || 
              usuario.apellidos === undefined ||
              usuario.id_tipo_usuario === undefined ||
              usuario.email === undefined ||
              usuario.password === undefined ||
              usuario.foto === undefined ||
              usuario.id_departamento === undefined ||
              usuario.id_municipio === undefined ||
              usuario.latitud === undefined ||
              usuario.longitud === undefined ||
              usuario.creadoCon === undefined ||
              usuario.id_sexo === undefined ||
              usuario.id_etnia === undefined ){
                throw createError(400,"Debe enviar todos los datos requeridos para el registro del usuario");
            }
            let contentHtml=""; 
            let mensaje="Bienvenido(a), "+usuario.nombres+" "+"estamos emocionados de que te hayas registrado con nosotros, somos un equipo conformado por emprendedores y profesionales que trabajan día a día para promover la productividad y competitividad de la cadena piscícola del Departamento de Sucre, en alianza con los grupos de investigación, Gestión de la Producción y la Calidad y GINTEING, de la Universidad de Sucre y la Corporación Universitaria Antonio José de Sucre.";
            if(usuario.creadoCon && usuario.creadoCon=="google"){
                  contentHtml = `<center>
                  <img src="${process.env.URL_LOGO}" style='width: 100px; height: 100px;'/>
                  <h2 style='color:grey'>Bienvenido a la plataforma piscícola Dory</h2>
                  <p style='color:grey; text-align:justify; margin-bottom:20px'>${mensaje}</p>
                  <form>
                  </center>
                  </br>
                  `;
            }else{              
                  let mensaje2="Sólo falta verificar su cuenta.   Has clic en el siguiente enlace para confirmar su correo electrónico";
                  let token=helper.createToken(usuario,4320);/*token de 3 días*/
                  usuario.creadoCon="email";
                  contentHtml = `<center>
                  <img src="${process.env.URL_LOGO}" style='width: 100px; height: 100px;' />
                  <h2 style='color:grey'>Bienvenido a la plataforma piscícola Dory</h2>
                  <p style='color:grey; text-align:justify; margin-bottom:20px'>${mensaje}</p>
                  <p style='color:grey; text-align:justify; margin-bottom:20px'>${mensaje2}</p> 
                  <form>
                  <a href="${process.env.DORY_WEB_APP_URL}/verify-account?token=${token}" style=" color:#ffffff; text-decoration:none;  border-radius:20px; border: 1px solid #19A3A6; background-color:#19A3A6; font-family:Arial,Helvetica,sans-serif; width: 205px;     margin-top: 20px; height: fit-content; padding:5px 40px; font-weight:normal;  font-size:12px;">Verificar cuenta de usuario </a></form>
                  </center>
                  </br>
                  `;
          }
           let message='Registro fallido';
           let insertId=-100;
            try {
              const saltRounds= 10;
              const salt= bcrypt.genSaltSync(saltRounds);//generate a salt
              const passwordHash= bcrypt.hashSync( usuario.password , salt);//generate a password Hash (salt+hash)
              usuario.password=passwordHash;//Re-assign hashed generate a salt version over original, plain text password 
              usuario.estaVerificado=0;   
            } catch  {
              throw createError(500,"Un problema al crear el usuario");
            }
              try{
                const result = await db.query(
                  `INSERT INTO usuarios(nombres,apellidos,id_tipo_usuario,email,password,foto,id_departamento,id_municipio,latitud,longitud,estaVerificado,creadoCon,id_sexo,id_etnia) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, 
                  [
                    usuario.nombres, 
                    usuario.apellidos, 
                    usuario.id_tipo_usuario,
                    usuario.email,
                    usuario.password, 
                    usuario.foto,
                    usuario.id_departamento,
                    usuario.id_municipio,
                    usuario.latitud,
                    usuario.longitud,
                    usuario.estaVerificado,
                    usuario.creadoCon,
                    usuario.id_sexo,
                    usuario.id_etnia
                  ]
                );                 
                    if (result.affectedRows) {
                            insertId=result.insertId;
                            message = 'Usuario registrado exitosamente';
                            let mensaje="Bienvenido(a), "+usuario.nombres+" "+"estamos emocionados de que te hayas registrado con nosotros, somos un equipo conformado por emprendedores y profesionales que trabajan día a día para promover la productividad y competitividad de la cadena piscícola del departamento de sucre, en alianza con los grupos de investigación, gestión de la Producción y la Calidad y GINTEING, de la Universidad de Sucre y la Corporación Universitaria Antonio José de Sucre.";
                            let mensaje2="Sólo falta verificar su cuenta.   Has clic en el siguiente enlace para confirmar su correo electrónico";
                            let token=helper.createToken(usuario,4320);/*token de 3 días*/
                            let tema="Bienvenido a Dory";             
                            helper.sendEmail(usuario.email,tema,contentHtml);
                    }else {
                      throw createError(500,"Ocurrió un problema al registrar un usuario");
                    }
              }catch(err){
                  throw err;
              }  
                return {message, insertId};              
}/*End create*/

/* ----------------------------------UPDATE-----------------------------*/
async function update(idUser, usuario, token){
              try{
                if(token && validarToken(token)){
                        let payload=helper.parseJwt(token);
                        let id_user= payload.sub; 
                        if(id_user!=idUser){
                          throw createError(401,"Usted no tiene autorización");
                        }
                          if (usuario.cedula!= undefined && 
                            usuario.nombres!= undefined  && 
                            usuario.apellidos!= undefined  &&
                            usuario.celular!= undefined  &&
                            usuario.direccion!= undefined  && 
                            usuario.id_tipo_usuario!= undefined  &&
                            usuario.email!= undefined  &&
                            usuario.id_area_experticia!= undefined  &&
                            usuario.nombre_negocio!= undefined  &&
                            usuario.foto!= undefined  && 
                            usuario.fecha_registro!= undefined  &&
                            usuario.fecha_nacimiento!= undefined  &&
                            usuario.id_departamento!= undefined &&
                            usuario.id_municipio!= undefined  &&
                            usuario.id_corregimiento!= undefined  &&
                            usuario.id_vereda!= undefined  &&
                            usuario.latitud!= undefined  &&
                            usuario.longitud!= undefined &&
                            usuario.otra_area_experticia!= undefined  &&
                            usuario.otra_area_experticia_descripcion!= undefined  &&
                            usuario.sobre_mi!= undefined  &&
                            usuario.informacion_adicional_direccion!= undefined  &&
                            usuario.id_sexo!= undefined  &&
                            usuario.id_etnia!= undefined  &&
                            usuario.url_sisben!= undefined  &&
                            usuario.url_imagen_cedula!= undefined          
                            ){
                              const result = await db.query(
                              `UPDATE usuarios
                              SET  cedula=?,
                                    nombres=?, 
                                    apellidos=?,
                                    celular=?,
                                    direccion=?, 
                                    id_tipo_usuario=?,
                                    email=?,
                                    id_area_experticia=?,
                                    nombre_negocio=?,
                                    foto=?, 
                                    fecha_registro=?,
                                    fecha_nacimiento=?,
                                    id_departamento=?,
                                    id_municipio=?,
                                    id_corregimiento=?,
                                    id_vereda=?,
                                    latitud=?,
                                    longitud=?,
                                    otra_area_experticia=?,
                                    otra_area_experticia_descripcion=?,
                                    sobre_mi=?,
                                    informacion_adicional_direccion=?,
                                    id_sexo=?,
                                    id_etnia=?,
                                    url_sisben=?,
                                    url_imagen_cedula=?
                              WHERE id=?`,
                              [
                                usuario.cedula,
                                usuario.nombres, 
                                usuario.apellidos,
                                usuario.celular,
                                usuario.direccion, 
                                usuario.id_tipo_usuario,
                                usuario.email,
                                usuario.id_area_experticia,
                                usuario.nombre_negocio,
                                usuario.foto, 
                                usuario.fecha_registro,
                                usuario.fecha_nacimiento,
                                usuario.id_departamento,
                                usuario.id_municipio,
                                usuario.id_corregimiento,
                                usuario.id_vereda,
                                usuario.latitud,
                                usuario.longitud,
                                usuario.otra_area_experticia,
                                usuario.otra_area_experticia_descripcion,
                                usuario.sobre_mi,
                                usuario.informacion_adicional_direccion,
                                usuario.id_sexo,
                                usuario.id_etnia,
                                usuario.url_sisben,
                                usuario.url_imagen_cedula,
                                idUser
                              ] 
                              );
                              let message = 'Usuario no esta registrado';
                              if (result.affectedRows) {
                                message = 'Usuario actualizado exitosamente';
                              }
                              return {message};
                              }  
                                  throw createError(400,"Un problema con los parámetros ingresados al actualizar");                                   
                }else{
                      throw createError(401,"Usuario no autorizado"); 
                }
              } catch (error) {
                        console.log(error);
                        throw error;
              }
}/*fin update*/

  /* ----------------------------------REMOVE-----------------------------*/
  async function remove(idUser,token){
    const conection= await db.newConnection(); /*conection of TRANSACTION */
    conection.beginTransaction();
    let id_user=null;     
       try{
            if(token && validarToken(token)){
                  let payload=helper.parseJwt(token);
                  id_user= payload.sub; 
                  const tipo_user=payload.rol; 
                  
                  if(id_user!=idUser && tipo_user!="Administrador"){
                    throw createError(401,"Usted no tiene autorización");
                  }
                
                      await conection.execute(
                        `DELETE FROM me_gustas WHERE usuarios_id=?`, 
                        [idUser]
                      );
                      await conection.execute(
                        `DELETE FROM productos WHERE usuarios_id=?`, 
                        [idUser]
                      );
                      await conection.execute(
                        `DELETE FROM solicitudes WHERE usuarios_id=?`, 
                        [idUser]
                      );
                      await conection.execute(
                        `DELETE FROM reseñas WHERE usuarios_id=?`, 
                        [idUser]
                      );
                      await conection.execute(
                        `DELETE FROM usuarios_granjas WHERE usuarios_id=?`, 
                        [idUser]
                      );
                      await conection.execute(
                        `DELETE FROM asociaciones_usuarios WHERE usuarios_id=?`, 
                        [idUser]
                      );
                      await conection.execute(
                        `DELETE FROM especies_usuarios WHERE usuarios_id=?`, 
                        [idUser]
                      );
                      await conection.execute(
                        `DELETE FROM mensajes WHERE usuario_emisor_id=? or usuario_receptor_id=?`, 
                        [idUser,idUser]
                      );
                       /*----------------Borrar publicaciones------------*/
                       const idpublicaciones=await conection.execute(
                        `SELECT p.id_publicacion FROM publicaciones as p WHERE p.usuarios_id=?`, 
                        [idUser]
                      );
                      if(idpublicaciones.length>1){
                              for(let i=0;i<idpublicaciones[0].length;i++){
                                let pub=idpublicaciones[0][i].id_publicacion;
                                await conection.execute(
                                  `DELETE FROM fotospublicaciones WHERE id_publicacion_fk=?`, 
                                  [pub]
                                );
                              }                     
                              await conection.execute(
                                `DELETE FROM publicaciones WHERE usuarios_id=?`, 
                                [idUser]
                              );
                        } 
                      
                      /*----------------Borrar negocios------------*/
                      const idnegocios=await conection.execute(
                        `SELECT n.id_negocio FROM negocios as n WHERE n.usuarios_id=?`, 
                        [idUser]
                      );
                      if(idnegocios.length>1){
                              for(let i=0;i<idnegocios[0].length;i++){
                                let neg=idnegocios[0][i].id_negocio;
                                await conection.execute(
                                  `DELETE FROM fotosnegocios WHERE id_negocio_fk=?`, 
                                  [neg]
                                );
                              }                     
                            await conection.execute(
                            `DELETE FROM negocios WHERE usuarios_id=?`, 
                            [idUser]
                            );
                        }                        
                      /*----------------Borrar respuestasforos-----------------*/
                         borrarRespuestas(conection, idUser);
                      /*----------------Borrar preguntas------------*/
                      const idpreguntas=await conection.execute(
                        `SELECT p.id_preguntaf FROM preguntasforos as p WHERE p.usuarios_id=?`, 
                        [idUser]
                      );
                      if(idpreguntas.length>1){
                           for(let i=0;i<idpreguntas[0].length;i++){
                            let idpreg=idpreguntas[0][i].id_preguntaf;
                            await conection.execute(
                              `DELETE FROM fotospreguntas WHERE id_preguntaf=?`, 
                              [idpreg]
                            );
                            borrarRespuestasPorPregunta(conection,idpreg)
                          }                               
                            await conection.execute(
                              `DELETE FROM preguntasforos WHERE usuarios_id=?`, 
                              [idUser]
                            );
                      }
                      /*----------Borrar Vehículos-----------------*/
                      const idVehiculos = await conection.execute(
                        `SELECT v.id_vehiculo
                        FROM vehiculos as v 
                        where v.usuarios_id=?`, 
                        [idUser]
                      );
                      if(idVehiculos.length>1){
                          for(let i=0;i<idVehiculos[0].length;i++){
                            let veh=idVehiculos[0][i].id_vehiculo;
                            await conection.execute(
                              `DELETE FROM fotosVehiculos WHERE id_vehiculo_fk=?`, 
                              [veh]
                            );
                          }
                          await conection.execute(
                            `DELETE FROM vehiculos WHERE usuarios_id=?`, 
                            [idUser]
                          );
                      }
                      /*-----------------------------------------------------*/
                      const result = await conection.execute(
                        `DELETE FROM usuarios WHERE id=?`, 
                        [idUser]
                      );
                      let message = 'Error borrando el registro del usuario';
                      if (result[0].affectedRows) {
                        message = 'Usuario borrado exitosamente';
                      }
                          conection.commit(); 
                          conection.release();
                      return {message};
            }else{
              throw createError(401,"Usuario no autorizado"); 
            }
          }catch (error) {
            conection.rollback(); /*Si hay algún error  */ 
            conection.release(); 
            console.log(error);
            throw error;
          }
  }/*End Remove*/

  /*----------------------borrarRespuestas--------------------------------------*/
  async  function borrarRespuestas(conection, idUser){
    const idrespuestas=await conection.execute(
      `SELECT rf.idrespuestaf FROM respuestasforos as rf WHERE rf.usuarios_id=?`, 
      [idUser]
    );
    if(idrespuestas.length>1){
        for(let i=0;i<idrespuestas[0].length;i++){
          let res=idrespuestas[0][i].idrespuestaf;
          await conection.execute(
            `DELETE FROM fotosrespuestas WHERE id_respuestaf=?`, 
            [res]
          );
        } 
        await conection.execute(
          `DELETE FROM respuestasforos WHERE usuarios_id=?`, 
          [idUser]
        );
    }
  }/*End borrarRespuestas*/

  /*----------------------borrarRespuestasPorPregunta-------------------------------*/
  async  function borrarRespuestasPorPregunta(conection, idPreg){
    const idrespuestas=await conection.execute(
      `SELECT rf.idrespuestaf FROM respuestasforos as rf WHERE rf.id_preguntaf=?`, 
      [idPreg]
    );
    if(idrespuestas.length>1){
        for(let i=0;i<idrespuestas[0].length;i++){
          let res=idrespuestas[0][i].idrespuestaf;
          await conection.execute(
            `DELETE FROM fotosrespuestas WHERE id_respuestaf=?`, 
            [res]
          );
        } 
        await conection.execute(
          `DELETE FROM respuestasforos WHERE id_preguntaf=?`, 
          [idPreg]
        );
    }
  }/*End borrarRespuestasPorPregunta*/

/* ----------------------------------UPDATE PARCIAL DEL USUARIO-----------------------------*/
async function updateParcialUsuario(idUser, usuario, token){  
              console.log(usuario,+" "+"USUARIO ");
          try{
                if(token && validarToken(token)){
                        let payload=helper.parseJwt(token);
                        let id_user= payload.sub; 
                        if(id_user!=idUser){
                          throw createError(401,"Usted no tiene autorización");
                        }
                            delete usuario.password; 
                            var atributos=Object.keys(usuario); /*Arreglo de los keys del usuario*/ 
                            if (atributos.length!=0){    
                                var param=Object.values(usuario);
                                var query = "UPDATE usuarios SET ";
                                param.push(idUser);/*Agrego el id al final de los á*/ 
                            for(var i=0; i<atributos.length;i++) {
                              query= query+atributos[i]+'=?,';      }
                            query= query.substring(0, query.length-1);/*eliminar la coma final*/ 
                            query= query+' '+'WHERE id=?'
                            const result = await db.query(query,param);    
                            let message = 'Error actualizando el registro del usuario';    
                            if (result.affectedRows) {
                              message = 'Usuario actualizado exitosamente';
                            }
                            return {message};
                          }
                        throw createError(400,"No ingresado los parámetros que desea actualizar");
                }else{
                  throw createError(401,"Usuario no autorizado"); 
                }
              } catch (error) {
                    console.log(error);
                    throw error;
              }   

 }/*End updateParcialUsuario*/

 /*-------------------------------------updatePassword---------------------------------*/  
async function updatePassword(datos){
  const{newPassword,token,}=datos;
  let message = 'Error al actualizar Password de usuario';
  const payload=helper.parseJwt(token);/*--saco la carga útil del token para averiguar el email del usuario----*/  
  const email=payload.email;  
  if(email!=undefined && newPassword!=undefined)
   {   
     try{ 
          const saltRounds= 10;
          const salt= bcrypt.genSaltSync(saltRounds);//generate a salt 
          const passwordHash= bcrypt.hashSync( newPassword , salt);//generate a password Hash (salt+hash)          
           /*--------verificación de existencia de usuario--------*/                  
            const userbd = await db.query(
              `SELECT u.password,u.email,u.id,tu.nombre_tipo_usuario
              FROM usuarios as u, tipos_usuarios as tu
              WHERE u.id_tipo_usuario=tu.id_tipo_usuario and
                    u.email=? 
              `, 
              [email]
            );         
          if((userbd[0].email==undefined))
          {
              return {message};
          }          
        /*--------Actualización del password de usuario--------*/
            const result = await db.query(
              `UPDATE usuarios
              SET password=?
              WHERE email=?`,
              [
                passwordHash,
                email
              ] 
            );
                   if (result.affectedRows) {
                      message = 'Contraseña de Usuario actualizado exitosamente';
                    }          
     } catch {
              throw createError(500,"Actualización del password fallida");
             }            
            return {message};
   }     
      throw createError(400,"Email y Password requeridos!"); 
}/*End updatePassword*/

/*-------------------------------------recoverPassword---------------------------------*/
async function recoverPassword(datos){
    const{email,}=datos; 
     if(email){      
          const userbd = await db.query(
            `SELECT u.password,u.email,u.id,tu.nombre_tipo_usuario
            FROM usuarios as u, tipos_usuarios as tu
            WHERE u.id_tipo_usuario=tu.id_tipo_usuario and
                  u.email=? 
            `, 
            [email]
          );             
          if(userbd[0]){
                  const token=helper.createToken(userbd[0],15);
                  const mensaje="Hola, nos acabas de informar que no recuerdas tu contraseña. Para volver a acceder a tu cuenta, has clic en actualizar contraseña.";
                  let tema="Recuperar Contraseña";
                  contentHtml = `<center> 
                  <img src="${process.env.URL_LOGO}" width="100" height="100" />
                  <p>${mensaje}</p>   
                  <form>
                  <a href="${process.env.DORY_WEB_APP_URL}/reset-password?token=${token}" style=" color:#ffffff; text-decoration:none;  border-radius:20px; border: 1px solid #19A3A6; background-color:#19A3A6; font-family:Arial,Helvetica,sans-serif; width: 205px;     margin-top: 20px; height: fit-content; padding:5px 40px; font-weight:normal;  font-size:12px;">Actualizar contraseña </a></form>
                  </center>
                  </br>
                  `;
                  helper.sendEmail(email,tema,contentHtml);                  
          }else{
                throw createError(404,"El usuario no se encuentra registrado en la bd");
               }
    }else{
          throw createError(400,"Un problema con los parámetros ingresados"); 
         }
}/* End recoverPassword*/

/*-------------------------------------changePassword---------------------------------*/  
async function changePassword(datos,token){
    const{antiguoPassword,newPassword,}=datos;
      if(antiguoPassword==newPassword){
          throw createError(400,"La  nueva contraseña no debe ser igual a la contraseña antigua"); 
      }
        if(token && validarToken(token)){
              const payload=helper.parseJwt(token);/*--saco la carga útil del token para averiguar el email del usuario----*/  
              const email=payload.email;        
            if(email!=undefined && newPassword!=undefined && antiguoPassword!=undefined)
            {   
                  try{
                      const saltRounds= 10;
                      const salt= bcrypt.genSaltSync(saltRounds);
                      const passwordHash= bcrypt.hashSync( newPassword , salt);                
                      /*--------verificación de existencia de usuario--------*/   
                        const existbd = await db.query(
                          `SELECT u.password
                          FROM usuarios as u
                          WHERE u.email=? 
                          `, 
                          [email]
                        );
                        if(existbd.length<1){
                          throw createError(401,"Usuario no existe ó contraseña antigua incorrecta"); 
                        }
                        let pass = existbd[0].password;                              
                        if(!( bcrypt.compareSync(antiguoPassword,pass))){
                            throw createError(401,"El usuario no existe ó la contraseña antigua es incorrecta"); 
                        }                                          
                        const result = await db.query(
                          `UPDATE usuarios
                            SET password=?
                            WHERE email=?`,
                            [
                              passwordHash,
                              email
                            ] 
                        );
                        if (result.affectedRows) {
                            return{message : 'Contraseña de Usuario cambiada exitosamente'};
                        }else{
                            throw createError(500,"Un problema al cambiar la contraseña del usuario");
                        }                    
                } catch (error) {
                        if(!(error.statusCode==401)){
                              throw createError(500,"Ocurrio un problema al cambiar la contraseña del usuario");
                        }else{
                              throw error; 
                        }
                }
            }else{
                throw createError(400,"Email, contraseña antigua y nuevo contraseña requeridos!"); 
            }  
        }else {
              throw createError(401,"Usted no tiene autorización"); 
        }
}/*End changePassword*/

async function verifyAccount(body){
    var token ="bearer"+" "+body.token;  
    if(token && validarToken(token)){
        const payload=helper.parseJwt(token);
        const email=payload.email; 
        let estaVerificado=1;       
        if(email!=undefined)
        {     
              const result = await db.query(
                `UPDATE usuarios
                  SET estaVerificado=?
                  WHERE email=?`,
                  [
                    estaVerificado,
                    email
                  ] 
              );
              if (result.affectedRows) {
                  return{message : 'Usuario verificado por email con éxito'};
              }else{
                  throw createError(500,"Un problema al verificar el usuario por su email");
              }
        }else{
            throw createError(400,"Email requerido!"); 
        }
    }else{
        throw createError(401,"Usted no tiene autorización"); 
    }
}/*End verifyAccount*/

async function misConsumos(token,query){
      if(!query || !query.year || !query.month ){
        throw createError(401,"Se requieren todos los parametros")
      }
      if(token && validarToken(token)){
          const payload=helper.parseJwt(token);
          const id_user=payload.sub;
          const tipo_user=payload.rol;
          try{
               if(tipo_user!='Consumidor'){
                      throw createError(401,"Usted no esta autorizado por no ser consumidor");
               }
                const rows = await db.query(
                  `SELECT eu.id_especie_pk_fk as id_especie, e.nombre, eu.cantidad_consumo,eu.fecha_consumo
                  FROM especies_usuarios as eu left join especies e on (eu.id_especie_pk_fk=e.id_especie)
                  WHERE eu.usuarios_id=? and year(eu.fecha_consumo) = ? and month(eu.fecha_consumo) = ?
                  `, 
                  [id_user,query.year,query.month]
                );
                let data;
                if(rows.length<1){
                  data = []
                }else{
                  data = helper.emptyOrRows(rows);  
                }
                return {
                  data
                }
          }catch(err){
            throw err;
          }
    }else{
      throw createError(401,"Usted no tiene autorización"); 
    }
}/*End misConsumos*/

async function updateMisconsumos(body, token){

      if(
          body.arrayConsumos === undefined || 
          body.year === undefined ||
          body.month === undefined ){
          throw createError(400,"Debe enviar todos los datos requeridos para actualizar los consumos");
      }
    var arrayconsumos= body.arrayConsumos;
    let year = body.year;   
    let month = body.month; 
    let day = 1; 
    let fecha_entrada = new Date(year, month-1, day);
    let tipo_user=null; 
    let id_user=null; 
    const conection= await db.newConnection();
    await conection.beginTransaction();
    if(token && validarToken(token)){
        let payload=helper.parseJwt(token);
        id_user=payload.sub; 
        tipo_user= payload.rol;
        try{
            if(tipo_user!="Consumidor"){ 
              throw createError(401,"Usted no tiene autorización");
            }else{
                if(arrayconsumos){ 
                  try{
                        await conection.execute(
                        `DELETE 
                         from especies_usuarios 
                         where usuarios_id=? and year(fecha_consumo)=? and month(fecha_consumo)=?`,
                          [id_user,year,month]
                        );       
                        for(var i=0;i<arrayconsumos.length;i++){  
                              await conection.execute(
                              `INSERT INTO especies_usuarios(id_especie_pk_fk,usuarios_id,cantidad_consumo, fecha_consumo) VALUES (?,?,?,?)`,
                              [arrayconsumos[i].id_especie, id_user, arrayconsumos[i].cantidad_consumo, fecha_entrada]
                            );
                        }                                           
                      }catch(err) {
                        throw err;
                      }
                }else{
                  throw createError(400,"Usted no agrego los consumos para actualizar"); 
                }
          } 
          await conection.commit(); 
          conection.release();
          message = "Consumo de usuario actualizada correctamente";
          return { message };
        }catch (error) {
          await conection.rollback(); 
          conection.release();
          throw error;
        } 
    }else{
      throw createError(401,"Usuario no autorizado");
    }
  }/*End updateMisconsumos*/

  async function getPescadoresAsociacion(nit, token){
    let tipo_user=null;
    let id_user=null;
    if(token && validarToken(token)){
        let payload=helper.parseJwt(token);
        tipo_user= payload.rol;
        id_user= payload.sub;
        try{
            if(tipo_user!="Pescador" && tipo_user!="Piscicultor"){ 
              throw createError(401,"Usted no tiene autorización");
            }else{
                if(nit!=undefined){ 
                      try{
                        const rows1 = await db.query(
                          `SELECT au.usuarios_id
                          FROM usuarios as u inner join  asociaciones_usuarios as au on (u.id=au.usuarios_id and au.nit_asociacion_pk_fk=?)
                          WHERE u.id=?
                          `, 
                          [nit,id_user]
                        );  
                        if(rows1.length<1){
                          throw createError(401,"Usted no tiene autorización, soló el propietario esta autorizado");
                        }
                           const rows = await db.query(
                            `SELECT u.id , concat (u.nombres,' ', u.apellidos) as nombres, u.email, u.celular as telefono,u.foto,u.id_municipio,
                                    (select m.nombre from municipios as m where m.id_municipio = u.id_municipio) as municipio,
                                    (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                                    (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                                    (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                                    (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                                    (select es.descripcion from solicitudes as s inner join estados_solicitudes as es on (s.id_estado_fk=es.id_estado)
                                    where s.usuarios_id=u.id and s.nit_asociacion_fk=?) as estado_solicitud,
                                    (select ss.nombre from solicitudes as s inner join sender_solicitud as ss on (s.id_sender_solicitud=ss.id_sender_solicitud)
                                    where s.usuarios_id=u.id and s.nit_asociacion_fk=?) as solicitud_enviada_por,
                                    (select s.id_solicitud from solicitudes as s inner join estados_solicitudes as es on (s.id_estado_fk=es.id_estado)
                                    where s.usuarios_id=u.id and s.nit_asociacion_fk=?) as id_solicitud
                            FROM usuarios as u inner join tipos_usuarios as tu on  ((u.id_tipo_usuario=tu.id_tipo_usuario) and 
                                              (tu.nombre_tipo_usuario like('Pescador')) )
                            `, 
                            [nit, nit, nit]
                          );
                          if(rows.length<1){
                            throw createError(404,"Usted no se encuentra registrado en ninguna asociación");
                          }
                          const data = helper.emptyOrRows(rows);
                          return { data };
                      }catch(err) {
                        throw err;
                      }
                }else{
                  throw createError(400,"La asociación ingresada no existe"); 
                }
           }
        }catch (error) {          
          throw error;
        } 
    }else{
      throw createError(401,"Usuario no autorizado");
    }
  }/*End getPescadoresAsociacion*/

  async function getPiscicultoresAsociacion(nit, token){
    let tipo_user=null;
    let id_user=null;
    if(token && validarToken(token)){
        let payload=helper.parseJwt(token);
        tipo_user= payload.rol;
        id_user= payload.sub;
        try{
            if(tipo_user!="Pescador" && tipo_user!="Piscicultor"){ 
              throw createError(401,"Usted no tiene autorización");
            }else{
                if(nit!=undefined){ 
                      try{
                        const rows1 = await db.query(
                          `SELECT au.usuarios_id
                          FROM usuarios as u inner join  asociaciones_usuarios as au on (u.id=au.usuarios_id and au.nit_asociacion_pk_fk=?)
                          WHERE u.id=? 
                          `, 
                          [nit,id_user]
                        );  
                        if(rows1.length<1){
                          throw createError(401,"Usted no tiene autorización, soló el propietario esta autorizado");
                        }
                           const rows = await db.query(
                            `SELECT u.id , concat (u.nombres,' ', u.apellidos) as nombres, u.email, u.celular as telefono, u.foto,u.id_municipio,
                            (select m.nombre from municipios as m where m.id_municipio = u.id_municipio) as municipio,
                                    (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                                    (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                                    (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                                    (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                                    (select es.descripcion from solicitudes as s inner join estados_solicitudes as es on (s.id_estado_fk=es.id_estado)
                                    where s.usuarios_id=u.id and s.nit_asociacion_fk=?) as estado_solicitud,
                                    (select ss.nombre from solicitudes as s inner join sender_solicitud as ss on (s.id_sender_solicitud=ss.id_sender_solicitud)
                                    where s.usuarios_id=u.id and s.nit_asociacion_fk=?) as solicitud_enviada_por,
                                    (select s.id_solicitud from solicitudes as s inner join estados_solicitudes as es on (s.id_estado_fk=es.id_estado)
                                    where s.usuarios_id=u.id and s.nit_asociacion_fk=?) as id_solicitud
                            FROM usuarios as u inner join tipos_usuarios as tu on  ((u.id_tipo_usuario=tu.id_tipo_usuario) and 
                                              (tu.nombre_tipo_usuario like('Piscicultor')) )
                            `, 
                            [nit, nit, nit]
                          );
                          if(rows.length<1){
                            throw createError(404,"Usted no se encuentra registrado en ninguna asociación");
                          }
                          const data = helper.emptyOrRows(rows);
                          return { data };
                      }catch(err) {
                        throw err;
                      }
                }else{
                  throw createError(400,"La asociación ingresada no existe"); 
                }
           }
        }catch (error) {          
          throw error;
        } 
    }else{
      throw createError(401,"Usuario no autorizado");
    }
  }/*End getPiscicultoresAsociacion*/

  /*___________________ getSolicitudesNoaceptadasPorUsuario____________________________________*/
  async function getSolicitudesNoaceptadasPorUsuario(token){
    let tipo_user=null;
    let id_user=null;
    if(token && validarToken(token)){
        let payload=helper.parseJwt(token);
        tipo_user= payload.rol;
        id_user= payload.sub;
        try{
            if(tipo_user!="Pescador" && tipo_user!="Piscicultor"){ 
              throw createError(401,"Usted no tiene autorización");
            }else{                
                      try{/* solitudes-estado=1, id_user=token, id-sender=2*/
                        const rows = await db.query(
                          `SELECT 
                          s.id_solicitud, 
                          e.id_estado, 
                          e.descripcion as estado, 
                          ss.id_sender_solicitud, 
                          ss.nombre as enviado_por, 
                          u2.id as id_representante_legal,
                          concat(u.nombres,' ',u.apellidos) as usuario,  
                          a.nombre as asociacion,
                          concat(u2.nombres,' ',u2.apellidos) as representante_legal,
                          u2.foto as foto_representante_legal,
                          s.fecha as fecha_solicitud
                          FROM solicitudes as s inner join estados_solicitudes as e on s.id_estado_fk=e.id_estado
                                                inner join sender_solicitud as ss on s.id_sender_solicitud=ss.id_sender_solicitud
                                                inner join asociaciones as a on s.nit_asociacion_fk=a.nit
                                                inner join usuarios as u on s.usuarios_id=u.id
                                                inner join asociaciones_usuarios as au on a.nit = au.nit_asociacion_pk_fk 
                                                inner join usuarios as u2 on au.usuarios_id = u2.id
                          WHERE s.id_estado_fk=1 and s.id_sender_solicitud=2 and s.usuarios_id=? 
                          `, 
                          [id_user]
                        );                         
                          const data = helper.emptyOrRows(rows);
                          return { data };
                      }catch(err) {
                        throw err;
                      }
                }           
        }catch (error) {          
          throw error;
        } 
    }else{
      throw createError(401,"Usuario no autorizado");
    }
  }/*End getSolicitudesNoaceptadasPorUsuario*/

  /*________getSolicitudesNoaceptadasTodasAsociacionesRep________Envia todas las solicitudes que  han llegado a todas las asociaciones donde es representante legal*/
  async function getSolicitudesNoAceptadasTodasAsociacionesRep(token){
    let tipo_user=null;
    let id_user=null;
    if(token && validarToken(token)){
        let payload=helper.parseJwt(token);
        tipo_user= payload.rol;
        id_user= payload.sub;
        try{
            if(tipo_user!="Pescador" && tipo_user!="Piscicultor"){ 
              throw createError(401,"Usted no tiene autorización");
            }else{                
                      try{
                        const rows = await db.query(
                          `SELECT 
                          s.id_solicitud, 
                          e.id_estado, 
                          e.descripcion as estado, 
                          ss.id_sender_solicitud, 
                          ss.nombre as enviado_por,   
                          a.nombre as asociacion,
                          s.fecha as fecha_solicitud,
                          u.id as id_usuario,
                          concat(u.nombres,' ',u.apellidos) as nombre_quien_envia,
                          u.foto
                          FROM solicitudes as s
                          inner join asociaciones as a on a.nit = s.nit_asociacion_fk
                          inner join asociaciones_usuarios as au on au.nit_asociacion_pk_fk = a.nit
                          inner join estados_solicitudes as e on s.id_estado_fk=e.id_estado                      
                          inner join sender_solicitud as ss on s.id_sender_solicitud=ss.id_sender_solicitud
                          inner join usuarios as u on u.id = s.usuarios_id
                          WHERE s.id_estado_fk=1 and s.id_sender_solicitud=1 and au.usuarios_id = ?
                          `, 
                          [id_user]
                        );  
                        const data = helper.emptyOrRows(rows);
                        return { data };
                      }catch(err) {
                        throw err;
                      }
                }           
        }catch (error) {          
          throw error;
        } 
    }else{
      throw createError(401,"Usuario no autorizado");
    }
  }/*End getSolicitudesNoaceptadasTodasAsociacionesRep*/

  async function getUsersProveedores(page = 1){
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
      `SELECT distinctrow   u.cedula,concat(u.nombres," ",u.apellidos) as nombre, u.id,
                            u.celular,u.direccion,u.email,tu.id_tipo_usuario,tu.nombre_tipo_usuario as tipo_usuario,u.id_area_experticia,
                            (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                            (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                            (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                            (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                            (select a.nombre from areas_experticias a  where a.id_area=u.id_area_experticia) as area_experticia,u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
                            (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                            (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                            (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                            (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                            u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.estaVerificado,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.informacion_adicional_direccion
        FROM tipos_usuarios as tu, usuarios as u
        WHERE u.id_tipo_usuario=tu.id_tipo_usuario and
              u.id_tipo_usuario=2 and u.estaverificado=1
        LIMIT ?,?`, 
        [ offset, config.listPerPage]
    );
    const data = helper.emptyOrRows(rows);
    const meta = {page};
    return {
      data,
      meta
    }
  }/*End getUsersProveedores */

  async function getUsersInvestigadoresExpertos(page = 1){
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
      `SELECT distinctrow   u.cedula,concat(u.nombres," ",u.apellidos) as nombre, u.id,
                            u.celular,u.direccion,u.email,tu.id_tipo_usuario,tu.nombre_tipo_usuario as tipo_usuario,u.id_area_experticia,
                            (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                            (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                            (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                            (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                            (select a.nombre from areas_experticias a  where a.id_area=u.id_area_experticia) as area_experticia,u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
                            (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                            (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                            (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                            (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                            u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.estaVerificado,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.informacion_adicional_direccion
        FROM tipos_usuarios as tu, usuarios as u
        WHERE u.id_tipo_usuario=tu.id_tipo_usuario and
              u.id_tipo_usuario=6 and u.estaverificado=1
        LIMIT ?,?`, 
        [ offset, config.listPerPage]
    );
    const data = helper.emptyOrRows(rows);
    const meta = {page};
    return {
      data,
      meta
    }
  }/*End getUsersInvestigadoresExpertos */

  async function getUsersTransportadores(page = 1){
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
      `SELECT distinctrow   u.cedula,concat(u.nombres," ",u.apellidos) as nombre,u.id,
                            u.celular,u.direccion,u.email,tu.id_tipo_usuario,tu.nombre_tipo_usuario as tipo_usuario,u.id_area_experticia,
                            (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                            (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                            (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                            (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                            (select a.nombre from areas_experticias a  where a.id_area=u.id_area_experticia) as area_experticia,u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
                            (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                            (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                            (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                            (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                            u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.estaVerificado,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.informacion_adicional_direccion
        FROM tipos_usuarios as tu, usuarios as u
        WHERE u.id_tipo_usuario=tu.id_tipo_usuario and
              u.id_tipo_usuario=4 and u.estaverificado=1
        LIMIT ?,?`, 
        [ offset, config.listPerPage]
    );
    const data = helper.emptyOrRows(rows);
    const meta = {page};
    return {
      data,
      meta
    }
  }/*End getUsersTransportadores */

  async function getUsersConsumidores(page = 1){
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
      `SELECT distinctrow   u.cedula,concat(u.nombres," ",u.apellidos) as nombre_completo,u.id,
                            u.celular,u.direccion,u.email,tu.id_tipo_usuario,tu.nombre_tipo_usuario as tipo_usuario,u.id_area_experticia,
                            (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                            (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                            (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                            (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                            (select a.nombre from areas_experticias a  where a.id_area=u.id_area_experticia) as area_experticia,u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
                            (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                            (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                            (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                            (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                            u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.estaVerificado,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.informacion_adicional_direccion
        FROM tipos_usuarios as tu, usuarios as u
        WHERE u.id_tipo_usuario=tu.id_tipo_usuario and
              u.id_tipo_usuario=3 and u.estaverificado=1
        LIMIT ?,?`, 
        [ offset, config.listPerPage]
    );
    const data = helper.emptyOrRows(rows);
    const meta = {page};
    return {
      data,
      meta
    }
  }/*End getUsersConsumidores */

  async function getUsersComerciantes(page = 1){
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
      `SELECT distinctrow   u.cedula,concat(u.nombres," ",u.apellidos) as nombre_completo,u.id,
                            u.celular,u.direccion,u.email,tu.id_tipo_usuario,tu.nombre_tipo_usuario as tipo_usuario,u.id_area_experticia,
                            (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                            (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                            (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                            (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                            (select a.nombre from areas_experticias a  where a.id_area=u.id_area_experticia) as area_experticia,u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
                            (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                            (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                            (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                            (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                            u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.estaVerificado,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.informacion_adicional_direccion
        FROM tipos_usuarios as tu, usuarios as u
        WHERE u.id_tipo_usuario=tu.id_tipo_usuario and
              u.id_tipo_usuario=5 and u.estaverificado=1
        LIMIT ?,?`, 
        [ offset, config.listPerPage]
    );
    const data = helper.emptyOrRows(rows);
    const meta = {page};
    return {
      data,
      meta
    }
  }/*End getUsersComerciantes */

module.exports = {
  getUserId,
  getMultiple,
  create,
  update,
  remove,
  updateParcialUsuario,
  updatePassword,
  recoverPassword,
  changePassword,
  verifyAccount,
  misConsumos,
  updateMisconsumos,
  getPescadoresAsociacion,
  getPiscicultoresAsociacion,
  getSolicitudesNoaceptadasPorUsuario,
  getSolicitudesNoAceptadasTodasAsociacionesRep,
  getUsersProveedores,
  getUsersInvestigadoresExpertos,
  getUsersTransportadores,
  getUsersConsumidores,
  getUsersComerciantes 
}