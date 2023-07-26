const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

/*___________________________getMultiple___________________________________________*/
async function getMultiple(page = 1){
      const offset = helper.getOffset(page, config.listPerPage);
      const rows = await db.query(
        `SELECT  n.id as id_normatividad, tn.nombre as tipo, n.nombre as nombre,  n.contenido AS contenido,n.url_descarga AS url_descarga,
                 n.id_tipo_fk as id_tipo, n.fecha as fecha
        FROM normatividades as n inner join tipos_normatividades as tn on n.id_tipo_fk=tn.id_tipo
         LIMIT ?,?`, 
        [offset, config.listPerPage]
      );
      const data = helper.emptyOrRows(rows);
      const meta = {page};
      return {
        data,
        meta
      }
}/*End getMultiple*/

/*____________________getNormatividadesCadena________________________________________________*/
async function getNormatividadesCadena(page = 1, cadena){
        const offset = helper.getOffset(page, config.listPerPage);
        let cad= '%'+cadena+'%';
        const rows = await db.query(
          `SELECT  n.id, tn.nombre as tipo,n.nombre as nombre, n.contenido, n.url_descarga, n.fecha 
          FROM  normatividades as n inner join tipos_normatividades as tn on n.id_tipo_fk=tn.id_tipo
          WHERE tn.nombre  like ? or n.nombre like ? or n.contenido like ? 
          LIMIT ?,?`, 
          [cad,cad, cad, offset, config.listPerPage]
        );
        const data = helper.emptyOrRows(rows);
        const meta = {page};
        return {
          data,
          meta
        }
}/*End getNormatividadesCadena*/

/*_______________________ getNormatividadesTipo_________________________________*/
async function getNormatividadesTipo(page = 1, tipo){
      const offset = helper.getOffset(page, config.listPerPage);
      let tipoNormatividad= '%'+tipo+'%';
      const rows = await db.query(
        `SELECT  n.id, tn.nombre as tipo,n.nombre as nombre, n.contenido, n.url_descarga, n.fecha, tn.id_tipo 
        FROM normatividades as n inner join tipos_normatividades as tn on n.id_tipo_fk=tn.id_tipo
        WHERE tn.nombre like ?
        LIMIT ?,?`, 
        [tipoNormatividad, offset, config.listPerPage]
      );
      const data = helper.emptyOrRows(rows);
      const meta = {page};
      return {
        data,
        meta
      }
}/*End getNormatividadesTipo*/

/*___________________________create___________________________________________*/
async function create(normatividad,token){
    try{
            if(token && validarToken(token)){
                    let payload=helper.parseJwt(token);
                    let tipo_user= payload.rol; 
                  if(tipo_user!='Administrador'){
                          throw createError(401,"Usted no tiene autorización para registrar eventos");
                  }
                  if(                     
                      normatividad.nombre===undefined ||  
                      normatividad.contenido===undefined || 
                      normatividad.url_descarga===undefined || 
                      normatividad.id_tipo===undefined || 
                      normatividad.fecha===undefined                   
                    )
                    {
                      throw createError(400,"Se requieren todos los parámetros de la normatividad");
                    }
                  const result = await db.query(
                    `INSERT INTO normatividades(nombre, contenido,url_descarga,id_tipo_fk,fecha) VALUES (?,?,?,?,?)`, 
                    [
                    normatividad.nombre, 
                    normatividad.contenido,
                    normatividad.url_descarga, 
                    normatividad.id_tipo,
                    normatividad.fecha       
                    ]
                  );  
                  let message = 'Error creando normatividad';  
                  if (result.affectedRows) {
                    message = 'La normatividad se registro exitosamente';
                  }  
                  return {message};
            }else{ 
                  throw createError(401,"Usted no tiene autorización"); 
            }
     }catch(error){
             throw error;
     }
  }/*End create*/

  /*___________________________update___________________________________________*/
  async function update(id, normatividad, token){
        try{
              if(token && validarToken(token)){
                      let payload=helper.parseJwt(token);
                      let tipo_user= payload.rol; 
                    if(tipo_user!='Administrador'){
                            throw createError(401,"Usted no tiene autorización para registrar eventos");
                    }
                  const result = await db.query(
                    `UPDATE normatividades
                    SET nombre=?,
                        contenido=?,
                        url_descarga=?, 
                        id_tipo_fk=?,
                        fecha=?
                    WHERE id=?`,
                    [
                      normatividad.nombre, 
                      normatividad.contenido,
                      normatividad.url_descarga, 
                      normatividad.id_tipo,
                      normatividad.fecha,
                      id
                    ] 
                  );  
                  let message = 'Error actualizando normatividad';  
                  if (result.affectedRows) {
                    message = 'Registro de normatividad actualizado exitosamente';
                  }  
                  return {message};
              }else{ 
                  throw createError(401,"Usted no tiene autorización"); 
              }
        }catch(error){
                throw error;
        }
  }/*End update*/
 
/*___________________________remove___________________________________________*/  
  async function remove(id,token){
          try{
                if(token && validarToken(token)){
                        let payload=helper.parseJwt(token);
                        let tipo_user= payload.rol; 
                      if(tipo_user!='Administrador'){
                              throw createError(401,"Usted no tiene autorización para registrar eventos");
                      }
                      const result = await db.query(
                        `DELETE FROM normatividades WHERE id=?`, 
                        [id]
                      );  
                      let message = 'Error borrando normatividad';  
                      if (result.affectedRows) {
                        message = 'Registro de normatividad borrado exitosamente';
                      }  
                      return {message};
                }else{ 
                      throw createError(401,"Usted no tiene autorización"); 
                }
            }catch(error){
                    throw error;
            }     
  }/*End remove*/

/*_______________________ ObtenerTiposNormatividades_________________________________*/
async function obtenerTiposNormatividades(){          
          const rows = await db.query(
            `SELECT  tn.nombre as tipo, tn.id_tipo as id_tipo
            FROM normatividades as n inner join tipos_normatividades as tn on n.id_tipo_fk=tn.id_tipo
            `, 
            []
          );
          const data = helper.emptyOrRows(rows);
         return {
            data
          }
}/*End obtenerTiposNormatividades*/



module.exports = {
  getMultiple,
  getNormatividadesCadena,
  getNormatividadesTipo,
  create,
  update,
  remove,
  obtenerTiposNormatividades
}