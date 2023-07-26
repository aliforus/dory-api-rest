const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getVeredasMunicipio(page = 1,idMunicipio){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT v.id_vereda, v.nombre, v.descripcion
    FROM municipios as m, veredas as v
    WHERE (m.id_municipio=v.id_municipio)  and
          v.id_municipio=? 
          LIMIT ?,?`, 
    [idMunicipio, offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}/*End getVeredasMunicipio*/

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM veredas LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}

async function create(vereda){
    const result = await db.query(
      `INSERT INTO veredas(id_vereda, nombre,descripcion,id_municipio,id_corregimiento_fk) VALUES (?,?,?,?,?)`, 
      [
        vereda.id_vereda,
        vereda.nombre,
        vereda.descripcion,
        vereda.id_municipio,
        vereda.id_corregimiento_fk
      ]
    );
  
    let message = 'Error creando vereda';
  
    if (result.affectedRows) {
      message = {  insertId: result.insertId, message:'vereda creada exitosamente'};
    }
      return {message};
  }

  async function update(id, vereda){
    const result = await db.query(
      `UPDATE veredas 
       SET nombre=?,
           descripcion=?,
           id_municipio=?,
           id_corregimiento_fk=?
       WHERE id_vereda=?`,
       [
         vereda.nombre,
         vereda.descripcion, 
         vereda.id_municipio,
         vereda.id_corregimiento_fk,
         id
       ] 
    );
  
    let message = 'Error actualizando vereda';
  
    if (result.affectedRows) {
      message = 'Vereda actualizada exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM veredas WHERE id_vereda=?`, 
      [id]
    );  
    let message = 'Error borrando la vereda';  
    if (result.affectedRows) {
      message = 'Vereda borrada exitosamente';
    }
      return {message};
  }

module.exports = {
  getVeredasMunicipio,
  getMultiple,
  create,
  update,
  remove
}