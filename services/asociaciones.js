const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');
const dayjs = require('dayjs');

async function ObtenerTodasAsociaciones(page = 1, token ){  
            let id_user;
            let row;
          if(token && validarToken(token)){ 
                const payload=helper.parseJwt(token);  
                id_user= payload.sub; 
                row = await db.query(
                  `SELECT a.*, d.nombre_departamento as departamento, m.nombre as municipio, ta.nombre as tipo_asociacion,
                          (select concat(u1.nombres,' ',u1.apellidos) from asociaciones_usuarios as au inner join usuarios as u1 on  u1.id = au.usuarios_id
                           where au.nit_asociacion_pk_fk=a.nit) as propietario,
                          (select tu.nombre_tipo_usuario  from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit
                                                                                           inner join tipos_usuarios as tu on tu.id_tipo_usuario = u.id_tipo_usuario) as tipo_usuario_propietario,
                          (select u.id from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as id_propietario,
                          (select u.email from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as email_propietario,
                          (select es.descripcion from solicitudes as s inner join estados_solicitudes as es on s.id_estado_fk = es.id_estado 
                           where  s.nit_asociacion_fk = a.nit and s.usuarios_id=?) as estado_solicitud,
                          (select ss.nombre from solicitudes as s inner join sender_solicitud as ss on s.id_sender_solicitud = ss.id_sender_solicitud                                               
                           where s.nit_asociacion_fk = a.nit and s.usuarios_id = ?) as solicitud_enviada_por,
                          (select s.id_solicitud  from solicitudes as s 
                           where s.nit_asociacion_fk = a.nit and s.usuarios_id = ?) as id_solicitud,
                          (select count(*) from solicitudes as s 
                           where s.id_estado_fk=2 and a.nit=s.nit_asociacion_fk)  as count_miembros  
                  FROM asociaciones as a inner join departamentos as d on a.id_departamento = d.id_departamento
                                    inner join municipios as m on a.id_municipio = m.id_municipio
                                    inner join tipos_asociaciones as ta on a.id_tipo_asociacion_fk = ta.id_tipo_asociacion
                  `,               
                  [id_user, id_user, id_user]
                  );
          }else{
                  row = await db.query(
                    `SELECT a.*, d.nombre_departamento as departamento, m.nombre as municipio, ta.nombre as tipo_asociacion,
                            (select concat(u1.nombres,' ',u1.apellidos) from asociaciones_usuarios as au inner join usuarios as u1 on  u1.id = au.usuarios_id
                            where au.nit_asociacion_pk_fk=a.nit) as propietario,
                            (select tu.nombre_tipo_usuario  from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit
                                                                                            inner join tipos_usuarios as tu on tu.id_tipo_usuario = u.id_tipo_usuario) as tipo_usuario_propietario,
                            (select u.id from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as id_propietario,
                            (select u.email from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as email_propietario,
                            (select count(*) from solicitudes as s 
                            where s.id_estado_fk=2 and a.nit=s.nit_asociacion_fk)  as count_miembros  
                    FROM asociaciones as a inner join departamentos as d on a.id_departamento = d.id_departamento
                                      inner join municipios as m on a.id_municipio = m.id_municipio
                                      inner join tipos_asociaciones as ta on a.id_tipo_asociacion_fk = ta.id_tipo_asociacion
                    `,               
                    []
                    );
          }  
              const data = helper.emptyOrRows(row);
              return {
                data
              }
}/*End ObtenerTodasAsociaciones*/

async function getAsociacionesDepartamento(page = 1, idDepartamento){  
        const offset = helper.getOffset(page, config.listPerPage);
        const rows = await db.query(
        `SELECT distinctrow  m.id_municipio, m.nombre, m.poblacion,
                (select count(*) 
                 from municipios as m1, asociaciones as a1
                 where m1.id_municipio=a1.id_municipio and  m1.id_municipio=m.id_municipio ) as count_asociaciones
        FROM   municipios as m
                                 left join departamentos as d on m.id_departamento_fk = d.id_departamento
                                 left join asociaciones as a on  a.id_municipio = m.id_municipio                                                             
                                 left join corregimientos as c on c.id_municipio = m.id_municipio
                                 left join veredas as v on v.id_municipio = m.id_municipio        
        WHERE  d.id_departamento=?
              LIMIT ?,?`, 
            [idDepartamento, offset, config.listPerPage]
       );
        const data = helper.emptyOrRows(rows);
        const meta = {page};
        return {
          data,
          meta
        }
}/*End GetAsociacionesDepartamento*/

/*---------------------- GetAsociacionesMunicipio--------------------------------*/
async function getAsociacionesMunicipio(page = 1, idMunic){  
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
  `SELECT a.*, (select ta.nombre from tipos_asociaciones as ta  where ta.id_tipo_asociacion=a.id_tipo_asociacion_fk) as tipo_asociacion ,
          d.nombre_departamento as departamento, 
          m.nombre as municipio, 
          ta.nombre as tipo_asociacion,
          (select tu.nombre_tipo_usuario 
            from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit
                                             inner join tipos_usuarios as tu on tu.id_tipo_usuario = u.id_tipo_usuario 
            ) as tipo_propietario,
          (select u.id 
          from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as id_propietario, 
          (select concat(u.nombres,' ',u.apellidos) 
          from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as propietario,
          (select u.email 
          from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as email  
     FROM asociaciones as a inner join departamentos as d on a.id_departamento = d.id_departamento
                            inner join municipios as m on a.id_municipio = m.id_municipio
                            inner join tipos_asociaciones as ta on a.id_tipo_asociacion_fk = ta.id_tipo_asociacion where a.id_municipio = ?`
     , 
    [idMunic]
 );
  const data = helper.emptyOrRows(rows);
  const meta = {};
  return {
    data,
    meta
  }
}/*End GetAsociacionesMunicipio*/

/*-------------------------------------------getDetail---------------------------------------------------------------------*/
async function getDetailAsociacion(nit,token){          
         let id_user;
         let row;
        if(token && validarToken(token)){ 
              const payload=helper.parseJwt(token);  
              id_user= payload.sub; 
              row = await db.query(
                `SELECT a.*, d.nombre_departamento as departamento, m.nombre as municipio, ta.nombre as tipo_asociacion,
                          (select concat(u.nombres,' ',u.apellidos) 
                                from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id 
                                where au.nit_asociacion_pk_fk = ?) as propietario,
                          (select tu.nombre_tipo_usuario 
                          from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit
                                                            inner join tipos_usuarios as tu on tu.id_tipo_usuario = u.id_tipo_usuario) as tipo_propietario,
                          (select u.id 
                          from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as id_propietario,                         
                          (select u.email 
                          from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as email_propietario,
                          (select u.url_sisben 
                            from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as url_sisben,
                          (select u.url_imagen_cedula 
                              from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as url_imagen_cedula, 
                          (select es.descripcion from solicitudes as s inner join estados_solicitudes as es on s.id_estado_fk = es.id_estado where s.nit_asociacion_fk = ? and s.usuarios_id = ?) as estado_solicitud, 
                          (select ss.nombre from solicitudes as s inner join sender_solicitud as ss on s.id_sender_solicitud = ss.id_sender_solicitud where s.nit_asociacion_fk = ? and s.usuarios_id = ?) as solicitud_enviada_por,
                          (select s.id_solicitud from solicitudes as s where s.nit_asociacion_fk = ? and s.usuarios_id = ?) as id_solicitud ,
                          (select count(*)  
                          from solicitudes as s
                          where s.id_estado_fk=2 and s.nit_asociacion_fk=?
                          )  as count_miembros, 
                          (select count(*)  
                          from solicitudes as s inner join usuarios as u on s.usuarios_id=u.id
                          where s.id_estado_fk=2 and s.nit_asociacion_fk=? and u.id_sexo=2) count_miembros_masculinos,
                          (select count(*)  
                          from solicitudes as s inner join usuarios as u on s.usuarios_id=u.id
                          where s.id_estado_fk=2 and s.nit_asociacion_fk=? and u.id_sexo=1) count_miembros_femeninos,
                          (select count(*)  
                          from solicitudes as s inner join usuarios as u on s.usuarios_id=u.id
                                                inner join tipos_usuarios as tu on u.id_tipo_usuario=tu.id_tipo_usuario
                          where s.id_estado_fk=2 and s.nit_asociacion_fk=? and u.id_tipo_usuario=tu.id_tipo_usuario 
                                                 and tu.nombre_tipo_usuario like('Pescador')) as count_pescadores,
                          (select count(*)  
                           from solicitudes as s inner join usuarios as u on s.usuarios_id=u.id
                                                 inner join tipos_usuarios as tu on u.id_tipo_usuario=tu.id_tipo_usuario
                           where s.id_estado_fk=2 and s.nit_asociacion_fk=? and u.id_tipo_usuario=tu.id_tipo_usuario 
                                                                        and tu.nombre_tipo_usuario like('Piscicultor')) as count_piscicultores                
                FROM asociaciones as a inner join departamentos as d on a.id_departamento = d.id_departamento
                                       inner join municipios as m on a.id_municipio = m.id_municipio
                                       inner join tipos_asociaciones as ta on a.id_tipo_asociacion_fk = ta.id_tipo_asociacion
                WHERE a.nit = ?`,               
               [nit, nit, id_user, nit, id_user, nit, id_user, nit, nit, nit, nit, nit, nit]
               );
        }else{
                row = await db.query(
                  `SELECT a.*, d.nombre_departamento as departamento, m.nombre as municipio, ta.nombre as tipo_asociacion,
                            (select concat(u.nombres,' ',u.apellidos) 
                                  from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id 
                                  where au.nit_asociacion_pk_fk = ?) as propietario,
                            (select tu.nombre_tipo_usuario 
                            from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit
                                                              inner join tipos_usuarios as tu on tu.id_tipo_usuario = u.id_tipo_usuario) as tipo_propietario,
                            (select u.id 
                            from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as id_propietario,
                            (select u.email 
                            from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as email_propietario,
                            (select u.url_sisben 
                              from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as url_sisben,
                            (select u.url_imagen_cedula 
                                from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit) as url_imagen_cedula
                  FROM asociaciones as a inner join departamentos as d on a.id_departamento = d.id_departamento
                                         inner join municipios as m on a.id_municipio = m.id_municipio
                                         inner join tipos_asociaciones as ta on a.id_tipo_asociacion_fk = ta.id_tipo_asociacion                                         
                  where a.nit = ? `,               
                [nit,nit]
                );
        }  
            const data = helper.emptyOrRows(row);
            return {
              data
            }
      
}/*End getDetail*/

/*--------------------getAsociacionesUser----------------------------------*/
async function getAsociacionesUser(page = 1, id_user){                
                const offset = helper.getOffset(page, config.listPerPage);
                const rows = await db.query(/*--------------------Asociaciones del Usuario como propietario----------------------------------*/
                  `SELECT a.nit,a.nombre,a.direccion,a.telefono,a.legalconstituida,a.fecha_renovacion_camarac,a.foto_camarac,
                          a.id_tipo_asociacion_fk,a.id_departamento,a.id_municipio, a.url_rut,
                          (select d.nombre_departamento from departamentos d  where d.id_departamento=a.id_departamento) as departamento,
                          (select m.nombre from municipios as m  where m.id_municipio=a.id_municipio) as municipio,
                          a.id_corregimiento,a.id_vereda, a.informacion_adicional_direccion,a.corregimiento_vereda,au.usuarios_id,
                          (SELECT concat (u.nombres,' ',u.apellidos) from usuarios u where u.id=au.usuarios_id) as propietario,
                          (select tu.nombre_tipo_usuario 
                            from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id and au.nit_asociacion_pk_fk = a.nit
                                                             inner join tipos_usuarios as tu on tu.id_tipo_usuario = u.id_tipo_usuario 
                          ) as tipo_propietario,
                          (select ta.nombre from tipos_asociaciones as ta where ta.id_tipo_asociacion = a.id_tipo_asociacion_fk) as tipo_asociacion
                  FROM asociaciones as a left join asociaciones_usuarios as au on (a.nit=au.nit_asociacion_pk_fk)
                  WHERE au.usuarios_id=?
                   LIMIT ?,?`, 
                  [id_user,offset, config.listPerPage]
                );                
                const data = helper.emptyOrRows(rows);
                const meta = {page};
                return {
                  data,
                  meta
                }
}/*End getAsociacionesUser*/

/*________________Asociaciones a las que pertenece como miembro el usuario________________*/
async function getAsociacionesMiembros(page = 1, id_user){       
            const rows2 = await db.query(
              `SELECT a.nit,a.nombre,a.direccion,a.telefono,a.legalconstituida,a.fecha_renovacion_camarac,a.foto_camarac,
                      a.id_tipo_asociacion_fk,a.id_departamento,a.id_municipio, a.url_rut,
                      (select d.nombre_departamento from departamentos d  where d.id_departamento=a.id_departamento) as departamento,
                      (select m.nombre from municipios as m  where m.id_municipio=a.id_municipio) as municipio,
                      a.id_corregimiento,a.id_vereda, a.informacion_adicional_direccion,a.corregimiento_vereda,u.id as id_miembro,u.email,
                      (select au.usuarios_id
                       from asociaciones_usuarios as au inner join usuarios as u1 on au.usuarios_id = u1.id 
                                                         inner join asociaciones as a1 on au.nit_asociacion_pk_fk = a1.nit
                       where  s.nit_asociacion_fk=a1.nit and u1.id=au.usuarios_id) as id_propietario,                         
                      (select concat (u.nombres,' ',u.apellidos)
                       from asociaciones_usuarios as au inner join usuarios as u on au.usuarios_id = u.id 
                                                         inner join asociaciones as a1 on au.nit_asociacion_pk_fk = a1.nit
                       where  s.nit_asociacion_fk=a1.nit ) as propietario,
                      (select ta.nombre from tipos_asociaciones as ta where ta.id_tipo_asociacion = a.id_tipo_asociacion_fk) as tipo_asociacion,
                      s.id_solicitud
              FROM asociaciones as a inner join solicitudes as s on s.nit_asociacion_fk=a.nit
                                      inner join estados_solicitudes as e on s.id_estado_fk=e.id_estado
                                      inner join sender_solicitud as ss on s.id_sender_solicitud=ss.id_sender_solicitud
                                      inner join usuarios as u on s.usuarios_id=u.id
              WHERE s.id_estado_fk=2  and s.usuarios_id=? 
              `, 
              [id_user]
            ); 
const data = helper.emptyOrRows(rows2);
const meta = {page};
return {
  data,
  meta
}
}/*getAsociacionesMiembros*/

/*-------------------------createAsociacion-----------------------*/
async function createAsociacion(asociacion,token){
        const conection= await db.newConnection(); 
        await conection.beginTransaction(); 
        let message = 'Error creando asociacion';
          if(token && validarToken(token)){ 
                    const payload=helper.parseJwt(token);                             
                    const tipo_user= payload.rol; 
                    const id_user= payload.sub; 
              try{      
                      if(tipo_user!='Piscicultor' && tipo_user!='Pescador'){
                          throw createError(401,"Tipo de usuario no Válido");
                      }
                        if(asociacion.nit===undefined ||
                              asociacion.nombre===undefined ||                           
                              asociacion.direccion===undefined ||
                              asociacion.legalconstituida===undefined || 
                              asociacion.fecha_renovacion_camarac===undefined || 
                              asociacion.foto_camarac===undefined ||
                              asociacion.id_tipo_asociacion_fk === undefined ||
                              asociacion.id_departamento === undefined ||
                              asociacion.id_municipio === undefined ||
                              asociacion.informacion_adicional_direccion === undefined ||
                              asociacion.corregimiento_vereda === undefined ||
                              asociacion.telefono === undefined ||
                              asociacion.url_rut === undefined
                          )
                          {
                            throw createError(400,"Se requieren todos los parámetros!");
                          }

                           /*El usuario solo puede ser representante legal de una asociacion*/
                          const represetanteEn = await db.query(
                            `SELECT au.*
                            FROM asociaciones_usuarios as au
                            WHERE au.usuarios_id=?`, 
                            [id_user]
                          );

                          if(represetanteEn.length > 0){
                            throw createError(401,"El usuario ya es representante de una asociación"); 
                          }
                          /**********************************************************************/
                          
                           /*------verificar que el usuario no este en otra asociación------*/
                          const miembroEn = await db.query(
                            `SELECT s.*
                            FROM solicitudes as s
                            WHERE s.usuarios_id=? and id_estado_fk=2`, 
                            [id_user]
                          );
                          if(miembroEn.length>0){
                            throw createError(401,"Usuario es miembro de una asociación"); 
                          }    
                          /***************************************************************************/


                          const result = await conection.execute(
                            `INSERT INTO asociaciones(nit, nombre,direccion,legalconstituida,fecha_renovacion_camarac,foto_camarac,id_tipo_asociacion_fk,id_departamento,id_municipio,informacion_adicional_direccion,corregimiento_vereda,telefono, url_rut ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, 
                            [
                              asociacion.nit,
                              asociacion.nombre,
                              asociacion.direccion,
                              asociacion.legalconstituida,
                              asociacion.fecha_renovacion_camarac,
                              asociacion.foto_camarac,
                              asociacion.id_tipo_asociacion_fk,
                              asociacion.id_departamento,
                              asociacion.id_municipio,
                              asociacion.informacion_adicional_direccion,
                              asociacion.corregimiento_vereda,
                              asociacion.telefono,
                              asociacion.url_rut
                            ]
                          );                          
                          await conection.execute(
                            `INSERT INTO asociaciones_usuarios (nit_asociacion_pk_fk,usuarios_id) VALUES (?,?)`, 
                            [
                              asociacion.nit,
                              id_user
                            ]
                            );                          
                          if (result[0]['affectedRows']) {
                             message = {  nit: asociacion.nit, message:'asociacion creada exitosamente'};
                          }
                            await conection.commit(); 
                            conection.release(); 
                            return {message};
                  } catch(error){
                          await conection.rollback(); 
                          conection.release();
                          throw error; 
                  }
            }else{
              throw createError(401,"Usted no tiene autorización"); 
            }
  }/*End createAsociacion*/

  /*_----------------------------------update--------------------------------*/
  async function update(nit, asociacion,token){
        const conection= await db.newConnection(); 
        await conection.beginTransaction();        
        let message = '';
        let tipo_user= null; 
        let id_user= null;
        if(token && validarToken(token)){ 
            const payload=helper.parseJwt(token);                             
            tipo_user= payload.rol; 
            id_user=payload.sub;
              try{      
                if(tipo_user!='Piscicultor' && tipo_user!='Pescador' && tipo_user!="Administrador"){
                    throw createError(401,"Tipo de usuario no Válido");
                }
                        if( asociacion.nombre===undefined ||                           
                            asociacion.direccion===undefined ||
                            asociacion.legalconstituida===undefined || 
                            asociacion.fecha_renovacion_camarac===undefined || 
                            asociacion.foto_camarac===undefined ||
                            asociacion.id_tipo_asociacion_fk === undefined ||
                            asociacion.id_departamento === undefined ||
                            asociacion.id_municipio === undefined ||
                            asociacion.informacion_adicional_direccion === undefined ||
                            asociacion.corregimiento_vereda === undefined ||
                            asociacion.telefono === undefined ||
                            asociacion.url_rut === undefined
                            )
                        {
                          throw createError(400,"Se requieren todos los parámetros!");
                        }
                        const rows = await conection.execute(
                          `SELECT * 
                          FROM asociaciones as a left join asociaciones_usuarios as au on (a.nit=au.nit_asociacion_pk_fk and a.nit=?)
                          WHERE au.usuarios_id=?
                          `, 
                          [nit,id_user]
                        );  
                    if(rows.length<1){
                         throw createError(401,"Usted no tiene autorización para actualizar la asociación"); 
                    }
                    await conection.execute(
                      `DELETE from asociaciones_usuarios where nit_asociacion_pk_fk=?  and usuarios_id=?`,
                        [nit,id_user]
                      );
                  const result = await conection.execute(
                    `UPDATE asociaciones 
                     SET nombre=?,
                        direccion=?,
                        legalconstituida=?,
                        fecha_renovacion_camarac=?,
                        foto_camarac=?,
                        id_tipo_asociacion_fk=?,
                        id_departamento=?, 
                        id_municipio=?,
                        informacion_adicional_direccion=?,
                        corregimiento_vereda=?,
                        telefono=?,
                        url_rut=?
                    WHERE nit=?`,
                    [
                      asociacion.nombre,
                      asociacion.direccion,
                      asociacion.legalconstituida,
                      asociacion.fecha_renovacion_camarac,
                      asociacion.foto_camarac,
                      asociacion.id_tipo_asociacion_fk,
                      asociacion.id_departamento,
                      asociacion.id_municipio,
                      asociacion.informacion_adicional_direccion,
                      asociacion.corregimiento_vereda,
                      asociacion.telefono,
                      asociacion.url_rut,
                      nit
                    ] 
                  );
                  await conection.execute(
                    `INSERT INTO asociaciones_usuarios(nit_asociacion_pk_fk,usuarios_id) VALUES (?,?)`,
                    [nit, id_user]
                  );  
                  if (result[0]['affectedRows']) {  
                      message = 'Asociacion actualizada exitosamente';
                  }else{
                      message='Error actualizando asociación';
                  }
                      await conection.commit(); 
                      conection.release();
                      return {message};
              } catch(error){
                        await conection.rollback(); 
                        conection.release();
                        throw error;
              }
          }else{
            throw createError(401,"Usted no tiene autorización"); 
       }
  }/*End update*/
  
  /*----------------------------------------remove-------------------------------------------*/
  async function remove(nit,token){
        const conection= await db.newConnection(); 
        await conection.beginTransaction(); 
    if(token && validarToken(token)){ 
        const payload=helper.parseJwt(token);                             
        const tipo_user= payload.rol;
        const id_user= payload.sub; 
        try{      
                  if(tipo_user!='Piscicultor' && tipo_user!='Pescador' && tipo_user!="Administrador"){
                      throw createError(401,"Tipo de usuario no Válido");
                  }
                  if(nit!=undefined && id_user!=undefined && nit!=null && id_user!=null){ 
                            const rows = await conection.execute(
                              `SELECT * 
                              FROM asociaciones as a left join asociaciones_usuarios as au on (a.nit=au.nit_asociacion_pk_fk and a.nit=?)
                              WHERE au.usuarios_id=?
                              `, 
                              [nit,id_user]
                            );
                        if(rows.length<1){
                            throw createError(401,"Usted no tiene autorización para eliminar la asociación"); 
                        }
                        await conection.execute(
                          `DELETE FROM solicitudes WHERE nit_asociacion_fk=?`, 
                          [nit]
                          );
                        await conection.execute(
                          `DELETE FROM asociaciones_usuarios WHERE nit_asociacion_pk_fk=? and usuarios_id=? `, 
                          [nit,id_user]
                          );
                        const result = await conection.execute(
                        `DELETE FROM asociaciones WHERE nit=?`, 
                        [nit]
                        );                        
                        let message = 'Error borrando asociacion';  
                        if (result[0]['affectedRows']) {
                          message = 'Asociación borrada exitosamente';
                        } 
                          await conection.commit(); 
                          conection.release(); 
                          return {message};
                  }else{
                    throw createError(402,"Parámetros ingresados erroneamente");
                  }
           } catch(error){
                    await conection.rollback(); 
                    conection.release();
                    throw error; 
            }
     }else{
       throw createError(401,"Usted no tiene autorización"); 
     }
  }/*End remove*/

  /*------------------------------enviarSolicitudAdicion---------------------------------------------*/
  async function enviarSolicitudAdicion(res, nit, token,body){
          let id_usuario_creador= null;/*Creador de la solicitud; cuando la solicitud es enviada por una asociación este es el id del representante legal*/
          let id_user=null;
          let tipo_user='';
          let rowVerificar=[];
          let payload;
        if(token && validarToken(token)){
              payload=helper.parseJwt(token);             
              tipo_user= payload.rol; 
              id_usuario_creador= payload.sub;
              if(!(tipo_user==='Piscicultor' || tipo_user==='Pescador')){
                throw createError(401,"Tipo de usuario no Válido");
              }
        }else{
          throw createError(401,"Usted no tiene autorización"); 
        }
         var id_sender= 1;
         if(!body.quienEnvia || (body.quienEnvia!='usuario' && body.quienEnvia!='asociacion')){
                       throw createError(400,"No ha enviado la información correcta"); 
         }else{
            /*verificar que el usuario no sea un representante legal. Si es representante ya es miembro y no se le permite 
            estar en otra asociacion como miembro*/
            let userId;
            if(body.quienEnvia=='usuario'){
              userId = payload.sub;
            }else if(body.quienEnvia=='asociacion'){
              userId = body.id_usuario_receptor;
            }
            const represetanteEn = await db.query(
              `SELECT au.*
               FROM asociaciones_usuarios as au
               WHERE au.usuarios_id=?`, 
               [userId]
            );

            if(represetanteEn.length > 0){
              throw createError(401,"El usuario es representante de una asociación"); 
            }
            /**********************************************************************/

            if(body.quienEnvia=='usuario'){                
                /*------verificar que el usuario no este en otra asociación------*/
                rowVerificar = await db.query(
                  `SELECT s.*
                   FROM solicitudes as s
                   WHERE s.usuarios_id=? and id_estado_fk=2`, 
                   [id_usuario_creador]
                );
                if(rowVerificar.length>0){
                  throw createError(401,"Usted no puede registrarse en más de una asociación "); 
                }                     
                /*------fin-->--verificar que el usuario no este en otra asociación------*/
                id_sender = 1;
                id_user = id_usuario_creador;
            }else if(body.quienEnvia=='asociacion'){                    
                   if(!body.id_usuario_receptor){
                         throw createError(400,"No se especificó el ID del usuario receptor de la solicitud");
                   }
                     /*------verificar que el usuario no este en otra asociación------*/
                    rowVerificar = await db.query(
                      `SELECT s.*
                      FROM solicitudes as s
                      WHERE s.usuarios_id=? and id_estado_fk=2`, 
                      [body.id_usuario_receptor]
                    );
                    if(rowVerificar.length>0){
                      throw createError(401,"Usuario no puede estar registrado en más de una asociación "); 
                    }                     
                    /*------fin-->--verificar que el usuario no este en otra asociación------*/
                   id_sender = 2;                   
                   id_user = body.id_usuario_receptor;
                  /*validación del representante legal de la asociación*/                  
                  const row = await db.query(
                    `SELECT au.*
                     FROM asociaciones_usuarios as au
                     WHERE au.usuarios_id=? and au.nit_asociacion_pk_fk=?`, 
                     [id_usuario_creador, nit]
                  );
                  if(row.length<1){
                    throw createError(401,"Usted no tiene autorización, No es el representante legal de la asociación"); 
                  }
            }else{
                throw createError(400,"Debe especificar correctamente quien envia la solicitud");
            }
         }    
        const currentDate = new Date();
        const fecha = currentDate.toISOString();
        let message="Error al enviar la solicitud de adición a la asociación ";              
        try{   
              const result = await db.query(
                `INSERT INTO solicitudes (id_estado_fk,usuarios_id_creador,usuarios_id,id_sender_solicitud,nit_asociacion_fk,fecha) VALUES (?,?,?,?,?,?)`, 
                [
                  1,
                  id_usuario_creador,
                  id_user,
                  id_sender,
                  nit,
                  fecha
                ]
                );                      
              if(result.affectedRows){
                message="Solicitud de adición enviada exitosamente"
              };

              if(body.quienEnvia == 'usuario'){
                 /*Obtener el id del representante legal para enviar una notificacion via socket de que se le envio una solicitud de adicion a su asociacion*/
                 const row = await db.query(
                  `SELECT au.*
                   FROM asociaciones_usuarios as au
                   WHERE au.nit_asociacion_pk_fk=?`, 
                   [nit]
                );

                if(row.length > 0){
                  const idRepresentante = row[0].usuarios_id;
                  res.io.to(idRepresentante).emit('new-solicitud', 'reload');
                  console.log("solicitud enviada a representante!",idRepresentante)
                }
                console.log("salio de if envio rep")
              }else if(body.quienEnvia == 'asociacion'){
                res.io.to(id_user).emit('new-solicitud', 'reload');
                console.log("solicitud enviada a usuario!",id_user)
              }
              console.log("salio if envio usuario!")
              return {message, insertId:result.insertId};
          } catch(error){
              throw error; 
          } 
  }/*End enviarSolicitudAdicion*/

    /*------------------------------removeSolicitudAdicion---------------------------------------------*/
    async function removeSolicitudAdicion(res,id_solicitud, token){
        let message="Error al eliminar la solicitud de la asociación";  
        if(token && validarToken(token)){
                  const payload = helper.parseJwt(token); 
                  const id_user = payload.sub;                 
                  const tipo_user= payload.rol; 
             try{      
                    if(!(tipo_user==='Piscicultor' || tipo_user==='Pescador')){
                        throw createError(401,"Tipo de usuario no Válido");
                    }
                    const consulta1 = await db.query(
                      `select * FROM solicitudes WHERE id_solicitud=? and usuarios_id_creador=?`, 
                      [id_solicitud, id_user]
                    );

                    const consulta2 = await db.query(
                      `select * FROM solicitudes WHERE id_solicitud=? and usuarios_id=?`, 
                      [id_solicitud, id_user]
                    );

                    const consulta3 = await db.query(
                      `select * from asociaciones_usuarios au inner join solicitudes as s on au.nit_asociacion_pk_fk = s.nit_asociacion_fk WHERE s.id_solicitud = ? and au.usuarios_id = ?`, 
                      [id_solicitud, id_user]
                    );

                    if(consulta1.length < 1 && consulta2.length < 1  && consulta3.length < 1){  
                      throw createError(401,"Usuario no autorizado, usted no realizó la solicitud");                  
                    }
                    
                    const consulta4 = await db.query(
                      `select * FROM solicitudes WHERE id_solicitud=?`, 
                      [id_solicitud]
                    );

                    const consulta5 = await db.query(
                      `select *,au.usuarios_id as rep_id from asociaciones_usuarios au 
                      inner join solicitudes as s on au.nit_asociacion_pk_fk = s.nit_asociacion_fk 
                      where s.id_solicitud = ?`, 
                      [id_solicitud]
                    );

                    const result = await db.query(
                      `DELETE FROM solicitudes WHERE id_solicitud=?`, 
                      [id_solicitud]
                    );                     
                    if(result.affectedRows){
                      message="Eliminación de solicitud exitoso"
                      const userId = consulta4[0].usuarios_id;
                      //notificar que se borro la solicitud al usuario o al representante legal
                      if(userId == payload.sub){//si la borro el usuario notificar al representante
                        console.log("la borro el usuario")
                        console.log("consulta 5",consulta5)
                        if(consulta5.length > 0){
                          res.io.to(consulta5[0].rep_id).emit('new-solicitud', 'reload');
                          console.log("notificacion enviada a usuario ",consulta5[0].rep_id)
                        }
                      }else{//la borro el representante notificar al usuario
                        console.log("la borro el representante")
                        res.io.to(userId).emit('new-solicitud', 'reload');
                      }
                    };
                    return {message};
                } catch(error){
                  throw error; 
                }            
        }else{
          throw createError(401,"Usted no tiene autorización"); 
        }
}/*End removeSolicitudAdicion*/

async function getSolicitudesNoaceptadasPorAsociacion(token){
  let tipo_user=null;
  let id_user=null;
  if(token && validarToken(token)){
      let payload=helper.parseJwt(token);
      tipo_user= payload.rol;
      id_user= payload.sub;
      try{
          if(tipo_user!="Pescador" && tipo_user!="Piscicultor"){ 
            throw createError(401,"Usted no tiene autorización");
          }else{                
                    try{
                      const rows = await db.query(
                        `SELECT s.id_solicitud, e.id_estado, e.descripcion as estado, ss.id_sender_solicitud, ss.nombre as enviado_por,
                                concat(u.nombres,' ',u.apellidos) as usuario, u.foto, s.fecha, a.nombre as asociacion
                        FROM solicitudes as s inner join estados_solicitudes as e on s.id_estado_fk=e.id_estado
                                              inner join sender_solicitud as ss on s.id_sender_solicitud=ss.id_sender_solicitud
                                              inner join asociaciones as a on s.nit_asociacion_fk=a.nit
                                              inner join usuarios as u on s.usuarios_id=u.id
                        WHERE s.id_estado_fk=1 and s.id_sender_solicitud=1 and s.usuarios_id=? 
                        `, 
                        [id_user]
                      );                        
                        const data = helper.emptyOrRows(rows);
                        return { data };
                    }catch(err) {
                      throw err;
                    }
              }           
      }catch (error) {          
        throw error;
      } 
  }else{
    throw createError(401,"Usuario no autorizado");
  }
}/*End getSolicitudesNoaceptadasPorAsociacion*/

 /*_----------------------------------aceptarSolicitudAsociacion--------------------------------*/
 async function aceptarSolicitudAsociacion(id_solicitud,token){
  let message = '';
  if(token && validarToken(token)){ 
      const payload=helper.parseJwt(token);                             
      const tipo_user= payload.rol; 
      const id_user=payload.sub;
        try{      
                  if(!(tipo_user==='Piscicultor' || tipo_user==='Pescador')){
                      throw createError(401,"Tipo de usuario no Válido");
                  }
                  if( id_solicitud===undefined)
                  {
                    throw createError(400,"Se requiere el identificador de la solicitud");
                  }
                  const solicitud = await db.query(
                    `SELECT * 
                     FROM solicitudes as s
                     WHERE s.id_solicitud=?
                    `, 
                    [id_solicitud]
                  );                  
                  let idSender = solicitud[0].id_sender_solicitud;
                  let userId = solicitud[0].usuarios_id;

                  /*Primero se debe verificar que este usuario con identificador userId no tenga una solicitud aceptada*/
                  const solicitudesAceptadas = await db.query(
                    `SELECT * 
                     FROM solicitudes as s
                     WHERE s.usuarios_id = ? and id_estado_fk = 2
                    `, 
                    [userId]
                  );
                  console.log("usuario relacionado con la solicitud ",userId)
                  console.log(solicitudesAceptadas)
                  if(solicitudesAceptadas.length > 0){
                    throw createError(401,"El usuario ya se encuentra en una asociación");
                  }
                  /*solicitud enviada por usuario solo puede ser aceptada por el representante*/
                  if(idSender == 1){
                    const rows = await db.query(
                      `SELECT au.usuarios_id as id_representante
                       FROM solicitudes as s 
                       inner join asociaciones_usuarios as au on s.nit_asociacion_fk = au.nit_asociacion_pk_fk
                       WHERE  s.id_solicitud=?
                      `, 
                      [id_solicitud]
                    );  
                    let idRepresentante = rows[0].id_representante;
                    if(idRepresentante != id_user){
                      throw createError(401,"Usted no tiene autorización para actualizar la solicitud"); 
                    }
                  }else{//enviada por asociación - solo puede ser aceptada por el usuario
                    const rows = await db.query(
                      `SELECT * 
                       FROM solicitudes as s
                       WHERE  s.usuarios_id=? and s.id_solicitud=?
                      `, 
                      [id_user,id_solicitud]
                    );  
                    if(rows.length<1){
                      throw createError(401,"Usted no tiene autorización para actualizar la solicitud"); 
                    }  
                  }                               
                  const result = await db.query(
                    `UPDATE solicitudes
                    SET id_estado_fk=?
                    WHERE id_solicitud=?`,
                    [
                      2,       
                      id_solicitud
                    ] 
                  );
            if(result.affectedRows){ 
                message = 'Solicitud actualizada exitosamente';
            }else{
              throw createError(500,"Error actualizando el estado de la solicitud");
            }
            return {message};
        } catch(error){
          throw error;
        }
    }else{
      throw createError(401,"Usted no tiene autorización"); 
 }
}/*End aceptarSolicitudAsociacion*/

 /*_----------------------------------ObtenerTodasGranjasAsociadas--------------------------------*/
 async function ObtenerTodasGranjasAsociadas(nit,token){   
          let rowsGranjas=[];
          if(token && validarToken(token)){ 
                  const payload=helper.parseJwt(token);                             
                  const id_user=payload.sub;
                  try{                
                        rowsGranjas = await db.query(
                          `SELECT   g.*,f.id_foto,f.imagen,
                                    (select count(*) from reseñas r1,granjas g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja) as count_resenas,
                                    (select Concat(u2.nombres,' ',u2.apellidos) FROM  usuarios as u2 left join usuarios_granjas as ug2 on (u2.id = ug2.usuarios_id  and ug2.espropietario=1)  
                                    where   ug2.id_granja_pk_fk=g.id_granja) as propietario, 
                                    (select ug2.esfavorita from usuarios_granjas as ug2 where ug2.id_granja_pk_fk=g.id_granja and ug2.usuarios_id=?) as favorita,
                                    (select avg(r.calificacion) from reseñas as r where id_granja_pk_fk = g.id_granja) as puntuacion,
                                    (select m.nombre from municipios as m inner join granjas as gr on m.id_municipio = gr.id_municipio where gr.id_granja = g.id_granja) as nombre_municipio               
                          FROM solicitudes as s inner join usuarios_granjas as ug on (s.usuarios_id=ug.usuarios_id)
                                                inner join granjas as g on (ug.id_granja_pk_fk=g.id_granja)
                                                left join fotos as f on (f.id_granja_fk = g.id_granja)
                          WHERE s.nit_asociacion_fk=? and s.id_estado_fk=2 and ug.espropietario=1
                          `, 
                          [id_user,nit]
                        );                     
                    } catch(error){
                              throw error;
                    }
            }else{
                   try{                
                        rowsGranjas = await db.query(
                          `SELECT   g.*,f.id_foto,f.imagen,
                                    (select count(*) from reseñas r1,granjas g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja) as count_resenas,
                                    (select Concat(u2.nombres,' ',u2.apellidos) FROM  usuarios as u2 left join usuarios_granjas as ug2 on (u2.id = ug2.usuarios_id  and ug2.espropietario=1)  
                                    where   ug2.id_granja_pk_fk=g.id_granja) as propietario, 
                                    0 as favorita,
                                    (select avg(r.calificacion) from reseñas as r where id_granja_pk_fk = g.id_granja) as puntuacion               
                          FROM solicitudes as s inner join usuarios_granjas as ug on (s.usuarios_id=ug.usuarios_id)
                                                inner join granjas as g on (ug.id_granja_pk_fk=g.id_granja)
                                                left join fotos as f on (f.id_granja_fk = g.id_granja)
                          WHERE s.nit_asociacion_fk=? and s.id_estado_fk=2 and ug.espropietario=1
                          `, 
                          [nit]
                        );                     
                    } catch(error){
                              throw error;
                    }
            }
                let data=[];
                if(rowsGranjas.length<1){                    
                   return {data}
                }
                var arrayfotos= new Array();
                var nuevoRows = new Array();
                var index= rowsGranjas[0].id_granja;
                nuevoRows.push(rowsGranjas[0]);        
                rowsGranjas.forEach((element)=>{           
                  if((index == element.id_granja))
                  { 
                    arrayfotos.push(element.imagen);
                  }else { 
                            index= element.id_granja;
                            nuevoRows[nuevoRows.length-1].fotos=arrayfotos;
                            nuevoRows.push(element);
                            arrayfotos=[];  
                            arrayfotos.push(element.imagen);
                  }
                });
                  nuevoRows[nuevoRows.length-1].fotos=arrayfotos;          
                  data = helper.emptyOrRows(nuevoRows);                      
                  return {
                    data
                  }
}/*End ObtenerTodasGranjasAsociadas*/

/*------------------------------updateParcialAsociacion-------------------------------------------------*/
async function updateParcialAsociacion(nitAsociacion, asociacion, token){
  
        if(token && validarToken(token))
        {
          const payload=helper.parseJwt(token);  
          const id_user=payload.sub;
          const rol = payload.rol;
            if(!(rol==='Piscicultor' || rol==='Pescador')){
              throw createError(401,"Tipo de usuario no Válido");
            }     
          const rows2 = await db.query(
            `select au.*
            from asociaciones_usuarios as au
            where au.usuarios_id = ? and au.nit_asociacion_pk_fk = ? `, 
            [
              id_user,
              nitAsociacion
            ]
          );
          if(rows2.length < 1 ){
            throw createError('401', 'Usuario no autorizado.')
          }
        
          var atributos = Object.keys(asociacion);   
          if(atributos.length!=0)
          {    
            var params = Object.values(asociacion);   
            var query = "update asociaciones set ";
            params.push(nitAsociacion);

            for(var i=0; i < atributos.length; i++) {
              query = query + atributos[i] + '=?,';
            }
            query = query.substring(0, query.length-1);/*eliminar la coma final*/ 
            query = query +' '+'where nit=?'

            const result = await db.query(query,params);
          
            let message = '';
            if (result.affectedRows) {
              message = 'asociacion actualizada exitosamente';
            }else{
              throw createError(500,"No se pudo actualizar el registro de la asociacion");    
            }
            return {message};
          }
          throw createError(400,"No hay parámetros para actualizar");
      }else{
        throw createError(401,"Usuario no autorizado");
      }
}/*End updateParcialAsociacion*/

async function getMiembrosAsociacionPublico(nit){  
          let representante={};
          let data={};
          let miembros = [];
          let asociacion = {};          
          let asocia = {};
          let rows=[];
          let rows2=[];                
            rows = await db.query(
              `SELECT  u.id, concat (u.nombres,' ', u.apellidos) as nombres, u.cedula, u.direccion, u.email, u.celular as telefono, u.foto,
                      (select tu.id_tipo_usuario from tipos_usuarios as tu  where tu.id_tipo_usuario=u.id_tipo_usuario) as id_tipo_usuario,
                      (select tu.nombre_tipo_usuario from tipos_usuarios as tu  where tu.id_tipo_usuario=u.id_tipo_usuario) as tipo_usuario,
                      (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                      (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                      (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                      (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                      (select ae.id_area from areas_experticias as ae  where ae.id_area=u.id_area_experticia) as id_area_experticia,
                      (select ae.nombre from areas_experticias as ae  where ae.id_area=u.id_area_experticia) as area_experticia,
                      u.nombre_negocio,u.fecha_registro,u.fecha_nacimiento,
                      (select d.id_departamento from departamentos d  where d.id_departamento=u.id_departamento) as id_departamento,
                      (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                      (select m.id_municipio from municipios as m  where m.id_municipio=u.id_municipio) as id_municipio,
                      (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                      (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                      (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                      u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.informacion_adicional_direccion
              FROM asociaciones_usuarios as au inner join asociaciones as a on a.nit=au.nit_asociacion_pk_fk
                      inner join usuarios as u on au.usuarios_id=u.id							     
              WHERE au.nit_asociacion_pk_fk=?
              `, 
              [nit]
            );                        
            if(rows.length>0){
                representante=rows[0];
            }                        
              rows2 = await db.query(
              `SELECT  u.id, concat (u.nombres,' ', u.apellidos) as nombres, u.cedula, u.direccion, u.email, u.celular as telefono, u.foto,
                      (select tu.id_tipo_usuario from tipos_usuarios as tu  where tu.id_tipo_usuario=u.id_tipo_usuario) as id_tipo_usuario,
                      (select tu.nombre_tipo_usuario from tipos_usuarios as tu  where tu.id_tipo_usuario=u.id_tipo_usuario) as tipo_usuario,
                      (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                      (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                      (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                      (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                      (select ae.id_area from areas_experticias as ae  where ae.id_area=u.id_area_experticia) as id_area_experticia,
                      (select ae.nombre from areas_experticias as ae  where ae.id_area=u.id_area_experticia) as area_experticia,
                      u.nombre_negocio,u.fecha_registro,u.fecha_nacimiento,
                      (select d.id_departamento from departamentos d  where d.id_departamento=u.id_departamento) as id_departamento,
                      (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                      (select m.id_municipio from municipios as m  where m.id_municipio=u.id_municipio) as id_municipio,
                      (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                      (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                      (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                      u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.informacion_adicional_direccion
                FROM asociaciones as a inner join solicitudes as s on a.nit=s.nit_asociacion_fk
                                      inner join estados_solicitudes as e on s.id_estado_fk=e.id_estado
                                      inner join sender_solicitud as ss on s.id_sender_solicitud=ss.id_sender_solicitud
                                      inner join usuarios as u on u.id=s.usuarios_id
                WHERE s.id_estado_fk=2  and nit_asociacion_fk=?
              `, 
              [nit]
            );
            asocia = await db.query(
            `SELECT DISTINCT a.nombre as nombre_asociacion, a.direccion as direccion_asociacion, a.url_rut, a.foto_camarac
            FROM asociaciones as a inner join solicitudes as s on a.nit=s.nit_asociacion_fk
                                      inner join estados_solicitudes as e on s.id_estado_fk=e.id_estado
                                      inner join sender_solicitud as ss on s.id_sender_solicitud=ss.id_sender_solicitud
                                      inner join usuarios as u on u.id=s.usuarios_id
            WHERE s.id_estado_fk=2  and nit_asociacion_fk=?
              `, 
              [nit]
            );
            if(asocia.length>0){
              asociacion=asocia[0];
            }
            miembros = helper.emptyOrRows(rows2);
            data={representante,miembros,asociacion,};
            return  data;
}

async function getMiembrosAsociacionPrivado(nit,token){  
      let representante={};
      let data={};
      let miembros = [];
      let asociacion = {};          
      let asocia = {};
      let rows=[];
      let rows2=[];
      let id_user=null;
      if(token && validarToken(token))
      {
              const payload=helper.parseJwt(token);  
              id_user=payload.sub;
              rows = await db.query(
              `SELECT  u.id, concat (u.nombres,' ', u.apellidos) as nombres, u.cedula, u.direccion, u.email, u.celular as telefono, u.foto,
                      (select tu.id_tipo_usuario from tipos_usuarios as tu  where tu.id_tipo_usuario=u.id_tipo_usuario) as id_tipo_usuario,
                      (select tu.nombre_tipo_usuario from tipos_usuarios as tu  where tu.id_tipo_usuario=u.id_tipo_usuario) as tipo_usuario,
                      (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                      (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                      (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                      (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                      (select ae.id_area from areas_experticias as ae  where ae.id_area=u.id_area_experticia) as id_area_experticia,
                      (select ae.nombre from areas_experticias as ae  where ae.id_area=u.id_area_experticia) as area_experticia,
                      u.nombre_negocio,u.fecha_registro,u.fecha_nacimiento,
                      (select d.id_departamento from departamentos d  where d.id_departamento=u.id_departamento) as id_departamento,
                      (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                      (select m.id_municipio from municipios as m  where m.id_municipio=u.id_municipio) as id_municipio,
                      (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                      (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                      (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                      u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.informacion_adicional_direccion,
                      u.url_sisben, url_imagen_cedula
              FROM asociaciones_usuarios as au inner join asociaciones as a on a.nit=au.nit_asociacion_pk_fk
                      inner join usuarios as u on au.usuarios_id=u.id							     
              WHERE au.nit_asociacion_pk_fk=? and au.usuarios_id=?
              `, 
              [nit,id_user]
            );                     
                 if(rows.length>0){
                        representante=rows[0];                     
                        rows2 = await db.query(
                        `SELECT  u.id, concat (u.nombres,' ', u.apellidos) as nombres, u.cedula, u.direccion, u.email, u.celular as telefono, u.foto,
                                (select tu.id_tipo_usuario from tipos_usuarios as tu  where tu.id_tipo_usuario=u.id_tipo_usuario) as id_tipo_usuario,
                                (select tu.nombre_tipo_usuario from tipos_usuarios as tu  where tu.id_tipo_usuario=u.id_tipo_usuario) as tipo_usuario,
                                (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                                (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                                (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                                (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                                (select ae.id_area from areas_experticias as ae  where ae.id_area=u.id_area_experticia) as id_area_experticia,
                                (select ae.nombre from areas_experticias as ae  where ae.id_area=u.id_area_experticia) as area_experticia,
                                u.nombre_negocio,u.fecha_registro,u.fecha_nacimiento,
                                (select d.id_departamento from departamentos d  where d.id_departamento=u.id_departamento) as id_departamento,
                                (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                                (select m.id_municipio from municipios as m  where m.id_municipio=u.id_municipio) as id_municipio,
                                (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                                (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                                (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                                u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.informacion_adicional_direccion,
                                u.url_sisben, url_imagen_cedula
                          FROM asociaciones as a inner join solicitudes as s on a.nit=s.nit_asociacion_fk
                                                inner join estados_solicitudes as e on s.id_estado_fk=e.id_estado
                                                inner join sender_solicitud as ss on s.id_sender_solicitud=ss.id_sender_solicitud
                                                inner join usuarios as u on u.id=s.usuarios_id
                          WHERE s.id_estado_fk=2  and nit_asociacion_fk=?
                        `, 
                        [nit]
                      );                    
                      asocia = await db.query(
                      `SELECT a.nombre as nombre_asociacion, a.direccion as direccion_asociacion, a.url_rut, a.foto_camarac
                      FROM asociaciones as a 
                      WHERE a.nit=?
                        `, 
                        [nit]
                      );
                      if(asocia.length>0){
                        asociacion=asocia[0];
                      }
                      miembros = helper.emptyOrRows(rows2);
                      data={representante,miembros,asociacion,};
                      return{
                          data
                      };
                }else{
                      console.log('No es representante legal, sin autorización');
                      throw createError(401,"Usuario no autorizado");
                }          
        }else{
            throw createError(401,"Usuario no autorizado");
        }/*End else*/          
return {data};
}/*getMiembrosAsociacion*/




module.exports = {  
  ObtenerTodasAsociaciones,
  getAsociacionesDepartamento,
  getDetailAsociacion,
  getAsociacionesUser,
  createAsociacion,
  update,
  remove,
  enviarSolicitudAdicion,
  removeSolicitudAdicion,
  getAsociacionesMunicipio,
  getSolicitudesNoaceptadasPorAsociacion,
  aceptarSolicitudAsociacion,
  getAsociacionesMiembros,
  ObtenerTodasGranjasAsociadas,
  updateParcialAsociacion,
  getMiembrosAsociacionPublico,
  getMiembrosAsociacionPrivado
}