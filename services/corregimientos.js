const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM corregimientos LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}/*End getMultiple*/

async function getCorregimientosMunicipio(page = 1,idMunicipio){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT c.id_corregimiento, c.nombre, c.descripcion
    FROM municipios as m, corregimientos as c
    WHERE (m.id_municipio=c.id_municipio)  and
          c.id_municipio=? 
          LIMIT ?,?`, 
    [idMunicipio, offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}/* End getCorregimientosMunicipio*/

async function create(corregimiento){
    const result = await db.query(
      `INSERT INTO corregimientos(id_corregimiento, nombre,descripcion,id_municipio) VALUES (?,?,?,?)`, 
      [
        corregimiento.id_corregimiento,
        corregimiento.nombre,
        corregimiento.descripcion,
        corregimiento.id_municipio
      ]
    );
  
    let message = 'Error creando corregimiento';
  
    if (result.affectedRows) {
      message = {  insertId: result.insertId, message:'corregimiento creado exitosamente'};
    }
  
    return {message};
  }

  async function update(id, corregimiento){
    const result = await db.query(
      `UPDATE corregimientos 
       SET nombre=?,
           descripcion=?,
           id_municipio=?
       WHERE id_corregimiento=?`,
       [
         corregimiento.nombre,
         corregimiento.descripcion, 
         corregimiento.id_municipio,
         id
       ] 
    );
  
    let message = 'Error actualizando corregimiento';
  
    if (result.affectedRows) {
      message = 'corregimiento actualizado exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM corregimientos WHERE id_corregimiento=?`, 
      [id]
    );
  
    let message = 'Error borrando corregimiento';
  
    if (result.affectedRows) {
      message = 'corregimiento borrado exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  getCorregimientosMunicipio,
  create,
  update,
  remove
}