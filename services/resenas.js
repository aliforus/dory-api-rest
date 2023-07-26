const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

async function getResenasGranja(page = 1,idGranja){     
  const offset = helper.getOffset(page, config.listPerPage);
  let rows=[];      
        rows = await db.query(
        `SELECT  r.id_reseña as id,
        r.descripcion,
        r.fecha, 
        r.usuarios_id as id_usuario, 
        r.id_granja_pk_fk as id_granja, 
        g.nombre as nombre_granja,
        (select concat(u.nombres,' ',u.apellidos) from usuarios as u inner join reseñas r2 on u.id = r.usuarios_id where r2.id_reseña = r.id_reseña) as nombre_usuario,
        (select u.foto from usuarios as u inner join reseñas r2 on u.id = r.usuarios_id where r2.id_reseña = r.id_reseña) as foto_usuario,
        r.calificacion
        FROM reseñas as r inner join granjas as g on (r.id_granja_pk_fk=g.id_granja)
                          inner join usuarios as u on (r.usuarios_id=u.id)
        WHERE  g.id_granja=?
        order by r.fecha desc
              LIMIT ?,?`, 
        [idGranja,offset, config.listPerPage]
      );  
      const rowspuntajes = await db.query(
        `SELECT avg(r.calificacion) as puntaje
        FROM  reseñas as r
        WHERE r.id_granja_pk_fk = ?`,
        [idGranja]
      );
      var data = {};
      data.resenas = helper.emptyOrRows(rows);
      data.puntaje = rowspuntajes[0].puntaje;
      data.id_granja = idGranja;
      const meta = {page};
      return {
        data,
        meta
      }
}/*End getResenasGranja*/


async function getResenaUsuario(token,idGranja){     
  let rows=[]; 
  if(token && validarToken(token))
  {
    let payload = helper.parseJwt(token);
    let userId = payload.sub;
    rows = await db.query(
    `SELECT  r.id_reseña as id,
    r.descripcion,
    r.fecha, 
    r.usuarios_id as id_usuario, 
    r.id_granja_pk_fk as id_granja, 
    g.nombre as nombre_granja,
    (select concat(u.nombres,' ',u.apellidos) from usuarios as u inner join reseñas r2 on u.id = r2.usuarios_id where r2.id_reseña = r.id_reseña) as nombre_usuario,
    (select u.foto from usuarios as u inner join reseñas r2 on u.id = r2.usuarios_id where r2.id_reseña = r.id_reseña) as foto_usuario,
    r.calificacion
    FROM reseñas as r inner join granjas as g on (r.id_granja_pk_fk=g.id_granja)
    WHERE r.id_granja_pk_fk=? and r.usuarios_id = ? `, 
    [idGranja, userId]);

    var data = {};

    data.resena = helper.emptyOrRows(rows).length == 0 ? null : rows[0];
    const meta = {};
    return {
      data,
      meta
    }
  }else{
    throw createError(401, 'Usuario no autorizado')
  }  
}/*End getResenasGranja*/


async function getMultiple(page = 1){
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
      `SELECT * FROM reseñas LIMIT ?,?`, 
      [offset, config.listPerPage]
    );
    const data = helper.emptyOrRows(rows);
    const meta = {page};
    return {
      data,
      meta
    }
}/*End getMultiple*/

async function create(resena, token){
      if(token && validarToken(token))
      {
            const payload=helper.parseJwt(token);  
            const id_user=payload.sub;
          try{
                if(resena.id_granja===undefined || resena.descripcion===undefined ||  resena.calificacion===undefined)
                {
                  throw createError(400,"Se requieren todos los parámetros!");
                }
                if (resena.calificacion>5 || resena.calificacion<1){
                  throw createError(400,"La calificación de la granja debe ser mayor a 1 y menor a 5");
                }
                /*consultar si el usuario tiene relación con la granja en la reseña*/
                const validarUsuario = await db.query(
                  `SELECT *
                  FROM  reseñas as r
                  WHERE r.id_granja_pk_fk = ? and r.usuarios_id=?`,
                  [resena.id_granja, id_user]
                );
                if(validarUsuario.length>0){
                  throw createError(400,"Usuario ya tiene una reseña con esa granja");
                }
                const currentDate = new Date();
                const fecha = currentDate.toISOString();
                const result = await db.query(
                  `INSERT INTO reseñas(id_granja_pk_fk, usuarios_id, descripcion, fecha, calificacion) VALUES (?,?,?,?,?)`, 
                  [
                    resena.id_granja,
                    id_user,
                    resena.descripcion,
                    fecha,
                    resena.calificacion
                  ]
                );              
                let message = 'Error creando la reseña';              
                if (result.affectedRows) {
                  message = {  insertId: result.insertId, message:'Reseña creada exitosamente'};
                }              
                return {message};
              }catch(err){        
                 throw err;
              }             
      }else{
            throw createError(401,"Usuario no autorizado");
      }
  }/*End create*/

  async function update(idResena, resena,token){
        if(token && validarToken(token))
        {
           try{ 
                  if(resena.id_granja===undefined || resena.descripcion===undefined ||  resena.fecha===undefined ||  resena.calificacion===undefined)
                  {
                    throw createError(400,"Se requieren todos los parámetros!");
                  }
                  const payload=helper.parseJwt(token);  
                  const id_user=payload.sub;
                  const rows = await db.query(
                    `SELECT r.usuarios_id
                    FROM reseñas as r
                    WHERE r.usuarios_id=?`, 
                    [id_user]
                  );
                  if(rows.length<=0){
                    return {message:'Usted no tiene autorización para éste proceso'};
                  }
                   const result = await db.query(
                    `UPDATE reseñas 
                    SET id_granja_pk_fk=?,
                        usuarios_id=?,
                        descripcion=?,
                        fecha=?,
                        calificacion=?
                    WHERE id_reseña=?`,
                    [
                      resena.id_granja,
                      id_user,
                      resena.descripcion,
                      resena.fecha,
                      resena.calificacion,
                      idResena
                    ] 
                  );  
                  let message = 'Error actualizando la reseña';  
                  if (result.affectedRows) {
                    message = 'Reseña actualizada exitosamente';
                  }  
                  return {message};
               }catch{
                    throw createError(500,"Error Actualizando la Reseña");
               }             
        }else{
              throw createError(401,"Usuario no autorizado");
        }
  }/*End Udate*/
  
  async function remove(idResena,token){
      if(token && validarToken(token))
      { 
            const payload=helper.parseJwt(token);  
            const id_user=payload.sub;
            const resena = await db.query(
              `SELECT r.usuarios_id
              FROM reseñas as r
              WHERE r.usuarios_id=? and r.id_reseña=?`, 
              [id_user, idResena]
            );
            if(resena.length<=0){
                    throw createError(401,"usted no esta Autorizado");
            }
          try{
                  const rows = await db.query(
                    `SELECT r.usuarios_id
                    FROM reseñas as r
                    WHERE r.usuarios_id=?`, 
                    [id_user]
                  );
                  if(rows.length<=0){
                    return {message:'Usted no tiene autorización para éste proceso'};
                  }
                  const result = await db.query(
                    `DELETE FROM reseñas WHERE id_reseña=?`, 
                    [idResena]
                  );  
                  let message = 'Error borrando la reseña';  
                  if (result.affectedRows) {
                    message = 'Reseña borrada exitosamente';
                  }  
                  return {message};
             }catch{
               throw createError(500,"Error Eliminando la Reseña");
             }
      }else{
        throw createError(401,"Usuario no autorizado");
      }
  }/*End Remove*/

module.exports = {
  getResenasGranja,
  getMultiple,
  create,
  update,
  remove,
  getResenaUsuario
}