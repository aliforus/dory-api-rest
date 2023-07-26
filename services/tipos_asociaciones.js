const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM tipos_asociaciones LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(tipo_asociacion){
      const result = await db.query(
      `INSERT INTO tipos_asociaciones(id_tipo_asociacion,nombre) VALUES (?,?)`, 
      [
        tipo_asociacion.id_tipo_asociacion,
        tipo_asociacion.nombre,
      ]
    );
  
    let message = 'Error creando tipo de asociacion';
  
    if (result.affectedRows) {
      message = 'Tipo de Asociación creado exitosamente';
    }
  
    return {message};
  }

  async function update(id, tipo_asociacion){
    const result = await db.query(
      `UPDATE tipos_asociaciones 
       SET nombre=? 
       WHERE id_tipo_asociacion=?`,
       [
        tipo_asociacion.nombre,
         id
       ] 
    );
  
    let message = 'Error actualizando tipo de asociación';
  
    if (result.affectedRows) {
      message = 'Tipo de Asociación actualizado exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM tipos_asociaciones WHERE id_tipo_asociacion=?`, 
      [id]
    );
  
    let message = 'Error borrando tipo de asociación';
  
    if (result.affectedRows) {
      message = 'Tipo de Asociación borrado exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}