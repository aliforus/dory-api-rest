const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM tipos_eventos LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(tipo_evento){
    const result = await db.query(
      `INSERT INTO tipos_eventos(id,nombre,descripcion) VALUES (?,?,?)`, 
      [
       tipo_evento.id,
       tipo_evento.nombre,
       tipo_evento.descripcion
      ]
    );
  
    let message = 'Error creando un tipo de evento';
  
    if (result.affectedRows) {
      message = 'El tipo de evento se registro exitosamente';
    }
  
    return {message};
  }

  async function update(id, tipo_evento){
    const result = await db.query(
      `UPDATE tipos_eventos
       SET nombre=?,
           descripcion=?
       WHERE id=?`,
       [
        tipo_evento.nombre,
        tipo_evento.descripcion,
         id
       ] 
    );
  
    let message = 'Error actualizando tipo de evento';
  
    if (result.affectedRows) {
      message = 'Registro de evento actualizado exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM tipos_eventos WHERE id=?`, 
      [id]
    );
  
    let message = 'Error borrando tipo de evento';
  
    if (result.affectedRows) {
      message = 'Registro de tipo de evento borrado exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}