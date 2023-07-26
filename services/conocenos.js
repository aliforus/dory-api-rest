const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

/*_____________________ getconocenos______________________________________________*/
async function getConocenos(page = 1){
        const offset = helper.getOffset(page, config.listPerPage);
        const rows = await db.query(
          `SELECT c.* 
           FROM conocenos as c
           LIMIT ?,?`, 
          [offset, config.listPerPage]
        );
        const data = helper.emptyOrRows(rows);
        const meta = {page};
        return {
          data,
          meta
        } 
}/*End getConocenos*/

/*_____________________ registrarconocenos______________________________________________*/
async function registrarConocenos(conocenos,token){
        try{
                if(token && validarToken(token)){
                     let payload=helper.parseJwt(token);
                     let tipo_user= payload.rol; 
                      if(tipo_user!='Administrador'){
                              throw createError(401,"Usted no tiene autorización para actualizar la información");
                      }
                      if(
                        conocenos.titulo === undefined ||
                        conocenos.descripcion === undefined 
                        ){
                              throw createError(400,"Debe enviar todos los datos requeridos para el registro de la información");
                        }
                      try{
                            const result = await db.query(
                              `INSERT INTO conocenos(titulo,descripcion) VALUES (?,?)`, 
                              [                                
                                conocenos.titulo,                                
                                conocenos.descripcion
                              ]
                            );  
                            let message = 'Error registrando la información';  
                            if (result.affectedRows) {
                              message = 'Registro exitoso';
                              return {message};
                            }else {
                                  throw createError(500,"Ocurrió un problema al registrar la información");
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
  }/*End registrarconocenos*/

  /*_____________________ actualizarconocenos______________________________________________*/
  async function actualizarConocenos(id, conocenos,token){  
            try{
              if(token && validarToken(token)){
                  let payload=helper.parseJwt(token);
                  let tipo_user= payload.rol; 
                    if(tipo_user!='Administrador'){
                            throw createError(401,"Usted no tiene autorización para actualizar la información");
                    }
                  if(
                      conocenos.titulo === undefined ||
                      conocenos.descripcion === undefined
                    )
                    {
                        throw createError(400,"Debe enviar todos los datos requeridos para la actualización de la información");
                    }
                    const result = await db.query(
                    `UPDATE conocenos
                     SET titulo=?, 
                         descripcion=?
                    WHERE id=?`,
                    [
                      conocenos.titulo,
                      conocenos.descripcion,
                      id
                    ] 
                  );  
                  let message = 'Error actualizando la información';  
                  if (result.affectedRows) {
                    message = 'Actualización exitosa';
                  }  
                  return {message};
                }else{ 
                  throw createError(401,"Usted no tiene autorización"); 
              }
        }catch(error){
              throw error;
        }
  }/*End actualizarconocenos*/
  
  /*______________________ eliminarconocenos_______________________________*/
  async function eliminarConocenos(id,token){
          try{
              if(token && validarToken(token)){
                  let payload=helper.parseJwt(token);
                  let tipo_user= payload.rol; 
                    if(tipo_user!='Administrador'){
                            throw createError(401,"Usted no tiene autorización para actualizar la información");
                    }
                    const result = await db.query(
                      `DELETE FROM conocenos WHERE id=?`, 
                      [id]
                    );  
                    let message = 'Error borrando la información';  
                    if (result.affectedRows) {
                      message = 'Información borrada exitosamente';
                    }  
                    return {message};
                }else{ 
                    throw createError(401,"Usted no tiene autorización"); 
                }
          }catch(error){
                throw error;
          }
  }/*End eliminarconocenos*/


module.exports = {
  getConocenos,
  registrarConocenos,
  actualizarConocenos,
  eliminarConocenos
}