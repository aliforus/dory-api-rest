const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM subregiones LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(subregion){
    const result = await db.query(
      `INSERT INTO subregiones(id_subregion,nombre,id_departamento_fk) VALUES (?,?,?)`, 
      [
        subregion.id_subregion,
        subregion.nombre, 
        subregion.id_departamento_fk
      ]
    );
  
    let message = 'Error creando subregión';
  
    if (result.affectedRows) {
      message = 'Subregión creada exitosamente';
    }
  
    return {message};
  }

  async function update(id, subregion){
    const result = await db.query(
      `UPDATE subregiones
       SET nombre=?,
           id_departamento_fk=? 
       WHERE id_subregion=?`,
       [
         subregion.nombre, 
         subregion.id_departamento_fk,
         id
       ] 
    );
  
    let message = 'Error actualizando subregión';
  
    if (result.affectedRows) {
      message = 'Subregión actualizada exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM subregiones WHERE id_subregion=?`, 
      [id]
    );
  
    let message = 'Error borrando subregión';
  
    if (result.affectedRows) {
      message = 'Subregión borrada exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}