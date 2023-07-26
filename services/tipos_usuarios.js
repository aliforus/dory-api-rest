const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');


async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT tu.* 
    FROM tipos_usuarios AS tu
    WHERE tu.id_tipo_usuario != -1
    LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}/*--FIN get-*/



/*-------------------------------------------CREATE----------------------------------*/

async function create(tipo_usuario){

  let message = 'Error creando tipo de usuario';
  if(tipo_usuario.id_tipo_usuario != undefined && 
        tipo_usuario.nombre_tipo_usuario){
      try{
        const result = await db.query(
          `INSERT INTO tipos_usuarios(id_tipo_usuario,nombre_tipo_usuario) VALUES (?,?)`, 
          [
            tipo_usuario.id_tipo_usuario,
            tipo_usuario.nombre_tipo_usuario,
          ]
        );
      
        if (result.affectedRows) {
          message = 'Tipo de usuario creado exitosamente';
        }
      }catch(err){
        console.log("err query: ",err);
      }
        return {message};
  }
     throw createError(400,"Un problema con los parametros ingresados"); 
  
}/*fin create*/


/*-------------------------------------------UPDATE----------------------------------*/

  async function update(id, tipo_usuario){

    if (tipo_usuario.nombre_tipo_usuario!=undefined){
    const result = await db.query(
      `UPDATE tipos_usuarios 
       SET nombre_tipo_usuario=? 
       WHERE id_tipo_usuario=?`,
       [
         tipo_usuario.nombre_tipo_usuario,
         id
       ] 
    );
  
    let message = 'Error actualizando tipo usuario';
  
    if (result.affectedRows) {
      message = 'Tipo usuario actualizado exitosamente';
    }
  
    return {message};
  }
  throw createError(400,"Un problema con los parametros ingresados al actualizar"); 
}/*fin update*/


/*-------------------------------------------REMOVE----------------------------------*/


  async function remove(id){
    const result = await db.query(
      `DELETE FROM tipos_usuarios WHERE id_tipo_usuario=?`, 
      [id]
    );
  
    let message = 'Error borrando tipo usuario';
  
    if (result.affectedRows) {
      message = 'Tipo usuario borrado exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}