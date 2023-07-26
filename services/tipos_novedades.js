const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM tipos_novedades LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(tipo_novedad){
    const result = await db.query(
      `INSERT INTO tipos_novedades(id_tipo_novedad,nombre) VALUES (?,?)`, 
      [
       tipo_novedad.id_tipo_novedad,
       tipo_novedad.nombre       
      ]
    );
  
    let message = 'Error creando tipo de novedad';
  
    if (result.affectedRows) {
      message = 'El tipo de novedad se registro exitosamente';
    }
  
    return {message};
  }

  async function update(id, tipo_novedad){
    const result = await db.query(
      `UPDATE tipos_novedades
       SET nombre=?
       WHERE id_tipo_novedad=?`,
       [
        tipo_novedad.nombre,
        id
       ] 
    );
  
    let message = 'Error actualizando tipo de novedad';
  
    if (result.affectedRows) {
      message = 'Registro de novedad actualizado exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM tipos_novedades WHERE id_tipo_novedad=?`, 
      [id]
    );
  
    let message = 'Error borrando tipo de novedad';
  
    if (result.affectedRows) {
      message = 'Registro de tipo de novedad borrado exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}