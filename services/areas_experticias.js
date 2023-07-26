const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');

/*_____________________ getAreaExperticia______________________________________________*/
async function getAreasExperticia(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM areas_experticias LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*End getAreaExperticia*/


/*_____________________ createAreaExperticia______________________________________________*/
async function createAreaExperticia(area_experticia){
        if(
           area_experticia.nombre === undefined ||
           area_experticia.descripcion === undefined ){
                throw createError(400,"Debe enviar todos los datos requeridos para el registro del área de experticia");
        }
          try{
                const result = await db.query(
                  `INSERT INTO areas_experticias(nombre,descripcion) VALUES (?,?)`, 
                  [                    
                    area_experticia.nombre, 
                    area_experticia.descripcion
                  ]
                );  
                let message = 'Error creando Area de Experticia';  
                if (result.affectedRows) {
                  message = 'Area de Experticia creada exitosamente';
                }else {
                      throw createError(500,"Ocurrió un problema al registrar un aárea de experticia");
                }
            }catch(err){
              throw err;
            }      
            return {message};
  }/*End createAreaExperticia*/

  /*_____________________ updateAreaExperticia______________________________________________*/
  async function updateAreaExperticia(id, area_experticia){
          if( 
            area_experticia.nombre === undefined ||
            area_experticia.descripcion === undefined ){
                throw createError(400,"Debe enviar todos los datos requeridos para la actualización del área de experticia");
          }
            const result = await db.query(
            `UPDATE areas_experticias
            SET nombre=?,
                descripcion=? 
            WHERE id_area=?`,
            [
              area_experticia.nombre, 
              area_experticia.descripcion,
              id
            ] 
          );  
          let message = 'Error actualizando Area de Experticia';  
          if (result.affectedRows) {
            message = 'Area de experticia actualizada exitosamente';
          }  
          return {message};
  }/*End updateAreaExperticia*/
  
  /*______________________ removeAreaExperticia_______________________________*/
  async function removeAreaExperticia(id){
        const result = await db.query(
          `DELETE FROM areas_experticias WHERE id_area=?`, 
          [id]
        );  
        let message = 'Error borrando Area de Experticia';  
        if (result.affectedRows) {
          message = 'Area de Experticia borrada exitosamente';
        }  
        return {message};
  }/*End removeAreaExperticia*/

module.exports = {
  getAreasExperticia,
  createAreaExperticia,
  updateAreaExperticia,
  removeAreaExperticia
}