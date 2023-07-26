const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');
/*------------------------------------------------getMultiple---------------------------------------------------*/
async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT e.*,te.nombre as tipo, m.nombre as modalidad
     FROM  eventos as e inner join tipos_eventos as te on e.id_tipo_evento_fk=te.id_evento
                        inner join modalidades as m on e.id_modalidad_fk=m.id_modalidad
     order by e.id_evento asc
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

/*__________________________getEventosCapacitaciones_____________________*/
async function getEventosCapacitaciones(page = 1, cadena){
      const offset = helper.getOffset(page, config.listPerPage);
      let cad= '%'+cadena+'%';
      const rows = await db.query(
        `SELECT distinct e.id_evento, e.nombre as nombre,e.url, e.resumen, e.fecha, e.hora, e.dirigidoa, e.organizador, e.costo, e.imagen, te.nombre as tipo
         FROM eventos as e inner join tipos_eventos as te  on ((te.nombre like '%Capacitaciones%') and (e.id_tipo_evento_fk=te.id_evento))                                              
         WHERE e.nombre like ? or e.resumen like ? or e.organizador like ? or e.dirigidoa like ?
         LIMIT ?,?`, 
        [cad, cad, cad, cad, offset, config.listPerPage]
      );  
      const data = helper.emptyOrRows(rows);
      const meta = {page};
      return {
        data,
        meta
      }
}/*End getEventosCapacitaciones*/

/*_____________________________End getEventosCongresos_____________________________________*/
async function getEventosCongresos(page = 1, cadena){
      const offset = helper.getOffset(page, config.listPerPage);
      let cad= '%'+cadena+'%';
      const rows = await db.query(
        `SELECT distinct e.id_evento, e.nombre as nombre,e.url, e.resumen, e.fecha, e.hora, e.dirigidoa, e.organizador, e.costo, e.imagen, te.nombre as tipo
        FROM eventos as e inner join tipos_eventos as te on ((te.nombre like '%Congresos%') and (e.id_tipo_evento_fk=te.id_evento))                                              
        WHERE e.nombre like ? or e.resumen like ? or e.organizador like ? or e.dirigidoa like ? 
        LIMIT ?,?`, 
        [cad, cad, cad, cad, offset, config.listPerPage]
      );  
      const data = helper.emptyOrRows(rows);
      const meta = {page};
      return {
        data,
        meta
      }
}/*End getEventosCongresos*/

/*______________________________ getEventosCursos__________________________________________*/
async function getEventosCursos(page = 1, cadena){
      const offset = helper.getOffset(page, config.listPerPage);
      let cad= '%'+cadena+'%';
      const rows = await db.query(
        `SELECT distinct e.id_evento, e.nombre as nombre,e.url, e.resumen, e.fecha, e.hora, e.dirigidoa, e.organizador, e.costo, e.imagen, te.nombre as tipo
        FROM eventos as e inner join tipos_eventos as te  on ((te.nombre like '%Cursos%') and (e.id_tipo_evento_fk=te.id_evento))                                              
        WHERE e.nombre like ? or e.resumen like ? or e.organizador like ? or e.dirigidoa like ?
         LIMIT ?,?`, 
        [cad, cad, cad, cad, offset, config.listPerPage]
      );
      const data = helper.emptyOrRows(rows);
      const meta = {page};

      return {
        data,
        meta
      }
}/*End getEventosCursos*/

/*__________________________ getEventosDiplomados___________________________________________*/
async function getEventosDiplomados(page = 1, cadena){
      const offset = helper.getOffset(page, config.listPerPage);
      let cad= '%'+cadena+'%';
      const rows = await db.query(
        `SELECT distinct e.id_evento, e.nombre as nombre,e.url, e.resumen, e.fecha, e.hora, e.dirigidoa, e.organizador, e.costo, e.imagen, te.nombre as tipo
        FROM eventos as e inner join tipos_eventos as te  on ((te.nombre like '%Diplomados%') and (e.id_tipo_evento_fk=te.id_evento))  
        WHERE    e.nombre like ? or e.resumen like ? or e.organizador like ? or e.dirigidoa like ? 
        LIMIT ?,?`, 
        [cad, cad, cad, cad, offset, config.listPerPage]
      );
      const data = helper.emptyOrRows(rows);
      const meta = {page};
      return {
        data,
        meta
      }
}/*End getEventosDiplomados*/

/*____________________________________getEventosSeminarios___________________________________________*/
async function getEventosSeminarios(page = 1, cadena){
      const offset = helper.getOffset(page, config.listPerPage);
      let cad= '%'+cadena+'%';
      const rows = await db.query(
        `SELECT distinct e.id_evento, e.nombre as nombre,e.url, e.resumen, e.fecha, e.hora, e.dirigidoa, e.organizador, e.costo, e.imagen, te.nombre as tipo
        FROM eventos as e inner join tipos_eventos as te on ((te.nombre like '%Seminarios%') and (e.id_tipo_evento_fk=te.id_evento))                                         
        WHERE e.nombre like ? or e.resumen like ? or e.organizador like ? or e.dirigidoa like ?
        LIMIT ?,?`, 
        [cad, cad, cad, cad, offset, config.listPerPage]
      );
      const data = helper.emptyOrRows(rows);
      const meta = {page};
      return {
        data,
        meta
      }
}/*END getEventosSeminarios */

/*___________________________________________ getEventosTalleres______________________________________ */
async function getEventosTalleres(page = 1, cadena){
          const offset = helper.getOffset(page, config.listPerPage);
          let cad= '%'+cadena+'%';
          const rows = await db.query(
            `SELECT distinct e.id_evento, e.nombre as nombre,e.url, e.resumen, e.fecha, e.hora, e.dirigidoa, e.organizador, e.costo, e.imagen, te.nombre as tipo
            FROM eventos as e inner join tipos_eventos as te on ((te.nombre like '%Talleres%') and (e.id_tipo_evento_fk=te.id_evento))                                             
            WHERE e.nombre like ? or e.resumen like ? or e.organizador like ? or e.dirigidoa like ?
            LIMIT ?,?`, 
            [cad, cad, cad, cad, offset, config.listPerPage]
          );
          const data = helper.emptyOrRows(rows);
          const meta = {page};
          return {
            data,
            meta
          }
}/*End getEventosTalleres */

/*__________________________________ getEventosTipos_______________________________ */
async function getEventosTipos(page = 1, tipo){
      const offset = helper.getOffset(page, config.listPerPage);
      let tipoEvento= '%'+tipo+'%';
      const rows = await db.query(
        `SELECT  te.nombre as tipo,e.*, m.nombre as modalidad
        FROM eventos as e inner join tipos_eventos as te on e.id_tipo_evento_fk=te.id_evento
                          inner join modalidades as m on e.id_modalidad_fk=m.id_modalidad      
        WHERE te.nombre like ?
        LIMIT ?,?`, 
        [tipoEvento, offset, config.listPerPage]
      );
      const data = helper.emptyOrRows(rows);
      const meta = {page};
      return {
        data,
        meta
      }
}/*End getEventosTipos */

/*------------------------------------------------create---------------------------------------------------*/
async function create(evento,token){
           try{
                if(token && validarToken(token)){
                        let payload=helper.parseJwt(token);
                        let tipo_user= payload.rol; 
                       if(tipo_user!='Administrador'){
                              throw createError(401,"Usted no tiene autorización para registrar eventos");
                       }
                       if(
                          evento.nombre===undefined || 
                          evento.resumen===undefined || 
                          evento.fecha===undefined ||
                          evento.hora===undefined || 
                          evento.imagen===undefined ||
                          evento.url===undefined ||
                          evento.dirigidoa===undefined || 
                          evento.organizador===undefined || 
                          evento.costo===undefined ||
                          evento.id_modalidad===undefined || 
                          evento.id_tipo_evento===undefined 
                        )
                        {
                          throw createError(400,"Se requieren todos los parámetros del evento");
                        }
                            const result = await db.query(
                              `INSERT INTO eventos(nombre,resumen,fecha, hora, imagen, url, dirigidoa, organizador, costo, id_modalidad_fk, id_tipo_evento_fk) VALUES (?,?,?,?,?,?,?,?,?,?,?)`, 
                              [
                                evento.nombre,
                                evento.resumen,
                                evento.fecha,
                                evento.hora,
                                evento.imagen,
                                evento.url,
                                evento.dirigidoa,
                                evento.organizador,
                                evento.costo,
                                evento.id_modalidad, 
                                evento.id_tipo_evento
                              ]
                            );          
                            let message = 'Error creando la evento';          
                            if (result.affectedRows) {
                              message = {  insertId: result.insertId, message:'evento creada exitosamente'};
                            }          
                            return {message};
                   }else{ 
                         throw createError(401,"Usted no tiene autorización"); 
                   }
            }catch(error){
                    throw error;
             }
  }/**End create*/

  /*------------------------------------------------update---------------------------------------------------*/
  async function update(idEvento, evento, token){
          try{
                if(token && validarToken(token)){
                        let payload=helper.parseJwt(token);
                        let tipo_user= payload.rol; 
                      if(tipo_user!='Administrador'){
                              throw createError(401,"Usted no tiene autorización para actualizar eventos");
                      }
                      if(
                        evento.nombre===undefined || 
                        evento.resumen===undefined || 
                        evento.fecha===undefined ||
                        evento.hora===undefined || 
                        evento.imagen===undefined ||
                        evento.url===undefined ||
                        evento.dirigidoa===undefined || 
                        evento.organizador===undefined || 
                        evento.costo===undefined ||
                        evento.id_modalidad===undefined || 
                        evento.id_tipo_evento===undefined 
                      )
                      {
                        throw createError(400,"Se requieren todos los parámetros del evento");
                      }

                                  const result = await db.query(
                                    `UPDATE eventos 
                                    SET nombre=?,
                                        resumen=?,
                                        fecha=?,
                                        hora=?,
                                        imagen=?,
                                        url=?,
                                        dirigidoa=?,
                                        organizador=?,
                                        costo=?,
                                        id_modalidad_fk=?,
                                        id_tipo_evento_fk=?
                                    WHERE id_evento=?`,
                                    [
                                      evento.nombre,
                                      evento.resumen,
                                      evento.fecha,
                                      evento.hora,
                                      evento.imagen,
                                      evento.url,
                                      evento.dirigidoa,
                                      evento.organizador,
                                      evento.costo,
                                      evento.id_modalidad,
                                      evento.id_tipo_evento,
                                      idEvento
                                    ] 
                                  );                      
                                  let message = 'Error actualizando el evento';                      
                                  if (result.affectedRows) {
                                    message = 'evento actualizado exitosamente';
                                  }                      
                                  return {message};
                    }else{ 
                       throw createError(401,"Usted no tiene autorización"); 
                    }
              }catch(error){
                   throw error;
              }
  }/*End Update*/
  
/*------------------------------------------------remove---------------------------------------------------*/  
  async function remove(idEvento, token){
            try{
                  if(token && validarToken(token)){
                          let payload=helper.parseJwt(token);
                          let tipo_user= payload.rol; 
                        if(tipo_user!='Administrador'){
                                throw createError(401,"Usted no tiene autorización para eliminar los eventos");
                        }
                        const conection= await db.newConnection(); /*conection of TRANSACTION */
                        conection.beginTransaction();
                        let message = 'Error borrando el evento';  
                        try {   
                                  await db.query(
                                    `DELETE from categorias_eventos where id_evento_pk_fk=?`,
                                      [idEvento]
                                  );
                                      const result = await db.query(
                                        `DELETE FROM eventos WHERE id_evento=?`, 
                                        [idEvento]
                                      );  
                                      
                                      if (result.affectedRows) {
                                        message = 'evento borrado exitosamente';
                                      }  
                                      conection.commit(); 
                                      conection.release();
                                     return {message};                                
                              } catch (error) {
                                conection.rollback(); /*Si hay algún error  */ 
                                conection.release();
                                throw createError(500,"Error al eliminar la novedad");
                              }
                    }else{ 
                         throw createError(401,"Usted no tiene autorización"); 
                    }

                }catch(error){
                      throw error;
                }
  }/*End remove*/

  /*------------------------------updateParcialEvento-------------------------------------------------*/
async function updateParcialEvento(idEvento, evento, token){  
        if(token && validarToken(token))
        {
          const payload=helper.parseJwt(token); 
          const rol = payload.rol;
          if(rol != "Administrador"){
            throw createError('401', "Usted no esta autorizado para realizar éste proceso.")
          }      
          const rows2 = await db.query(
            `select ev.*
            from eventos as ev
            where ev.id_evento = ?`, 
            [
              idEvento
            ]
          );
          if(rows2.length < 1 ){
            throw createError('401', 'El evento no existe.')
          }
          var atributos = Object.keys(evento);   
          if(atributos.length!=0)
          {    
            var params = Object.values(evento);   
            var query = "update eventos set ";
            params.push(idEvento);
            for(var i=0; i < atributos.length; i++) {
              query = query + atributos[i] + '=?,';
            }
            query = query.substring(0, query.length-1);/*eliminar la coma final*/ 
            query = query +' '+'where id_evento=?'
            const result = await db.query(query,params);          
            let message = '';
            if (result.affectedRows) {
               message = 'Evento actualizado exitosamente';
            }else{
              throw createError(500,"No se pudo actualizar el evento");    
            }
            return {message};
          }
          throw createError(400,"No hay parámetros para actualizar");
      }else{
        throw createError(401,"Usuario no autorizado");
      }
}/*End updateParcialEvento*/

module.exports = {
  getMultiple,
  getEventosCapacitaciones,
  getEventosCongresos,
  getEventosCursos,
  getEventosDiplomados,
  getEventosSeminarios,
  getEventosTalleres,
  getEventosTipos,
  create,
  update,
  remove,
  updateParcialEvento
}