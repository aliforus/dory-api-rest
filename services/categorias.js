const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM categorias LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(categoria){
     const result = await db.query(
      `INSERT INTO categorias (id_categoria,nombre_categoria,descripcion_categoria) VALUES (?,?,?)`, 
      [
        categoria.id_categoria,
        categoria.nombre_categoria,
        categoria.descripcion_categoria
      ]
    );
  
    let message = {message: 'Error creando categoria'};
  
    if (result.affectedRows) {
      message = {  insertId: result.insertId, message:'categoria creado exitosamente'};
    }
  
    return message;
  }

  async function update(id, categoria){
    const result = await db.query(
      `UPDATE categorias 
       SET nombre_categoria=?,
           descripcion_categoria=? 
       WHERE id_categoria=?`,
       [
          categoria.nombre_categoria,
          categoria.descripcion_categoria,
          id
       ] 
    );
  
    let message = 'Error actualizando categoria';
  
    if (result.affectedRows) {
      message = 'categoria actualizado exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM categorias WHERE id_categoria=?`, 
      [id]
    );
  
    let message = 'Error borrando categoria';
  
    if (result.affectedRows) {
      message = 'categoria borrada exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}