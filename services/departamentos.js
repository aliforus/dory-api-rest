const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM departamentos LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(departamento){
     const result = await db.query(
      `INSERT INTO departamentos (id_departamento,nombre_departamento,descripcion) VALUES (?,?,?)`, 
      [
        departamento.id_departamento,
        departamento.nombre_departamento,
        departamento.descripcion
      ]
    );
  
    let message = {message: 'Error creando departamento'};
  
    if (result.affectedRows) {
      message = {  insertId: result.insertId, message:'Departamento creado exitosamente'};
    }
  
    return message;
  }

  async function update(id, departamento){
    const result = await db.query(
      `UPDATE departamentos 
       SET nombre_departamento=?,
           descripcion=? 
       WHERE id_departamento=?`,
       [
          departamento.nombre_departamento,
          departamento.descripcion,
          id
       ] 
    );
  
    let message = 'Error actualizando departamento';
  
    if (result.affectedRows) {
      message = 'Departamento actualizado exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM departamentos WHERE id_departamento=?`, 
      [id]
    );
  
    let message = 'Error borrando departamento';
  
    if (result.affectedRows) {
      message = 'Departamento borrada exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}