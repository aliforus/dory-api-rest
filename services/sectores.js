const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM sectores LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(sector){
    const result = await db.query(
      `INSERT INTO sectores(id_sector,nombre) VALUES (?,?)`, 
      [
        sector.id_sector,
        sector.nombre
      ]
    );
  
    let message = 'Error creando sector';
  
    if (result.affectedRows) {
      message = 'Sector creado exitosamente';
    }
  
    return {message};
  }

  async function update(id, sector){
    const result = await db.query(
      `UPDATE sectores
       SET nombre=?
       WHERE id_sector=?`,
       [
         sector.nombre,
         id
       ] 
    );
  
    let message = 'Error actualizando sector';
  
    if (result.affectedRows) {
      message = 'Sector actualizado exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM sectores WHERE id_sector=?`, 
      [id]
    );
  
    let message = 'Error borrando sector';
  
    if (result.affectedRows) {
      message = 'sector borrado exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}