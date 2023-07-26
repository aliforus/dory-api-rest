const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');

/*_____________________ getAreaExperticia______________________________________________*/
async function getEtnias(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM etnias LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*End getAreaExperticia*/


/*_____________________ createEtnia______________________________________________*/
async function createEtnia(etnia){
        if(etnia.id === undefined || 
           etnia.nombre === undefined ){
                throw createError(400,"Debe enviar todos los datos requeridos para el registro de la etnia");
        }
         let message = 'Error creando la etnia';  
          try{
                const result = await db.query(
                  `INSERT INTO etnias(id,nombre) VALUES (?,?)`, 
                  [
                    etnia.id,
                    etnia.nombre
                  ]
                );                  
                if (result.affectedRows) {
                  message = 'Etnia creada exitosamente';
                }else {
                      throw createError(500,"Ocurrió un problema al registrar la etnia");
                }
            }catch(err){
              throw err;
            }      
            return {message};
  }/*End createEtnia*/

  /*_____________________ updateEtnia______________________________________________*/
  async function updateEtnia(id, etnia){
          if( 
            etnia.nombre === undefined ){
                throw createError(400,"Debe enviar todos los datos requeridos para la actualización de la etnia");
          }
            const result = await db.query(
            `UPDATE etnias
            SET nombre=? 
            WHERE id=?`,
            [
              etnia.nombre, 
              id
            ] 
          );  
          let message = 'Error actualizando la etnia';  
          if (result.affectedRows) {
            message = 'Etnia actualizada exitosamente';
          }  
          return {message};
  }/*End updateEtnia*/
  
  /*______________________ removeEtnia_______________________________*/
  async function removeEtnia(id){
        const result = await db.query(
          `DELETE FROM etnias WHERE id=?`, 
          [id]
        );  
        let message = 'Error borrando la etnia';  
        if (result.affectedRows) {
          message = 'Etnia borrada exitosamente';
        }  
        return {message};
  }/*End removeEtnia*/

module.exports = {
  getEtnias,
  createEtnia,
  updateEtnia,
  removeEtnia
}