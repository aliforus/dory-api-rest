const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM mensajes LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(mensaje){
    const result = await db.query(
      `INSERT INTO mensajes(id_mensaje, contenido,fecha_creacion,usuarios_id,id_chat_fk) VALUES (?,?,?,?,?)`, 
      [
          mensaje.id_mensaje,
          mensaje.contenido,
          mensaje.fecha_creacion,
          mensaje.usuarios_id,
          mensaje.id_chat_fk
      ]
    );
  
    let message = 'Error creando mensaje';
  
    if (result.affectedRows) {
      message = {  insertId: result.insertId, message:'mensaje creada exitosamente'};
    }
  
    return {message};
  }

  async function update(id, mensaje){
    const result = await db.query(
      `UPDATE mensajes 
       SET contenido=?,
           fecha_creacion=?,
           usuarios_id=?,
           id_chat_fk=? 
       WHERE id_mensaje=?`,
       [
           mensaje.contenido,
           mensaje.fecha_creacion,
           mensaje.usuarios_id,
           mensaje.id_chat_fk,
           id
       ] 
    );
  
    let message = 'Error actualizando mensaje';
  
    if (result.affectedRows) {
      message = 'mensaje actualizada exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM mensajes WHERE id_mensaje=?`, 
      [id]
    );
  
    let message = 'Error borrando mensaje';
  
    if (result.affectedRows) {
      message = 'mensaje borrada exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}