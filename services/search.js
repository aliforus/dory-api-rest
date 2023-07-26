const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

/* ------------------------------------getIndex------------------------------------*/
async function getIndex(){   
       const rows = await db.query(
        `SELECT * 
         FROM indexs`,            
       []
       );
      const data = helper.emptyOrRows(rows);      
       return { data };      
}/* End getIndex*/

/* ------------------------------------createIndex------------------------------------*/
async function createIndex(body,token){   
          try{
                  if(token && validarToken(token)){
                      let payload=helper.parseJwt(token);
                      let rol= payload.rol; 
                        if(rol!='Administrador'){
                                throw createError(401,"Usted no tiene autorización");
                        }
                        const conection= await db.newConnection(); /*conection of TRANSACTION */
                          try{                                  
                                  await conection.beginTransaction();
                                  var indices=body.index;
                                  let message = 'Registro exitoso';                                 
                                  await db.query(
                                    `DELETE FROM indexs`, 
                                    []
                                  );  
                                  const currentDate = new Date();
                                  const fecha = currentDate.toISOString();                               
                                  for(var i=0;i<indices.length;i++){
                                      if(!(indices[i].title === undefined ||  indices[i].href === undefined ||  indices[i].description === undefined))
                                       {    
                                          await db.query(
                                          `INSERT INTO indexs(title,href,lastmodified,description) VALUES (?,?,?,?)`,
                                                [indices[i].title, indices[i].href, fecha, indices[i].description]
                                          );
                                       }
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
}/* End createIndex*/

/* ------------------------------------addCreateIndex------------------------------------*/
async function addCreateIndex(body,token){   
  try{
          if(token && validarToken(token)){
              let payload=helper.parseJwt(token);
              let rol= payload.rol; 
                if(rol!='Administrador'){
                        throw createError(401,"Usted no tiene autorización");
                }
                const conection= await db.newConnection(); /*conection of TRANSACTION */
                  try{                                  
                          await conection.beginTransaction();
                          var indices=body.index;
                          let message = 'Registro exitoso';                             
                          const currentDate = new Date();
                          const fecha = currentDate.toISOString();                               
                          for(var i=0;i<indices.length;i++){
                              if(!(indices[i].title === undefined ||  indices[i].href === undefined ||  indices[i].description === undefined))
                               {    
                                  await db.query(
                                  `INSERT INTO indexs(title,href,lastmodified,description) VALUES (?,?,?,?)`,
                                        [indices[i].title, indices[i].href, fecha, indices[i].description]
                                  );
                               }
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
}/* End addCreateIndex*/

/* ------------------------------------addCreateIndex------------------------------------*/
async function deleteIndex(id_index,token){   
  try{
        if(token && validarToken(token)){
              let payload=helper.parseJwt(token);
              let rol= payload.rol; 
                if(rol!='Administrador'){
                        throw createError(401,"Usted no esta autorizado");
                }
                try{
                      const result = await db.query(
                      `DELETE  FROM indexs WHERE id=?`,
                       [id_index]
                      );  
                      let message = 'Error borrando search del index';  
                      if (result.affectedRows) {
                        message = 'search borrado exitosamente';
                      }  
                      return {message}; 
                    }catch(error){
                        throw error;
                    }                
          }else{ 
              throw createError(401,"Usted no tiene autorización"); 
          }
      }catch(error){
          throw error;
      }
}/* End addCreateIndex*/

/*------------------------------updateParcialIndex-------------------------------------------------*/
async function updateParcialIndex(id_index, index, token){
  
        if(token && validarToken(token))
        {
          const payload=helper.parseJwt(token);  
          const id_user=payload.sub;
          const rol = payload.rol;
          if(rol!='Administrador'){
                  throw createError(401,"Usted no esta autorizado");
          } 
          var atributos = Object.keys(index);   
          if(atributos.length!=0)
          {    
            var params = Object.values(index);   
            var query = "update indexs set ";
            params.push(id_index);
            for(var i=0; i < atributos.length; i++) {
              query = query + atributos[i] + '=?,';
            }
            query = query.substring(0, query.length-1);/*eliminar la coma final*/ 
            query = query +' '+'where id=?'
            const result = await db.query(query,params);          
            let message = '';
            if (result.affectedRows) {
                  message = 'Search del index actualizado exitosamente';
            }else{
              throw createError(500,"No se pudo actualizar el registro del search");    
            }
            return {message};
          }
          throw createError(400,"No hay parámetros para actualizar");
      }else{
        throw createError(401,"Usuario no autorizado");
      }
}/*End updateParcialIndex*/

module.exports = {
  getIndex,
  createIndex,
  addCreateIndex,
  deleteIndex,
  updateParcialIndex
}
