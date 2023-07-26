const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM infraestructuras LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(infraestructura){
    const result = await db.query(
      `INSERT INTO infraestructuras(id_infraestructura,nombre,descripcion) VALUES (?,?,?)`, 
      [
        infraestructura.id_infraestructura,
        infraestructura.nombre,
        infraestructura.descripcion
      ]
    );
  
    let message = 'Error creando infraestructura';
  
    if (result.affectedRows) {
      message = 'Infraestructura creada exitosamente';
    }
  
    return {message};
  }

  async function update(id, infraestructura){
    const result = await db.query(
      `UPDATE infraestructuras 
       SET nombre=?,
           descripcion=?
       WHERE id_infraestructura=?`,
       [
         infraestructura.nombre,
         infraestructura.descripcion,
         id
       ] 
    );
  
    let message = 'Error actualizando infraestructura';
  
    if (result.affectedRows) {
      message = 'Infraestructura actualizada exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM infraestructuras WHERE id_infraestructura=?`, 
      [id]
    );
  
    let message = 'Error borrando infraestructura';
  
    if (result.affectedRows) {
      message = 'Infraestructura borrada exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}