const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM tipos_normatividades LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(tipo_normatividad){
    const result = await db.query(
      `INSERT INTO tipos_normatividades(id_tipo,nombre) VALUES (?,?)`, 
      [
       tipo_normatividad.id_tipo,
       tipo_normatividad.nombre       
      ]
    );
  
    let message = 'Error creando tipo de normatividad';
  
    if (result.affectedRows) {
      message = 'El tipo de normatividad se registro exitosamente';
    }
  
    return {message};
  }

  async function update(id, tipo_normatividad){
    const result = await db.query(
      `UPDATE tipos_normatividades
       SET nombre=?
       WHERE id_tipo=?`,
       [
        tipo_normatividad.nombre,
        id
       ] 
    );
  
    let message = 'Error actualizando tipo de normatividad';
  
    if (result.affectedRows) {
      message = 'Registro de normatividad actualizado exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM tipos_normatividades WHERE id_tipo=?`, 
      [id]
    );
  
    let message = 'Error borrando tipo de normatividad';
  
    if (result.affectedRows) {
      message = 'Registro de tipo de normatividad borrado exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}