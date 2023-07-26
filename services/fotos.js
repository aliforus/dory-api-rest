const db = require('./db');
const helper = require('../helper');
const config = require('../config');
const createError = require('http-errors');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM fotos LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(foto){
     const result = await db.query(
      `INSERT INTO fotos (id_foto,imagen,id_granja_fk) VALUES (?,?,?)`, 
      [
        foto.id_foto,
        foto.imagen,
        foto.id_granja_fk
      ]
    );
  
    let message = {message: 'Error creando la foto'};
  
    if (result.affectedRows) {
      message = {  insertId: result.insertId, message:'foto creada exitosamente'};
    }
  
    return message;
  }

  async function update(id, foto){
    try{
      const result = await db.query(
        `UPDATE fotos 
         SET imagen=?,
             id_granja_fk=? 
         WHERE id_foto=?`,
         [
            foto.imagen,
            foto.id_granja_fk,
            id
         ] 
      );
    
      if (result.affectedRows) {
        message = 'foto actualizada exitosamente';
      }else{
        throw createError(500,"Error actualizando la foto")
      }
    
      return {message};
    }catch(err){
      throw err;
    }
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM fotos WHERE id_foto=?`, 
      [id]
    );
  
    let message = 'Error borrando foto';
  
    if (result.affectedRows) {
      message = 'foto borrada exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}