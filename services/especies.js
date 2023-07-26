const db = require('./db');
const helper = require('../helper');
const config = require('../config');

/*-----------------getMultiple-------------------------------*/
async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM especies LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*---End GetMultiple-------*/

/*-----------------create-------------------------------*/
async function create(especie){
    const result = await db.query(
      `INSERT INTO especies(id_especie, nombre,descripcion,imagen) VALUES (?,?,?,?)`, 
      [
        especie.id_especie,
         especie.nombre,
          especie.descripcion,
          especie.imagen
      ]
    );
    let message = 'Error creando especie';  
    if (result.affectedRows) {
      message = {  insertId: result.insertId, message:'especie creada exitosamente'};
    }  
    return {message};
  }/*--End create--*/

/*-----------------update-------------------------------*/
  async function update(id, especie){
    const result = await db.query(
      `UPDATE especies 
       SET nombre=?,
           descripcion=?,
           imagen=? 
       WHERE id_especie=?`,
       [
         especie.nombre,
         especie.descripcion, 
         especie.imagen,
         id
       ] 
    );  
    let message = 'Error actualizando especie';  
    if (result.affectedRows) {
      message = 'especie actualizada exitosamente';
    }  
    return {message};
  }/*------End------update------*/

  /*-----------------remove-------------------------------*/
  async function remove(id){
    const result = await db.query(
      `DELETE FROM especies WHERE id_especie=?`, 
      [id]
    );  
    let message = 'Error borrando especie';  
    if (result.affectedRows) {
      message = 'especie borrada exitosamente';
    }  
    return {message};
  }/*--End--remove---*/

module.exports = {
  getMultiple,
  create,
  update,
  remove
}