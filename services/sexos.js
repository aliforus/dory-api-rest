const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');

/*_____________________ getSexos______________________________________________*/
async function getSexos(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM sexos LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*End getSexos*/


/*_____________________ createSexo______________________________________________*/
async function createSexo(Sexo){
        if(Sexo.id === undefined || 
           Sexo.nombre === undefined ){
                throw createError(400,"Debe enviar todos los datos requeridos para el registro del Sexo");
        }
         let message = 'Error creando el Sexo del usuario';  
          try{
                const result = await db.query(
                  `INSERT INTO sexos(id,nombre) VALUES (?,?)`, 
                  [
                    Sexo.id,
                    Sexo.nombre
                  ]
                );                  
                if (result.affectedRows) {
                  message = 'Sexo de usuario creado exitosamente';
                }else {
                      throw createError(500,"Ocurrió un problema al registrar el Sexo del usuario");
                }
            }catch(err){
              throw err;
            }      
            return {message};
  }/*End createSexo*/

  /*_____________________ updateSexo______________________________________________*/
  async function updateSexo(id, Sexo){
          if( 
            Sexo.nombre === undefined ){
                throw createError(400,"Debe enviar todos los datos requeridos para la actualización del Sexo del usuario");
          }
            const result = await db.query(
            `UPDATE sexos
            SET nombre=? 
            WHERE id=?`,
            [
              Sexo.nombre, 
              id
            ] 
          );  
          let message = 'Error actualizando el Sexo del usuario';  
          if (result.affectedRows) {
            message = 'Sexo de usuario actualizado exitosamente';
          }  
          return {message};
  }/*End updateSexo*/
  
  /*______________________ removeSexo_______________________________*/
  async function removeSexo(id){
        const result = await db.query(
          `DELETE FROM sexos WHERE id=?`, 
          [id]
        );  
        let message = 'Error borrando el Sexo del usuario';  
        if (result.affectedRows) {
          message = 'Sexo de usuario borrado exitosamente';
        }  
        return {message};
  }/*End removeSexo*/

module.exports = {
  getSexos,
  createSexo,
  updateSexo,
  removeSexo
}