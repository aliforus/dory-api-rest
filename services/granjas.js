const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

/*_____________getGranjaUsuario ________________________________*/
async function getGranjaUsuario(page = 1,id_usuario,token){
        let rows=[];
        const offset = helper.getOffset(page, config.listPerPage);
        let id_user=-1;
      if(token && validarToken(token))
      {      
            const payload=helper.parseJwt(token);  
            id_user=payload.sub;
            rows = await db.query(
                `SELECT g.*, u.cedula, u.nombres, u.apellidos, u.celular, ug.espropietario, 
                        (select ug2.esfavorita from usuarios_granjas as ug2 where ug2.id_granja_pk_fk=g.id_granja and ug2.usuarios_id=?) as esfavorita,
                        (select avg(r.calificacion) from reseñas as r where id_granja_pk_fk = g.id_granja) as puntuacion,f.id_foto,f.imagen,
                        (select count(*) from reseñas as r1,granjas as g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja) as count_resenas,
                        (select m.nombre from municipios as m inner join granjas as gr on m.id_municipio = gr.id_municipio where gr.id_granja = g.id_granja) as nombre_municipio
                FROM granjas as g left join fotos as f on f.id_granja_fk = g.id_granja 
                                  inner join usuarios_granjas as ug on g.id_granja=ug.id_granja_pk_fk and ug.espropietario=1 and ug.usuarios_id=?
                                  inner join usuarios as u on ug.usuarios_id=u.id                                        
                WHERE u.id=?  
                LIMIT ?,?`, 
                [id_user,id_usuario,id_usuario, offset, config.listPerPage]
            );
       }else{        
              rows = await db.query(
                  `SELECT g.*, u.cedula, u.nombres, u.apellidos, u.celular, ug.espropietario, 0 as esfavorita,
                          (select avg(r.calificacion) from reseñas as r where id_granja_pk_fk = g.id_granja) as puntuacion,f.id_foto,f.imagen,
                          (select count(*) from reseñas r1,granjas g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja) as count_resenas,
                          (select m.nombre from municipios as m inner join granjas as gr on m.id_municipio = gr.id_municipio where gr.id_granja = g.id_granja) as nombre_municipio
                  FROM granjas as g left join fotos as f on f.id_granja_fk = g.id_granja 
                                    inner join usuarios_granjas as ug on g.id_granja=ug.id_granja_pk_fk and ug.espropietario=1 and ug.usuarios_id=?
                                    inner join usuarios as u on ug.usuarios_id=u.id                                          
                  WHERE u.id=?  
                  LIMIT ?,?`, 
                  [id_usuario, id_usuario, offset, config.listPerPage]
              );
       }
              let data = [];
              const meta = {page}; 
              if(rows.length < 1){
                return { 
                    data,
                    meta 
                };
              }

              if(rows.length>0){
                rows.forEach(
                  (row)=>{
                    let granja = JSON.parse(JSON.stringify(row));
                    granja.propietario = {};
                    granja.propietario.cedula = granja.cedula;
                    granja.propietario.nombres = granja.nombres;
                    granja.propietario.apellidos = granja.apellidos;
                    granja.propietario.celular = granja.celular;
                    granja.cedula = undefined;
                    granja.nombres = undefined;
                    granja.apellidos = undefined;
                    granja.celular = undefined;
                    data.push(granja)
                  }
                )
              }
              var arrayfotos= new Array();
              var nuevoRows = new Array();  
              var index= rows[0].id_granja;
              nuevoRows.push(rows[0]);        
              rows.forEach((element)=>{           
                if((index == element.id_granja))
                { 
                  arrayfotos.push(element.imagen);
                }else { 
                          index= element.id_granja;
                          nuevoRows[nuevoRows.length-1].fotos=arrayfotos;/*Arreglo de fotos agregado al final del arreglo de granjas */
                          nuevoRows.push(element);
                          arrayfotos=[];  
                          arrayfotos.push(element.imagen);
                }
              });
                nuevoRows[nuevoRows.length-1].fotos=arrayfotos; 
                data = helper.emptyOrRows(nuevoRows);
                
              return {
                data,
                meta
              }
}/*End getGranjaUsuario*/

/*_____________getGranjasTodas ________________________________*/
async function getGranjasTodas(page = 1,token){
      try{
        let rows=[];
        if(token && validarToken(token)){
                let payload=helper.parseJwt(token);
                id_user= payload.sub; 
              const offset = helper.getOffset(page, config.listPerPage);
              rows = await db.query(
                `SELECT DISTINCT   g.id_granja, g.nombre,g.area, g.numero_trabajadores, g.produccion_estimada_mes, g.direccion,g.descripcion,g.latitud,g.longitud, g.corregimiento_vereda, g.informacion_adicional_direccion,f.id_foto,f.imagen,(select count(*) from reseñas r1,granjas g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja) as count_resenas,
                                  (SELECT Concat(u2.nombres,' ',u2.apellidos) FROM  usuarios as u2 left join usuarios_granjas as ug2 on (u2.id = ug2.usuarios_id  and ug2.espropietario=1)  
                                  WHERE   ug2.id_granja_pk_fk=g.id_granja) as propietario, 
                                  (select ug2.esfavorita from usuarios_granjas as ug2 where ug2.id_granja_pk_fk=g.id_granja and ug2.usuarios_id=?) as favorita,
                                  (select avg(r.calificacion) from reseñas as r where id_granja_pk_fk = g.id_granja) as puntuacion,
                                  (select m.nombre from municipios as m  where m.id_municipio=g.id_municipio) as nombre_municipio
                FROM  granjas as g left join fotos as f on (f.id_granja_fk = g.id_granja)
                                  left join usuarios_granjas as ug on (g.id_granja = ug.id_granja_pk_fk) 
                      LIMIT ?,?`, 
                [id_user,offset, config.listPerPage]
              );
        }else{
          const offset = helper.getOffset(page, config.listPerPage);
          rows = await db.query(
            `SELECT DISTINCT   g.id_granja, g.nombre,g.area, g.numero_trabajadores, g.produccion_estimada_mes, g.direccion,g.descripcion,g.latitud,g.longitud, g.corregimiento_vereda, g.informacion_adicional_direccion,f.id_foto,f.imagen,(select count(*) from reseñas r1,granjas g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja) as count_resenas,
                              (SELECT Concat(u2.nombres,' ',u2.apellidos) FROM  usuarios as u2 left join usuarios_granjas as ug2 on (u2.id = ug2.usuarios_id  and ug2.espropietario=1)  
                              WHERE   ug2.id_granja_pk_fk=g.id_granja) as propietario, 
                              0 as favorita,
                              (select avg(r.calificacion) from reseñas as r where id_granja_pk_fk = g.id_granja) as puntuacion,
                              (select m.nombre from municipios as m  where m.id_municipio=g.id_municipio) as nombre_municipio
            FROM  granjas as g left join fotos as f on (f.id_granja_fk = g.id_granja)
                              left join usuarios_granjas as ug on (g.id_granja = ug.id_granja_pk_fk) 
                  LIMIT ?,?`, 
            [offset, config.listPerPage]
          );
        }
              let data=[];         
              if(rows.length<1){
                      return{data};
                }           
              var arrayfotos= new Array();
              var nuevoRows = new Array();
              var index= rows[0].id_granja;
              nuevoRows.push(rows[0]);        
              rows.forEach((element)=>{           
                if((index == element.id_granja))
                { 
                  arrayfotos.push(element.imagen);
                }else { 
                          index= element.id_granja;
                          nuevoRows[nuevoRows.length-1].fotos=arrayfotos;/*Arreglo de fotos agregado al final del arreglo de granjas */
                          nuevoRows.push(element);
                          arrayfotos=[];  
                          arrayfotos.push(element.imagen);
                }
              });
                nuevoRows[nuevoRows.length-1].fotos=arrayfotos;          
               data = helper.emptyOrRows(nuevoRows);
              const meta = {page};      
              return {
                data,
                meta
              }
          } catch(err){        
                console.log(err);
          }
}/*End GetGranjasTodas*/

/*_____________getGranjasMayorCalificacion ________________________________*/
async function getGranjasMayorCalificacion(page = 1,idMunicipio){
  const offset = helper.getOffset(page, config.listPerPage);
  try{
     if(idMunicipio){    
          const rows = await db.query(
            `SELECT distinctrow g.id_granja, g.nombre, g.area, g.numero_trabajadores, g.produccion_estimada_mes, g.direccion, g.latitud, g.longitud, g.descripcion, g.id_departamento, g.id_municipio, g.id_corregimiento, g.id_vereda, g.corregimiento_vereda, g.informacion_adicional_direccion,
                                (select avg(r5.calificacion) from reseñas r5 where g.id_granja=r5.id_granja_pk_fk ) as puntuacion
             FROM granjas as g left join  reseñas as r on (g.id_granja=r.id_granja_pk_fk)
             WHERE g.id_municipio=?
             order by r.calificacion desc
            LIMIT ?,?`, 
            [idMunicipio, offset, config.listPerPage]
          );
          const data = helper.emptyOrRows(rows);
          const meta = {page};
          return {
            data,
            meta
          }
     }else{ 
       throw createError(400,"Se requiere el Id del Municipio");
     }
  }catch{
    throw error;
  }
}/*End getGranjasMayorCalificacion*/

/*_____________getGranjaMayorArea ________________________________*/
async function getGranjasMayorArea(page = 1,idMunicipio){
  const offset = helper.getOffset(page, config.listPerPage);
  try{
     if(idMunicipio){    
          const rows = await db.query(
            `SELECT  g.id_granja, g.nombre, g.area, g.numero_trabajadores, g.produccion_estimada_mes, g.direccion, g.latitud, g.longitud, g.descripcion, g.id_departamento, g.id_municipio, g.id_corregimiento, g.id_vereda, g.corregimiento_vereda, g.informacion_adicional_direccion
            FROM granjas as g 
            WHERE g.id_municipio=?
            order by g.area desc
            LIMIT ?,?`, 
            [idMunicipio, offset, config.listPerPage]
          );
          const data = helper.emptyOrRows(rows);
          const meta = {page};
          return {
            data,
            meta
          }
     }else{ 
       throw createError(400,"Se requiere el Id del Municipio");
     }
  }catch{
    throw error;
  }
}/*End getGranjasMayorArea*/

/*_____________getGranjaMenorArea ________________________________*/
async function getGranjasMenorArea(page = 1,idMunicipio){
  const offset = helper.getOffset(page, config.listPerPage);
  try{
     if(idMunicipio){    
          const rows = await db.query(
            `SELECT  g.id_granja, g.nombre, g.area, g.numero_trabajadores, g.produccion_estimada_mes, g.direccion, g.latitud, g.longitud, g.descripcion, g.id_departamento, g.id_municipio, g.id_corregimiento, g.id_vereda, g.corregimiento_vereda, g.informacion_adicional_direccion
            FROM granjas as g 
            WHERE g.id_municipio=?
            order by g.area asc
            LIMIT ?,?`, 
            [idMunicipio, offset, config.listPerPage]
          );
          const data = helper.emptyOrRows(rows);
          const meta = {page};
          return {
            data,
            meta
          }
     }else{ 
       throw createError(400,"Se requiere el Id del Municipio");
     }
  }catch{
    throw error;
  }
}/*End getGranjasMenorArea*/

/*_____________Create Granja*________________________________*/
async function createGranja(body,token){
      const conection= await db.newConnection(); 
      await conection.beginTransaction();      
    if(token && validarToken(token)){
          try {                   
                const payload=helper.parseJwt(token);
                const id_user=payload.sub;
                const tipo_user=payload.rol;  
                if(tipo_user!="Piscicultor"){ 
                  throw createError(401,"Usted no tiene autorización");
                }else{
                        if(body.nombre_granja===undefined || 
                          body.area===undefined || 
                          body.numero_trabajadores===undefined ||
                          body.produccion_estimada_mes===undefined || 
                          body.direccion===undefined ||
                          body.latitud===undefined ||
                          body.longitud===undefined ||
                          body.descripcion===undefined || 
                          body.id_departamento===undefined || 
                          body.id_municipio===undefined ||
                          body.id_corregimiento===undefined ||
                          body.id_vereda === undefined ||
                          body.corregimiento_vereda === undefined ||
                          body.informacion_adicional_direccion === undefined
                          )
                        {
                          throw createError(400,"Se requieren todos los parámetros!");
                        }
                        const result = await conection.execute(
                            `INSERT INTO granjas (nombre,area,numero_trabajadores, produccion_estimada_mes,direccion,latitud,longitud,descripcion,id_departamento,id_municipio,id_corregimiento,id_vereda,corregimiento_vereda,informacion_adicional_direccion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, 
                            [
                              body.nombre_granja,
                              body.area,
                              body.numero_trabajadores,
                              body.produccion_estimada_mes,
                              body.direccion,
                              body.latitud,
                              body.longitud,
                              body.descripcion,
                              body.id_departamento,
                              body.id_municipio,
                              body.id_corregimiento,
                              body.id_vereda,
                              body.corregimiento_vereda,
                              body.informacion_adicional_direccion
                            ]
                        );               
                        if(body.arrayTiposInfraestructuras != undefined 
                          && body.arrayTiposInfraestructuras != null 
                          && body.arrayTiposInfraestructuras != 'null' 
                          && body.arrayTiposInfraestructuras != '')
                        {                
                            let tiposInfraestructuras = body.arrayTiposInfraestructuras;  
                            for(var i=0;i<tiposInfraestructuras.length;i++){
                                await conection.execute(
                                  `INSERT INTO infraestructuras_granjas(id_granja_pk_fk,id_infraestructura_pk_fk) VALUES (?,?)`,
                                  [result[0]['insertId'], tiposInfraestructuras[i]]
                                );
                            }
                        }                
                        if(body.arrayEspecies != undefined 
                          && body.arrayEspecies != null
                          && body.arrayEspecies != 'null'
                          && body.arrayEspecies != '')
                        {        
                          let especies = body.arrayEspecies;     
                          for(var j=0;j<especies.length;j++){
                              await conection.execute(
                                `INSERT INTO especies_granjas(id_especie_pk_fk,id_granja_pk_fk) VALUES (?,?)`,
                                [especies[j], result[0]['insertId']]
                              );
                          }
                        }  
                        let esfavorita=0; 
                        let espropietario=1;
                        await conection.execute(
                        `INSERT INTO usuarios_granjas (id_granja_pk_fk,usuarios_id,esfavorita,espropietario) VALUES (?,?,?,?)`, 
                        [
                          result[0]['insertId'],
                          id_user,
                          esfavorita,
                          espropietario
                        ]
                        );                 
                        await conection.commit(); 
                        conection.release();                
                        return {
                          message:'Granja creada exitosamente',
                          insertId:result[0]['insertId']
                        };
              }
          }catch (error) {
                await conection.rollback(); 
                conection.release();
                throw error;
          } 
     }else{
          throw createError(401,"Usted no tiene autorización"); 
     }
  }/*End Create*/

  /*__________________________update granja____________________________*/
  async function updateGranja(idGranja, body, token){              
    let message = 'Error actualizando la granja'; 
    const conection= await db.newConnection(); 
    await conection.beginTransaction();
    if(token && validarToken(token)){
      try {                 
            const payload=helper.parseJwt(token);  
            const id_user=payload.sub;
            const tipo_user=payload.rol;
            const rows = await db.query(
              `SELECT  ug.espropietario
              FROM usuarios_granjas as ug 
              WHERE ug.usuarios_id=? and ug.espropietario=1 and ug.id_granja_pk_fk = ?
              `, 
              [id_user, idGranja]
            );            
            if(rows.length<1 && tipo_user!="Piscicultor" && tipo_user!="Administrador"){ 
              throw createError(401,"Usted no tiene autorización");
            }else{
                        if(body.nombre_granja===undefined || 
                          body.area===undefined || 
                          body.numero_trabajadores===undefined ||
                          body.produccion_estimada_mes===undefined || 
                          body.direccion===undefined ||
                          body.descripcion===undefined || 
                          body.id_departamento===undefined || 
                          body.id_municipio===undefined ||
                          body.latitud === undefined ||
                          body.longitud === undefined ||
                          body.id_corregimiento === undefined ||
                          body.id_vereda === undefined ||
                          body.corregimiento_vereda === undefined ||
                          body.informacion_adicional_direccion=== undefined ||
                          idGranja === undefined 
                          )
                        {
                          throw createError(400,"Se requieren todos los parámetros!");
                        } 
                          const result = await conection.execute(
                          `UPDATE granjas 
                          SET nombre=?,
                              area=? ,
                              numero_trabajadores=?,
                              produccion_estimada_mes=?,
                              direccion=? ,
                              latitud=? ,
                              longitud=? ,
                              descripcion=? ,
                              id_departamento=? ,
                              id_municipio=? ,
                              id_corregimiento=? ,
                              id_vereda=?,
                              corregimiento_vereda=?,
                              informacion_adicional_direccion=?
                          WHERE id_granja=?`,
                            [
                              body.nombre_granja,
                              body.area,
                              body.numero_trabajadores,
                              body.produccion_estimada_mes,
                              body.direccion,
                              body.latitud,
                              body.longitud,
                              body.descripcion,
                              body.id_departamento,
                              body.id_municipio,
                              body.id_corregimiento,
                              body.id_vereda,
                              body.corregimiento_vereda,
                              body.informacion_adicional_direccion,
                              idGranja
                            ] 
                          );        
                          if (result[0].affectedRows) {
                            message = 'Granja actualizada exitosamente';
                          }       
                          if(body.arrayTiposInfraestructuras !== undefined 
                            && body.arrayTiposInfraestructuras !== null 
                            && body.arrayTiposInfraestructuras !== 'null' 
                            && body.arrayTiposInfraestructuras !== ''){      
                            await conection.execute(
                              `DELETE FROM infraestructuras_granjas
                              WHERE id_granja_pk_fk=?`,
                              [idGranja]
                            );/*Borrado de infraestructuras granjas para luego agregarlas nuevamente*/
                            let tiposInfraestructuras = body.arrayTiposInfraestructuras;
                            for(var i=0;i<tiposInfraestructuras.length;i++){    
                                await conection.execute(
                                  `INSERT INTO infraestructuras_granjas
                                  (id_granja_pk_fk,id_infraestructura_pk_fk) VALUES (?,?)`,
                                  [idGranja, tiposInfraestructuras[i]]
                                );
                            }
                          }
                          if(body.arrayEspecies !== undefined 
                            && body.arrayEspecies !== null
                            && body.arrayEspecies !== 'null'
                            && body.arrayEspecies !== ''){
                            await conection.execute(
                              `DELETE FROM especies_granjas
                              WHERE id_granja_pk_fk=?`,
                              [idGranja]
                            );/*Borrado de especies de granjas para luego agregarlas nuevamente*/
                              let especies = body.arrayEspecies;
                            for(var j=0;j<especies.length;j++){
                                await conection.execute(
                                  `INSERT INTO especies_granjas 
                                  (id_especie_pk_fk,id_granja_pk_fk) VALUES (?,?)`,
                                  [especies[j], idGranja]
                                );
                            }
                          }              
                        await conection.commit(); 
                        conection.release();
                        return {message};
            }
      }catch (error) {
            await conection.rollback();  
            conection.release();
            throw error;
      } 
    }else{
      throw createError(401,"Usted no tiene autorización"); 
    }
  }/*End Update*/
  
  /*_____________anularGranja ________________________________
  async function anularGranja(id_granja,token){
    let id_user=null; 
    let message = 'Error anulando la granja';
    if(token && validarToken(token)){
          let payload=helper.parseJwt(token);
          id_user= payload.sub;            
             if(id_granja!=undefined && id_user!=undefined && id_granja!=null && id_user!=null){ 
                try {
                    const result = await db.query(
                    `UPDATE granjas SET anulado = 'anulada' WHERE id_granja=?`, 
                    [id_granja]
                    );             
                    if (result.affectedRows) {
                      message = 'granja anulada exitosamente';
                      return {message};
                    }              
                    throw createError(400,message);                            
                } catch(err) {
                     throw createError(400,err.message);
                }
             }else{
                throw createError(400,"Parámetros ingresados erroneamente"); 
             }
    }
  }End anularGranja*/

  /*_____________eliminarGranja ________________________________*/
  async function eliminarGranja(id_granja,token){
    const conection= await db.newConnection(); /*conection of TRANSACTION */
    conection.beginTransaction();
    let id_user=null;     
       try{
            if(token && validarToken(token)){
                  let payload=helper.parseJwt(token);
                  id_user= payload.sub; 
                  const tipo_user=payload.rol;                  
                  const rows = await db.query(
                    `SELECT  ug.espropietario
                    FROM usuarios_granjas as ug 
                    WHERE ug.usuarios_id=? and ug.espropietario=1 and ug.id_granja_pk_fk = ?
                    `, 
                    [id_user,id_granja]
                  );
                  if(rows.length<1 && tipo_user!="Administrador"){
                    throw createError(401,"Usted no tiene autorización");
                  }
                  
                  if(id_granja!=undefined && id_user!=undefined && id_granja!=null && id_user!=null){ 
                      const propiedad = await conection.execute(
                        `SELECT * from usuarios_granjas ug where  ug.usuarios_id=? and ug.espropietario=1 and ug.id_granja_pk_fk=?`,
                        [id_user,id_granja]
                        );
                      if(propiedad.length>0){
                          await conection.execute(
                                `DELETE from especies_granjas where id_granja_pk_fk=?`,
                                [id_granja]
                          );  
                          await conection.execute(
                                `DELETE from usuarios_granjas where id_granja_pk_fk=?`,
                                  [id_granja]
                          );
                            await conection.execute(
                                `DELETE from infraestructuras_granjas where id_granja_pk_fk=?`,
                                  [id_granja]
                          );   
                          await conection.execute(
                            `DELETE from fotos where id_granja_fk=?`,
                              [id_granja]
                          );   
                          
                          await conection.execute(
                            `DELETE from reseñas where id_granja_pk_fk=?`,
                              [id_granja]
                          );  

                          const result = await conection.execute(
                            `DELETE from granjas WHERE id_granja=?`, 
                            [id_granja]
                            );    
                          let message = '';   
                          if (result[0]['affectedRows'] > 0) {
                            message = 'granja eliminada exitosamente';
                          }else{
                            throw createError(400,'Error al eliminar la granja');
                          }
                          conection.commit(); 
                          conection.release();
                          return {message}; 
                      }else{
                        throw createError(404,"Granja no encontrada ó el usuario no es el propietario");
                      }
                  }else{
                        throw createError(402,"Parámetros ingresados erroneamente"); 
                  }
             }else{
              throw createError(401,"Usuario no autorizado"); 
            }
          }catch (error) {
            conection.rollback(); /*Si hay algún error  */ 
            conection.release(); 
            console.log(error);
            throw error;
          }
  }/*End eliminarGranja*/

  /*_____________getGranjaDepartamento ________________________________*/
  async function getGranjasDepartamento(page = 1,idDepartamento){ 
          const offset = helper.getOffset(page, config.listPerPage);
          const rows = await db.query(
            `SELECT distinct  m.id_municipio, m.nombre, m.poblacion,
                            (SELECT count(*) FROM municipios as m1, granjas as g1 WHERE m1.id_municipio=g1.id_municipio and m1.id_municipio=m.id_municipio) as count_granjas
            FROM  municipios as m left join   granjas as g on (m.id_municipio=g.id_municipio)
                                    left join corregimientos as c on (c.id_municipio=g.id_municipio)
                                    left join veredas as v  on  (v.id_municipio=g.id_municipio) 
            WHERE m.id_departamento_fk=?
                    LIMIT ?,?`, 
            [idDepartamento,offset, config.listPerPage]
          );
          const data = helper.emptyOrRows(rows);
          const meta = {page};  
          return {
            data,
            meta
          }
  }/*End getGranjasDepartamento*/

  async function getGranjasMunicipio(page = 1,idMunicipio, token){
     try{
          let rows=[];
          if(token && validarToken(token)){
                  let payload=helper.parseJwt(token);
                  id_user= payload.sub; 
                const offset = helper.getOffset(page, config.listPerPage);
                rows = await db.query(
                  `SELECT DISTINCT   g.id_granja, g.nombre,g.area, g.numero_trabajadores, g.produccion_estimada_mes, g.direccion,g.descripcion,g.latitud,g.longitud, g.corregimiento_vereda, g.informacion_adicional_direccion,f.id_foto,f.imagen,(select count(*) from reseñas r1,granjas g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja) as count_resenas,
                                    (SELECT Concat(u2.nombres,' ',u2.apellidos) FROM  usuarios as u2 left join usuarios_granjas as ug2 on (u2.id = ug2.usuarios_id  and ug2.espropietario=1)  
                                    WHERE   ug2.id_granja_pk_fk=g.id_granja) as propietario, 
                                    (select ug2.esfavorita from usuarios_granjas as ug2 where ug2.id_granja_pk_fk=g.id_granja and ug2.usuarios_id=?) as favorita,
                                    (select avg(r.calificacion) from reseñas as r where id_granja_pk_fk = g.id_granja) as puntuacion,
                                    (select m.nombre from municipios as m inner join granjas as gr on m.id_municipio = gr.id_municipio where gr.id_granja = g.id_granja) as nombre_municipio
                  FROM  granjas as g left join fotos as f on (f.id_granja_fk = g.id_granja)
                                    left join usuarios_granjas as ug on (g.id_granja = ug.id_granja_pk_fk)      
                  WHERE   g.id_municipio=? 
                        LIMIT ?,?`, 
                  [id_user,idMunicipio,offset, config.listPerPage]
                );
          }else{
            const offset = helper.getOffset(page, config.listPerPage);
            rows = await db.query(
              `SELECT DISTINCT   g.id_granja, g.nombre,g.area, g.numero_trabajadores, g.produccion_estimada_mes, g.direccion,g.descripcion,g.latitud,g.longitud, g.corregimiento_vereda, g.informacion_adicional_direccion,f.id_foto,f.imagen,(select count(*) from reseñas r1,granjas g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja) as count_resenas,
                                (SELECT Concat(u2.nombres,' ',u2.apellidos) FROM  usuarios as u2 left join usuarios_granjas as ug2 on (u2.id = ug2.usuarios_id  and ug2.espropietario=1)  
                                WHERE   ug2.id_granja_pk_fk=g.id_granja) as propietario, 
                                0 as favorita,
                                (select avg(r.calificacion) from reseñas as r where id_granja_pk_fk = g.id_granja) as puntuacion,
                                (select m.nombre from municipios as m inner join granjas as gr on m.id_municipio = gr.id_municipio where gr.id_granja = g.id_granja) as nombre_municipio
              FROM  granjas as g left join fotos as f on (f.id_granja_fk = g.id_granja)
                                left join usuarios_granjas as ug on (g.id_granja = ug.id_granja_pk_fk)      
              WHERE   g.id_municipio=? 
                    LIMIT ?,?`, 
              [idMunicipio,offset, config.listPerPage]
            );
          }
                var arrayfotos= new Array();
                var nuevoRows = new Array();
                var index= rows[0].id_granja;
                nuevoRows.push(rows[0]);        
                rows.forEach((element)=>{           
                  if((index == element.id_granja))
                  { 
                    arrayfotos.push(element.imagen);
                  }else { 
                            index= element.id_granja;
                            nuevoRows[nuevoRows.length-1].fotos=arrayfotos;/*Arreglo de fotos agregado al final del arreglo de granjas */
                            nuevoRows.push(element);
                            arrayfotos=[];  
                            arrayfotos.push(element.imagen);
                  }
                });
                  nuevoRows[nuevoRows.length-1].fotos=arrayfotos;          
                const data = helper.emptyOrRows(nuevoRows);
                const meta = {page};      
                return {
                  data,
                  meta
                }
            } catch(err){        
                  console.log(err);
                  throw createError(404,"No hay granjas en el municipio ingresado");
            }
  }/*End getGranjasMunicipio*/

  /*_____________getDetail ________________________________*/
  async function getDetail(page = 1,idGranja, token){
      try{
        let rows=[];  let offset;
         if(token && validarToken(token)){
                  let payload=helper.parseJwt(token);
                  id_user= payload.sub; 
                  offset = helper.getOffset(page, config.listPerPage);  
                  rows = await db.query(
                    `SELECT g.id_granja, g.nombre, g.descripcion, g.area, g.numero_trabajadores, 
                            g.produccion_estimada_mes, g.direccion, g.latitud, g.longitud, 
                            g.id_departamento, g.id_municipio, g.id_corregimiento, g.id_vereda, g.corregimiento_vereda, g.informacion_adicional_direccion,
                          (select count(*) from reseñas r1,granjas g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja and g1.id_granja=g.id_granja) as count_resenas,
                          (select ug2.esfavorita from usuarios_granjas as ug2 where ug2.id_granja_pk_fk=g.id_granja and ug2.usuarios_id=?) as favorita,
                          (select avg(r.calificacion) from reseñas as r where id_granja_pk_fk = ?) as puntuacion,
                          (select m.nombre from municipios as m inner join granjas as gr on m.id_municipio = gr.id_municipio where gr.id_granja = g.id_granja) as nombre_municipio
                    FROM granjas as g
                    WHERE  g.id_granja=?
                          LIMIT ?,?`, 
                    [id_user,idGranja,idGranja,offset, config.listPerPage]
                  );                   
          }else{
                offset = helper.getOffset(page, config.listPerPage);  
                rows = await db.query(
                  `SELECT g.id_granja, g.nombre, g.descripcion, g.area, g.numero_trabajadores, 
                          g.produccion_estimada_mes, g.direccion, g.latitud, g.longitud, 
                          g.id_departamento, g.id_municipio, g.id_corregimiento, g.id_vereda, g.corregimiento_vereda, g.informacion_adicional_direccion,
                        (select count(*) from reseñas r1,granjas g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja and g1.id_granja=g.id_granja) as count_resenas,
                        0 as favorita,
                        (select avg(r.calificacion) from reseñas as r where id_granja_pk_fk = ?) as puntuacion,
                        (select m.nombre from municipios as m inner join granjas as gr on m.id_municipio = gr.id_municipio where gr.id_granja = g.id_granja) as nombre_municipio
                  FROM granjas as g
                  WHERE  g.id_granja=?
                        LIMIT ?,?`, 
                  [idGranja,idGranja,offset, config.listPerPage]
                );
          }
              if(rows.length < 1){
                throw createError(404, "La granja con id "+idGranja+" no existe.")
              }
            const rowsfotos = await db.query(
              `SELECT f.id_foto,f.imagen
              FROM  fotos as f
              WHERE f.id_granja_fk =?
                LIMIT ?,?`, 
            [idGranja,offset, config.listPerPage]
            );  
            var arrayfotos= new Array();  
            rowsfotos.forEach((element)=>{ 
                arrayfotos.push(element.imagen);
            });      
            var nuevoRows = new Array();
            nuevoRows.push(rows[0]);
            nuevoRows[nuevoRows.length-1].fotos=arrayfotos;      
              const rows1 = await db.query(
                  `SELECT concat(u.nombres, " ", u.apellidos) as nombre_completo, u.direccion, u.celular, u.foto,u.id as id_propietario
                    FROM granjas as g, usuarios_granjas as ug, usuarios as u
                    WHERE (u.id=ug.usuarios_id) and
                    (g.id_granja=ug.id_granja_pk_fk) and
                    (ug.espropietario=1) and
                    g.id_granja=? LIMIT ?,?`,
                    [idGranja,offset, config.listPerPage]
              );        
                    var arraypropietarios= new Array();
                    rows1.forEach((element)=>{ 
                              arraypropietarios.push(element);
                              nuevoRows[nuevoRows.length-1].propietarios=arraypropietarios;/*Arreglo de propietarios agregado al final del arreglo de granjas */
                    });  
                const rows2 = await db.query(
                  `select e.nombre, e.id_especie
                  from granjas as g, especies_granjas as eg, especies as e
                  where (e.id_especie=eg.id_especie_pk_fk) and 
                        (eg.id_granja_pk_fk=g.id_granja) and 
                          g.id_granja=? LIMIT ?,?`, 
                  [idGranja,offset, config.listPerPage]
                );  
                var arrayespecies= new Array();  
                rows2.forEach((element)=>{ 
                      arrayespecies.push(element);
                }); 
                nuevoRows[nuevoRows.length-1].especies=arrayespecies;/*Arreglo de especies agregado al final del arreglo de granjas */
                const rows3 = await db.query(
                  `select i.nombre, i.id_infraestructura
                  from granjas as g, infraestructuras_granjas as ig, infraestructuras as i
                  where (i.id_infraestructura=ig.id_infraestructura_pk_fk) and 
                        (ig.id_granja_pk_fk=g.id_granja) and 
                        g.id_granja=? LIMIT ?,?`, 
                  [idGranja,offset, config.listPerPage]
                );  
                var arrayinfraestructuras= new Array();        
                rows3.forEach((element)=>{ 
                      arrayinfraestructuras.push(element);
                });  
                nuevoRows[nuevoRows.length-1].infraestructuras=arrayinfraestructuras;/*Arreglo de especies agregado al final del arreglo de granjas */
                const data = helper.emptyOrRows(nuevoRows);
                const meta = {page};          
            return {
              data,
              meta
            }
      } catch(err){        
            console.log(err);
            throw createError(404,"No se encuentra la granja ingresada");
      }
  }/*getDetail*/

/*_____________updatePhotos ________________________________*/
  async function updatePhotos(idGranja,body,token){
    var arrayfotos= body.arrayFotos;
    let tipo_user=null; 

    const conection= await db.newConnection();
    await conection.beginTransaction();
    if(token && validarToken(token)){
        let payload=helper.parseJwt(token);
        tipo_user= payload.rol;
        let id_user=payload.sub;
        try{
              const rows = await db.query(
                `SELECT  ug.espropietario
                FROM usuarios_granjas as ug 
                WHERE ug.usuarios_id=? and ug.espropietario=1 and ug.id_granja_pk_fk = ?
                `, 
                [id_user, idGranja]
              );              
            if(rows.length<1 && tipo_user!="Piscicultor" && tipo_user!="Administrador"){ 
              throw createError(401,"Usted no tiene autorización");
            }else{
                if(arrayfotos){ 
                  try{
                        await db.query(
                        `DELETE from fotos where id_granja_fk=?`,
                          [idGranja]
                        );       
                        for(var i=0;i<arrayfotos.length;i++){
                            await db.query(
                              `INSERT INTO fotos(imagen,id_granja_fk) VALUES (?,?)`,
                              [arrayfotos[i], idGranja]
                            );
                        }                         
                  }catch(err) {
                        throw createError(400,err.message);
                  }
                }else{
                  throw createError(400,"Usted no agrego las fotos para actualizarlas"); 
                }
          } 
          await conection.commit(); 
          conection.release();
          message = "Fotos actualizadas correctamente";
          return { message };
        }catch (error) {
          await conection.rollback(); 
          conection.release();
          throw error;
      } 
    }else{
      throw createError(401,"Usuario no autorizado");
    }
  } //* updatePhoto */


  async function updateParcial(id, granja, token){
  
    if(token && validarToken(token))
    {
      const payload=helper.parseJwt(token);  
      const id_user=payload.sub;
      const rol = payload.rol;      
      const rows2 = await db.query(
        `select *
         from usuarios_granjas as ug
         where ug.usuarios_id = ? and ug.id_granja_pk_fk = ? and espropietario = ?`, 
        [
          id_user,
          id,
          1
        ]
      );
      if(rows2.length < 1 && rol != "Piscicultor" && rol !="Administrador"){
        throw createError('401', "Usted no esta autorizado para actualizar esta granja.")
      }
      delete granja.password; 
      var atributos = Object.keys(granja);
      if(atributos.length!=0)
      {    
        var params = Object.values(granja);
        var query = "update granjas set ";
        params.push(id);

        for(var i=0; i < atributos.length; i++) {
          query = query + atributos[i] + '=?,';
        }
        query = query.substring(0, query.length-1);/*eliminar la coma final*/ 
        query = query +' '+'where id_granja=?'

        const result = await db.query(query,params);
      
        let message = '';
        if (result.affectedRows) {
          message = 'Granja actualizado exitosamente';
        }else{
          throw createError(500,"No se pudo actualizar el registro de la granja");    
        }
        return {message};
      }
      throw createError(400,"No hay parametros para actualizar");
  }else{
    throw createError(401,"Usuario no autorizado");
  }
}/*End UpdateParcial*/

/*__________________esFavorita______________________________________________________*/
async function esFavorita(id_granja, token){
  
  if(token && validarToken(token))
  {
    const payload=helper.parseJwt(token);  
    const id_user=payload.sub;
    try{
             let message='';
              const rows2 = await db.query(
                `select *
                from usuarios_granjas as ug
                where ug.usuarios_id = ? and ug.id_granja_pk_fk = ?`, 
                [ id_user, id_granja]
              ); 
              if(rows2.length > 0 && rows2 != undefined &&  rows2 != null){/*Usuario relacionado con la granja*/
                  if(rows2[0].esfavorita==1){
                   await db.query(
                   `UPDATE usuarios_granjas as ug SET esfavorita=? where ug.id_granja_pk_fk = ? and ug.usuarios_id = ?`,
                   [0, id_granja, id_user]
                   ); 
                      message='Éxito en remover la granja de favoritas';
                  }
                  else{
                    await db.query(
                      `UPDATE usuarios_granjas as ug SET esfavorita=? where ug.id_granja_pk_fk = ? and ug.usuarios_id = ?`,
                      [1, id_granja, id_user]
                      ); 
                      message='Éxito en agregar la granja a favoritas';
                  }
              }else{      
                    await db.query(
                    `INSERT INTO usuarios_granjas(id_granja_pk_fk,usuarios_id,esfavorita,espropietario) VALUES (?,?,?,?)`,
                    [id_granja,id_user,1,0]
                  ); 
                  message='Éxito en Registrar la granja a favoritas';  
              }              
              return {message}; 
      }catch(err){
        console.log(err)
        throw createError(500,"Error al agregar granja como favorita");
      }
  }else{
        throw createError(401,"Usuario no autorizado");
  }
}/*End esFavorita*/

/*__________________Calificar_____________________ Sin acceso____________
async function calificar(id_granja, token, body){    
  let calificacion= body.calificacion;
  if(token && validarToken(token))
  {
    if(calificacion===undefined || calificacion==='null' || calificacion===null || calificacion==='undefined' || calificacion === ''){ 
      throw createError(400,"Se requiere la calificación a la granja");
    }
    const payload=helper.parseJwt(token);  
    const id_user=payload.sub;
    try{
              const rows2 = await db.query(
                `select *
                from usuarios_granjas as ug
                where ug.usuarios_id = ? and ug.id_granja_pk_fk = ?`, 
                [ id_user, id_granja]
              );                 
              if(rows2.length > 0 && rows2 != undefined &&  rows2 != null){/*Usuario relacionado con la granja/
                   await db.query(
                  `UPDATE usuarios_granjas as ug SET puntuacion=? where ug.id_granja_pk_fk = ? and ug.usuarios_id = ?`,
                  [calificacion, id_granja, id_user]
                ); 
                return{message:"Calificación Agregada a la granja con éxito"};
              }else{      
                    await db.query(
                    `INSERT INTO usuarios_granjas(id_granja_pk_fk,usuarios_id,puntuacion,esfavorita,espropietario) VALUES (?,?,?,?,?)`,
                    [id_granja,id_user,calificacion,null,null]
                  );
                  return{message:"Calificación de usuario agregada a la granja con éxito"};   
              } 
      }catch{
        throw createError(500,"Error al dar puntuación a la granja");
      }
  }else{
        throw createError(401,"Usuario no autorizado");
       }
}End calificar*/

/*__________________getResenasGranja______________________________________________________*/
async function getResenasGranja(idGranja){  
  const rows = await db.query(
    `SELECT distinct r.id_reseña, r.descripcion, r.fecha, r.usuarios_id as id_usuario, r.id_granja_pk_fk as id_granja, r.calificacion, g.nombre as nombre_granja
    FROM reseñas as r, granjas as g, usuarios_granjas as ug
    WHERE r.id_granja_pk_fk=g.id_granja and 
          g.id_granja=ug.id_granja_pk_fk and
          g.id_granja=?
           `, 
    [idGranja]
  );
  const rowspuntajes = await db.query(
    `SELECT distinct   avg(r.calificacion) as puntaje
    FROM  granjas as g, reseñas as r
    WHERE g.id_granja=r.id_granja_pk_fk and
          g.id_granja=?
          `, 
    [idGranja]
  );
  let obj={resenas:rows, puntaje:rowspuntajes[0]}; 
  const data = helper.emptyOrRows(obj);  
  return {
    data
  }   
}/*End getResenasGranja*/

/*__________________misFavoritas______________________________________________________*/
async function misFavoritas(token){  
  if(token && validarToken(token))
  {
        const payload=helper.parseJwt(token);  
        const id_user=payload.sub;
        try{
                const rows = await db.query(
                  `SELECT (select concat(u1.nombres,' ', u1.apellidos) from usuarios as u1 inner join  usuarios_granjas as ug2 on u1.id=ug2.usuarios_id and ug2.id_granja_pk_fk=g.id_granja and ug2.espropietario=1 ) as propietario, g.id_granja, g.nombre, g.area, g.numero_trabajadores, g.produccion_estimada_mes, g.direccion,
                            g.latitud, g.longitud, g.descripcion, g.id_departamento, 
                            (select d1.nombre_departamento from departamentos as d1 where d1.id_departamento=g.id_departamento) as departamento,
                            g.id_municipio,
                            (select m1.nombre from municipios as m1 where m1.id_municipio=g.id_municipio) as municipio,
                            g.id_corregimiento, 
                            (select c1.nombre from corregimientos as c1 where c1.id_corregimiento=g.id_corregimiento) as corregimiento,
                            g.id_vereda, g.corregimiento_vereda,g.informacion_adicional_direccion,ug.usuarios_id, ug.esfavorita as favorita, ug.espropietario, 
                            (select count(*) from reseñas as r where g.id_granja=r.id_granja_pk_fk) as count_resenas,
                            (select avg(r.calificacion) from reseñas as r where id_granja_pk_fk = g.id_granja) as puntuacion
                  FROM granjas as g, usuarios_granjas as ug, usuarios as u
                  WHERE u.id=ug.usuarios_id  and ug.usuarios_id=? and g.id_granja=ug.id_granja_pk_fk  and ug.esfavorita=1`, 
                  [ id_user]
                );  
                let data =[];             
                if(rows.length < 1 && rows != undefined &&  rows != null){ 
                  return{data};
                }                   
                var arrayfotos= new Array();             
                var nuevoRows = new Array();
                for(let i = 0; i < rows.length; i++ ){
                    arrayfotos = [];
                    arrayfotos =  await obtenerFotosGranja(rows[i].id_granja); 
                    let elementClone = { ...rows[i]};
                    elementClone.fotos = arrayfotos;
                    console.log("elementClone--> ",elementClone)
                    nuevoRows.push(elementClone);
                }
                data = helper.emptyOrRows(nuevoRows);      
                return { data } ;                        
          }catch (err){
            throw err
          }             
    }else{
        throw createError(401,"Usuario no autorizado");
    }
}/*End misFavoritas*/

async function obtenerFotosGranja(idGranja) {
  try {
          const rows = await db.query(
            `SELECT f.imagen
            FROM fotos as f
            WHERE f.id_granja_fk=?`,
            [idGranja]
          );
          
          let arrayFotos = [];
          console.log("rows ",)
          rows.forEach(element => {
            arrayFotos.push(element['imagen'])
          });
          
          return arrayFotos;
      } catch {
            throw createError(404, "Fotos de la granja no encontradas");
      }
}/*End obtenerFotosGranja*/


module.exports = {
  getGranjasTodas,
  getGranjasMayorCalificacion,
  getGranjasMayorArea,
  getGranjasMenorArea,
  createGranja,
  updateGranja,
  eliminarGranja,
  getGranjaUsuario,
  getGranjasDepartamento,
  getGranjasMunicipio,
  getDetail,
  updatePhotos,
  updateParcial,
  esFavorita,
  getResenasGranja,
  misFavoritas
}