const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

/*_____________________ getNosotros______________________________________________*/
async function getNosotros(page = 1){
        const offset = helper.getOffset(page, config.listPerPage);
        const rows = await db.query(
          `SELECT nos.* 
           FROM nosotros as nos
           LIMIT ?,?`, 
          [offset, config.listPerPage]
        );
        const data = helper.emptyOrRows(rows);
        const meta = {page};
        return {
          data,
          meta
        } 
}/*End getNosotros*/

/*_____________________ registrarNosotros______________________________________________*/
async function registrarNosotros(nosotros,token){
        try{
                if(token && validarToken(token)){
                     let payload=helper.parseJwt(token);
                     let tipo_user= payload.rol; 
                      if(tipo_user!='Administrador'){
                              throw createError(401,"Usted no tiene autorización para actualizar la información de nosotros");
                      }
                      if(nosotros.entidad === undefined || 
                        nosotros.mision === undefined ||
                        nosotros.vision === undefined ||
                        nosotros.imagen_entidad === undefined || 
                        nosotros.imagen_mision === undefined ||
                        nosotros.imagen_vision === undefined
                        ){
                              throw createError(400,"Debe enviar todos los datos requeridos para el registro de la información de nosotros");
                        }
                      try{
                            const result = await db.query(
                              `INSERT INTO nosotros(entidad,mision,vision,imagen_entidad,imagen_mision,imagen_vision) VALUES (?,?,?,?,?,?)`, 
                              [
                                nosotros.entidad,
                                nosotros.mision, 
                                nosotros.vision,
                                nosotros.imagen_entidad,
                                nosotros.imagen_mision,
                                nosotros.imagen_vision
                              ]
                            );  
                            let message = 'Error registrando la información de nosotros';  
                            if (result.affectedRows) {
                              message = 'Registro de nosotros exitoso';
                              return {message};
                            }else {
                                  throw createError(500,"Ocurrió un problema al registrar la información de nosotros");
                            }
                      }catch(err){
                          throw err;
                      } 
                }else{ 
                    throw createError(401,"Usted no tiene autorización"); 
                }
          }catch(error){
                throw error;
          }
  }/*End registrarNosotros*/

  /*_____________________ actualizarNosotros______________________________________________*/
  async function actualizarNosotros(id, nosotros,token){  
            try{
              if(token && validarToken(token)){
                  let payload=helper.parseJwt(token);
                  let tipo_user= payload.rol; 
                    if(tipo_user!='Administrador'){
                            throw createError(401,"Usted no tiene autorización para actualizar la información de nosotros");
                    }
                  if(nosotros.entidad === undefined || 
                    nosotros.mision === undefined ||
                    nosotros.vision === undefined ||
                    nosotros.imagen_entidad === undefined || 
                    nosotros.imagen_mision === undefined ||
                    nosotros.imagen_vision === undefined)
                    {
                        throw createError(400,"Debe enviar todos los datos requeridos para la actualización de la información de nosotros");
                    }
                    const result = await db.query(
                    `UPDATE nosotros
                    SET entidad=?, 
                        mision=?,
                        vision=?,
                        imagen_entidad=?,
                        imagen_mision=?,
                        imagen_vision=?
                    WHERE id=?`,
                    [
                      nosotros.entidad,
                      nosotros.mision, 
                      nosotros.vision,
                      nosotros.imagen_entidad,
                      nosotros.imagen_mision,
                      nosotros.imagen_vision,
                      id
                    ] 
                  );  
                  let message = 'Error actualizando la información de nosotros';  
                  if (result.affectedRows) {
                    message = 'Actualización de Nosotros exitoso';
                  }  
                  return {message};
                }else{ 
                  throw createError(401,"Usted no tiene autorización"); 
              }
        }catch(error){
              throw error;
        }
  }/*End actualizarNosotros*/
  
  /*______________________ eliminarNosotros_______________________________*/
  async function eliminarNosotros(id,token){
          try{
              if(token && validarToken(token)){
                  let payload=helper.parseJwt(token);
                  let tipo_user= payload.rol; 
                    if(tipo_user!='Administrador'){
                            throw createError(401,"Usted no tiene autorización para actualizar la información de nosotros");
                    }
                    const result = await db.query(
                      `DELETE FROM nosotros WHERE id=?`, 
                      [id]
                    );  
                    let message = 'Error borrando la información de nosotros';  
                    if (result.affectedRows) {
                      message = 'Nosotros borrada exitosamente';
                    }  
                    return {message};
                }else{ 
                    throw createError(401,"Usted no tiene autorización"); 
                }
          }catch(error){
                throw error;
          }
  }/*End eliminarNosotros*/


  /*------------------------------actualizacionParcialNosotros-------------------------------------------------*/
async function actualizacionParcialNosotros(idNosotros, nosotros, token){
  
                if(token && validarToken(token))
                {
                        const payload=helper.parseJwt(token);  
                        const rol = payload.rol;
                        if(rol != "Administrador"){
                          throw createError('401', "Usted No esta autorizado para actualizar la información de nosotros.")
                        }      
                  const rows2 = await db.query(
                    `select nos.*
                    from nosotros as nos
                    where nos.id= ? `, 
                    [
                      idNosotros
                    ]
                  );
                  if(rows2.length < 1 ){
                    throw createError('404', 'No existe registro de la información de nosotros con es ID.')
                  }
                  var atributos = Object.keys(nosotros);   
                  if(atributos.length!=0)
                  {    
                        var params = Object.values(nosotros);   
                        var query = "update nosotros set ";
                        params.push(idNosotros);

                        for(var i=0; i < atributos.length; i++) {
                          query = query + atributos[i] + '=?,';
                        }
                        query = query.substring(0, query.length-1);/*eliminar la coma final*/ 
                        query = query +' '+'where id=?'
                        const result = await db.query(query,params);                      
                        let message = '';
                        if (result.affectedRows) {
                          message = 'Nosotros actualizado exitosamente';
                        }else{
                          throw createError(500,"No se pudo actualizar el registro de nosotros");    
                        }
                        return {message};
                  }
                  throw createError(400,"No hay parametros para actualizar");
              }else{
                throw createError(401,"Usuario no autorizado");
              }
}/*End actualizacionParcialNosotros*/

module.exports = {
  getNosotros,
  registrarNosotros,
  actualizarNosotros,
  eliminarNosotros,
  actualizacionParcialNosotros
}