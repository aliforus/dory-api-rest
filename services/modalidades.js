const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM modalidades LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(modalidad){
      const result = await db.query(
      `INSERT INTO modalidades(id_modalidad,nombre) VALUES (?,?)`, 
      [
        modalidad.id_modalidad,
        modalidad.nombre,
      ]
    );
  
    let message = 'Error creando modalidad';
  
    if (result.affectedRows) {
      message = 'Modalidad creado exitosamente';
    }
  
    return {message};
  }

  async function update(id, modalidad){
    const result = await db.query(
      `UPDATE modalidades 
       SET nombre=? 
       WHERE id_modalidad=?`,
       [
         modalidad.nombre,
         id
       ] 
    );
  
    let message = 'Error actualizando modalidad';
  
    if (result.affectedRows) {
      message = 'Modalidad actualizado exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM modalidades WHERE id_modalidad=?`, 
      [id]
    );
  
    let message = 'Error borrando modalidad';
  
    if (result.affectedRows) {
      message = 'Modalidad borrado exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}