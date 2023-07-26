const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

/* ------------------------------------ObtenerEnlaceR------------------------------------*/
async function obtenerEnlaceR(){      
       const rows = await db.query(
        `SELECT * 
         FROM enlaces_rapidos`,            
       []
       );  
       const data = helper.emptyOrRows(rows);
       return { data };
      
}/* End obtenerEnlaceR*/


/* ------------------------------------crearEnlaceR------------------------------------*/
async function crearEnlaceR(body,token){   
  try{
          if(token && validarToken(token)){
              let payload=helper.parseJwt(token);
              let rol= payload.rol; 
                if(rol!='Administrador'){
                        throw createError(401,"Usted no tiene autorización para registrar el EnlaceR");
                }
                if(body.url_imagen === undefined || 
                   body.url_enlace === undefined || 
                   body.titulo === undefined 
                )
                {
                    throw createError(400,"Debe enviar todos los parámetros del EnlaceR para su registro");
                }
                const result = await db.query(
                `INSERT INTO enlaces_rapidos (url_imagen,url_enlace,titulo) VALUES (?,?,?)`,                
                 [body.url_imagen,body.url_enlace,body.titulo] 
                );  
              let message = 'Error registrando el EnlaceR';  
              if (result.affectedRows) {
                message = 'Registro exitoso de EnlaceR';
              }  
              return {message};
          }else{ 
              throw createError(401,"Usted no tiene autorización"); 
          }
      }catch(error){
          throw error;
      }
}/* End crearEnlaceR*/

/* ------------------------------------actualizarEnlaceR------------------------------------*/
async function actualizarEnlaceR(idEnlaceR,body,token){   
        try{
                if(token && validarToken(token)){
                    let payload=helper.parseJwt(token);
                    let rol= payload.rol; 
                      if(rol!='Administrador'){
                              throw createError(401,"Usted no tiene autorización para actualizar EnlaceR");
                      }
                      if(body.url_imagen === undefined || 
                         body.url_enlace === undefined || 
                         body.titulo === undefined 
                      )
                      {
                          throw createError(400,"Debe enviar todos los parámetros del enlace_rápido para la actualización");
                      }
                      const result = await db.query(
                      `UPDATE enlaces_rapidos
                      SET url_imagen=?,
                          url_enlace=?,
                          titulo=?
                      WHERE id_enlace_rapido=?`,
                      [
                        body.url_imagen,   
                        body.url_enlace, 
                        body.titulo,                 
                        idEnlaceR
                      ] 
                    );  
                    let message = 'Error actualizando la información del EnlaceR';  
                    if (result.affectedRows) {
                      message = 'Actualización de EnlaceR exitoso';
                    }  
                    return {message};
                }else{ 
                    throw createError(401,"Usted no tiene autorización"); 
                }
            }catch(error){
                throw error;
            }
}/* End actualizarEnlaceR*/

/* ------------------------------------eliminarEnlaceR------------------------------------*/
async function eliminarEnlaceR(idEnlaceR,token){   
     try{
          if(token && validarToken(token)){
              let payload=helper.parseJwt(token);
              let rol= payload.rol; 
                if(rol!='Administrador'){
                        throw createError(401,"Usted no tiene autorización para eliminar EnlaceR");
                }
                 const result = await db.query(
                 `DELETE from enlaces_rapidos where id_enlace_rapido=?`,
                  [idEnlaceR]
                  );   
                  let message='Error al eliminar EnlaceR';                  
                  if (result.affectedRows) {
                          message = 'EnlaceR borrado exitosamente';
                  } 
                  return {message};                              
          }else{ 
              throw createError(401,"Usted no tiene autorización"); 
          }
      }catch(error){
          throw error;
      }
}/* End eliminarEnlaceR*/



/* ------------------------------------actualizarCarruselEnlaceR------------------------------------*/
async function actualizarCarruselEnlaceR(body,token){   
          try{
                  if(token && validarToken(token)){
                      let payload=helper.parseJwt(token);
                      let rol= payload.rol; 
                        if(rol!='Administrador'){
                                throw createError(401,"Usted no tiene autorización para actualizar EnlaceR");
                        }
                        const conection= await db.newConnection(); /*conection of TRANSACTION */
                          try{                                  
                                  await conection.beginTransaction();
                                  var carrusel=body.arrayEnlaceR;
                                  let message = 'Actualización exitosa del enlace_rapido';                                 
                                  await db.query(
                                    `DELETE FROM enlaces_rapidos`, 
                                    []
                                  );                                 
                                  for(var i=0;i<carrusel.length;i++){
                                    await db.query(
                                      `INSERT INTO enlaces_rapidos(url_imagen,url_enlace,titulo) VALUES (?,?,?)`,
                                      [carrusel[i].url_imagen, carrusel[i].url_enlace, carrusel[i].titulo]
                                    );
                                  }
                                  await conection.commit(); 
                                  conection.release();
                                  return {message}; 
                            }catch(error){
                                    conection.rollback(); /*Si hay algún error  */ 
                                    conection.release();
                                    throw error;        
                            }
                  }else{ 
                      throw createError(401,"Usted no tiene autorización"); 
                  }
              }catch(error){
                  throw error;
              }
}/* End actualizarCarruselEnlaceR*/


module.exports = {
  obtenerEnlaceR,
  crearEnlaceR,
  actualizarEnlaceR,
  eliminarEnlaceR,
  actualizarCarruselEnlaceR
}
