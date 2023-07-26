const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM proyectos LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function create(proyecto){
     const result = await db.query(
      `INSERT INTO proyectos (id_proyecto,nombre,fecha_creacion,formulador,codigo_bpin,duracion_meses,archivo,id_sector_fk) VALUES (?,?,?,?,?,?,?,?)`, 
      [
        proyecto.id_proyecto,
        proyecto.nombre,
        proyecto.fecha_creacion,
        proyecto.formulador,
        proyecto.codigo_bpin,
        proyecto.duracion_meses,
        proyecto.archivo,
        proyecto.id_sector_fk
      ]
    );
  
    let message = {message: 'Error creando proyecto'};
  
    if (result.affectedRows) {
      message = {  insertId: result.insertId, message:'proyecto creado exitosamente'};
    }
  
    return message;
  }

  async function update(id, proyecto){
    const result = await db.query(
      `UPDATE proyectos 
       SET nombre=?,
           fecha_creacion=?,
           formulador=?,
           codigo_bpin=?,
           duracion_meses=?,
           archivo=?,
           id_sector_fk=?
       WHERE id_proyecto=?`,
       [
          proyecto.nombre,
          proyecto.fecha_creacion,
          proyecto.formulador,
          proyecto.codigo_bpin,
          proyecto.duracion_meses,
          proyecto.archivo,
          proyecto.id_sector_fk,
          id
       ] 
    );
  
    let message = 'Error actualizando proyecto';
  
    if (result.affectedRows) {
      message = 'proyecto actualizado exitosamente';
    }
  
    return {message};
  }
  
  async function remove(id){
    const result = await db.query(
      `DELETE FROM proyectos WHERE id_proyecto=?`, 
      [id]
    );
  
    let message = 'Error borrando proyecto';
  
    if (result.affectedRows) {
      message = 'proyecto borrada exitosamente';
    }
  
    return {message};
  }

module.exports = {
  getMultiple,
  create,
  update,
  remove
}