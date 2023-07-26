const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

/* ------------------------------------ObtenerSlid------------------------------------*/
async function getTopAlert(){   
       const rows = await db.query(
        `SELECT * 
         FROM top_alert`,            
       []
       );   
      const data = helper.emptyOrRows(rows);      
       return { data };      
}/* End getTopAlert*/

/*----------------------updateTopAlert--------------------------------------*/
async function updateTopAlert(body, token){  
          if(token && validarToken(token))
          {
                const payload=helper.parseJwt(token);  
                const rol = payload.rol;
                if(rol !="Administrador"){
                  throw createError('401', "Usted no esta autorizado para actualizar el top alert.")
                }    
                    if(body.texto === undefined ||
                       body.status === undefined ||
                       body.color === undefined
                      ){
                                throw createError(400,"Se requiere todos los párametros");
                    } 
                    const result = await db.query(
                    `UPDATE top_alert
                     SET texto=?,
                         status=?,
                         color=?
                     WHERE id=0`,
                     [body.texto, body.status, body.color] 
                    ); 
                      let message = '';
                      if (result.affectedRows) {
                        message = 'Top Alert actualizado exitosamente';
                      }else{
                        throw createError(500,"No se pudo actualizar el Top Alert");    
                      }
                      return {message};                
          }else{
            throw createError(401,"Usuario no autorizado");
          }
}/*End updateTopAlert*/

async function updateParcialTopAlert( body, token){  
      if(token && validarToken(token))
      {
            const payload=helper.parseJwt(token);  
            const rol = payload.rol;
            if(rol !="Administrador"){
              throw createError('401', "Usted no esta autorizado para actualizar el top alert.")
            }         
            var atributos = Object.keys(body);
            if(atributos.length!=0)
            {    
                  var params = Object.values(body);
                  var query = "update top_alert set ";
                  for(var i=0; i < atributos.length; i++) {
                    query = query + atributos[i] + '=?,';
                  }
                  query = query.substring(0, query.length-1);/*eliminar la coma final*/ 
                  query = query +' '+'where id=0'
                  const result = await db.query(query,params);              
                  let message = '';
                  if (result.affectedRows) {
                    message = 'Top Alert actualizado exitosamente';
                  }else{
                    throw createError(500,"No se pudo actualizar el registro del top alert");    
                  }
                  return {message};
            }
            throw createError(400,"No hay parámetros para actualizar");
      }else{
        throw createError(401,"Usuario no autorizado");
      }
}/*End updateTopAlert*/

module.exports = {
  getTopAlert,
  updateTopAlert,
  updateParcialTopAlert
}
