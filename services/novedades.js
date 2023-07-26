const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

async function getMultiple(page = 1,token){
      const offset = helper.getOffset(page, config.listPerPage);
      let rows=[];      
      if(token && validarToken(token)){
          const payload=helper.parseJwt(token);        
         rows = await db.query(
        `SELECT distinctrow  n.id_novedad,  n.autor,n.url_foto_autor,n.url_foto_novedad,n.titulo,n.resumen,n.fecha_creacion,n.cant_visitas ,
                (select count(*) from me_gustas m1,novedades n1 where m1.id_novedad_pk_fk=n1.id_novedad and m1.id_novedad_pk_fk= n.id_novedad) as likes ,
                n.url_novedad,n.email_autor,n.canal,n.cuerpo,n.id_tipo_novedad as tipo_novedad,tn.nombre as tipo,
                c.id_categoria,  c.nombre_categoria,c.descripcion_categoria,
                (select count(*) from me_gustas as m2,novedades as n2, usuarios as u where m2.id_novedad_pk_fk=n2.id_novedad and m2.usuarios_id=?  and n2.id_novedad=n.id_novedad and u.id=?) as me_gusta          
         FROM  novedades as n left join me_gustas m on (m.id_novedad_pk_fk=n.id_novedad)
                              left join tipos_novedades as tn on (n.id_tipo_novedad=tn.id_tipo_novedad)
                              left join categorias_novedades as cn on (cn.id_novedad_pk_fk=n.id_novedad)
                              left join categorias as c on (cn.id_categoria_pk_fk=c.id_categoria)
          order by  n.id_novedad
          LIMIT ?,?`, 
        [payload.sub,payload.sub,offset, config.listPerPage]
      );
    }else{
          rows = await db.query(
                  `SELECT distinctrow  n.id_novedad,  n.autor,n.url_foto_autor,n.url_foto_novedad,n.titulo,n.resumen,n.fecha_creacion,n.cant_visitas ,
                                      (select count(*) from me_gustas m1,novedades n1 where m1.id_novedad_pk_fk=n1.id_novedad and m1.id_novedad_pk_fk= n.id_novedad) as likes ,
                                      n.url_novedad,n.email_autor,n.canal,n.cuerpo,n.id_tipo_novedad as tipo_novedad,tn.nombre as tipo,
                                      c.id_categoria,  c.nombre_categoria,c.descripcion_categoria                
                  FROM  novedades as n left join me_gustas m on (m.id_novedad_pk_fk=n.id_novedad)
                                                      left join tipos_novedades as tn on (n.id_tipo_novedad=tn.id_tipo_novedad)
                                                      left join categorias_novedades as cn on (cn.id_novedad_pk_fk=n.id_novedad)
                                                      left join categorias as c on (cn.id_categoria_pk_fk=c.id_categoria)
                  order by  n.id_novedad
                  LIMIT ?,?`, 
          [offset, config.listPerPage]
        );
    }
        var arraycategorias= new Array();
        var nuevoRows = new Array();
        var index= rows[0].id_novedad;
        nuevoRows.push(rows[0]);        
        rows.forEach((element)=>{           
          if((index == element.id_novedad))
          { 
            arraycategorias.push(element.nombre_categoria);
          }else { 
                    index= element.id_novedad;
                    nuevoRows[nuevoRows.length-1].categorias=arraycategorias;/*Arreglo de categorias agregado al final del arreglo de novedades */
                    nuevoRows.push(element);
                    arraycategorias=[];  
                    arraycategorias.push(element.nombre_categoria);
          }
        });
          nuevoRows[nuevoRows.length-1].categorias=arraycategorias;          
        const data = helper.emptyOrRows(nuevoRows);
        const meta = {page};
        return {
          data,
          meta
        }
}/*End getMultiple */


/*--------------------------------CREATE---------------------------------------- */ 
async function create(novedad,token){
            try{
              if(token && validarToken(token)){
                          let payload=helper.parseJwt(token);
                          let tipo_user= payload.rol; 
                          let id_user= payload.sub; 
                        if(tipo_user!='Administrador'){
                                throw createError(401,"Usted no tiene autorización para registrar novedades");
                        }
                      const conection= await db.newConnection(); /*conection of TRANSACTION */
                      await conection.beginTransaction();
                      if(novedad.titulo!= undefined && 
                        novedad.autor!= undefined && 
                        novedad.cuerpo!= undefined && 
                        novedad.fecha_creacion!= undefined && 
                        novedad.resumen!= undefined && 
                        novedad.cant_visitas!= undefined && 
                        novedad.url_foto_autor!= undefined && 
                        novedad.url_foto_novedad!= undefined && 
                        novedad.url_novedad!= undefined && 
                        novedad.canal!= undefined && 
                        novedad.email_autor!= undefined && 
                        novedad.id_tipo_novedad!= undefined 
                      ){
                          try {
                            const result = await db.query(
                              `INSERT INTO novedades( titulo,autor,cuerpo,fecha_creacion,resumen,cant_visitas,url_foto_autor,url_foto_novedad,url_novedad,canal,email_autor,id_tipo_novedad,usuarios_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, 
                              [                                
                                novedad.titulo,
                                novedad.autor,
                                novedad.cuerpo,
                                novedad.fecha_creacion,
                                novedad.resumen,
                                novedad.cant_visitas,
                                novedad.url_foto_autor,
                                novedad.url_foto_novedad,
                                novedad.url_novedad,
                                novedad.canal,
                                novedad.email_autor,
                                novedad.id_tipo_novedad,
                                id_user
                              ]
                            );               
                            let message = 'Error creando novedad';              
                            if (result.affectedRows) {
                              message = {  insertId: result.insertId, message:'novedad creada exitosamente'};
                            }          
                            const rowsId = await db.query(
                              `SELECT MAX(id_novedad) AS id FROM novedades`
                            ); /*ultimo Id_novedad que se creo con autoincremental*/
                        
                            var categorias=novedad.arrayCategorias; 
                            if(categorias){  
                                      for(var i=0;i<categorias.length;i++){
                                          await conection.execute(
                                            `INSERT INTO categorias_novedades(id_categoria_pk_fk,id_novedad_pk_fk) VALUES (?,?)`,
                                            [categorias[i], rowsId[0].id]
                                          );
                                      }
                             }  
                            await conection.commit(); 
                                  conection.release();
                            return {message};
                          } catch (error) {
                            await conection.rollback(); /*Si hay algún error  */ 
                                  conection.release();
                            throw error; 
                          }
                      }
                        throw createError(400,"Un problema con los parámetros ingresados"); 
              }else{ 
                    throw createError(401,"Usted no tiene autorización"); 
              }
          }catch(error){
                  throw error;
          }                      
  }//End Function Create


  /*--------------------------------UPDATE---------------------------------------- */ 

  async function update(id, novedad,token){
              try{
                if(token && validarToken(token)){
                            let payload=helper.parseJwt(token);
                            let tipo_user= payload.rol; 
                            let id_user= payload.sub; 
                          if(tipo_user!='Administrador'){
                                  throw createError(401,"Usted no tiene autorización para actualizar novedades");
                          }
                          const conection= await db.newConnection(); /*conection of TRANSACTION */
                          conection.beginTransaction();
                          if(novedad.titulo!= undefined && 
                            novedad.autor!= undefined && 
                            novedad.cuerpo!= undefined && 
                            novedad.fecha_creacion!= undefined && 
                            novedad.resumen!= undefined && 
                            novedad.cant_visitas!= undefined && 
                            novedad.url_foto_autor!= undefined && 
                            novedad.url_foto_novedad!= undefined && 
                            novedad.url_novedad!= undefined && 
                            novedad.canal!= undefined && 
                            novedad.email_autor!= undefined && 
                            novedad.id_tipo_novedad!= undefined 
                          ){
                              try {
                                const result = await db.query(
                                  `UPDATE novedades 
                                  SET titulo=?,
                                      autor=?,
                                      cuerpo=?,
                                      fecha_creacion=?,
                                      resumen=?,
                                      cant_visitas=?,
                                      url_foto_autor=?,
                                      url_foto_novedad=?,
                                      url_novedad=?,
                                      canal=?,
                                      email_autor=?,
                                      id_tipo_novedad=?,
                                      usuarios_id=? 
                                  WHERE id_novedad=?`,
                                  [
                                    novedad.titulo,
                                    novedad.autor,
                                    novedad.cuerpo,
                                    novedad.fecha_creacion,
                                    novedad.resumen,
                                    novedad.cant_visitas,
                                    novedad.url_foto_autor,
                                    novedad.url_foto_novedad,
                                    novedad.url_novedad,
                                    novedad.canal,
                                    novedad.email_autor,
                                    novedad.id_tipo_novedad,
                                    id_user,
                                    id
                                  ] 
                                );        
                                let message = 'Error actualizando novedad';            
                                if (result.affectedRows) {
                                  message = 'Novedad actualizada exitosamente';
                                }        
                                  /*var categorias=JSON.parse(novedad.arrayCategorias);Pasar el string a vector*/ 
                                var categorias=novedad.arrayCategorias;    
                                await db.query(
                                  `DELETE from categorias_novedades where id_novedad_pk_fk=?`,
                                  [id]
                                );        
                                for(var i=0;i<categorias.length;i++){
                                    await db.query(
                                      `INSERT INTO categorias_novedades(id_categoria_pk_fk,id_novedad_pk_fk) VALUES (?,?)`,
                                      [categorias[i], id]
                                    );
                                }      
                                conection.commit(); 
                                conection.release();
                                return {message};
                              } catch (error) {
                                conection.rollback(); /*Si hay algún error  */ 
                                conection.release();
                                throw error;        
                              }
                          }
                        throw createError(400,"Un problema con los parametros ingresados al actualizar"); 
                  }else{ 
                        throw createError(401,"Usted no tiene autorización"); 
                  }
              }catch(error){
                      throw error;
              }
  }//End Function update

  
/*--------------------------------REMOVE---------------------------------------- */ 

  async function remove(id,token){
            try{
              if(token && validarToken(token)){
                          let payload=helper.parseJwt(token);
                          let tipo_user= payload.rol; 
                          let id_user= payload.sub; 
                        if(tipo_user!='Administrador'){
                                throw createError(401,"Usted no tiene autorización para eliminar novedades");
                        }
                      const conection= await db.newConnection(); /*conection of TRANSACTION */
                      conection.beginTransaction();
                      let message = 'Error borrando novedad';
                      try {
                              await db.query(
                                `DELETE from categorias_novedades where id_novedad_pk_fk=?`,
                                  [id]
                                  );  /*Elimino la relación de la novedad en la tabla categorias_novedades */  
                                  await db.query(
                                    `DELETE from me_gustas where id_novedad_pk_fk=?`,
                                      [id]
                                  );  /*Elimino la relación de la novedad en la tabla me_gustas */                       
                            const result = await db.query(
                              `DELETE FROM novedades WHERE id_novedad=?`, 
                              [id]
                            );                                
                            if (result.affectedRows) {
                              message = 'Novedad borrado exitosamente';
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
  }/*fin remove*/


  /*--------------------------------UPDATE Visitas---------------------------------------- */ 

  async function updateVisitas(id){
          let contador;
          const rows = await db.query(
            `SELECT  *       
            FROM  novedades as n 
            WHERE  n.id_novedad=?
            `, 
            [id]
          );
      if(rows!=null && rows.length>0){
        contador=rows[0].cant_visitas+1;        
          try {
                const result = await db.query(
                  `UPDATE novedades 
                  SET cant_visitas=?
                  WHERE id_novedad=?`,
                  [
                    contador,
                    id
                  ] 
                );              
                let message = 'Error actualizando la visita en la novedad';                  
                if (result.affectedRows) {
                  message = 'Visita de la novedad actualizada exitosamente';
                }              
              return {message};
          } catch (error) {
                return {message:'Error al actualizar la visita de la novedad'};
              }
      }
      throw createError(404,"La Novedad No existe");
}//End Function update visitas


/*--------------------------------AGREGAR--LIKE-------------------------------------- */
async function agregarLikes(id_novedad,token){
        let id_user=null;
        if(token && validarToken(token)){
                let payload=helper.parseJwt(token);
                id_user= payload.sub;
                let message = 'Error ingresando like a novedad';                 
                  if(id_novedad!=undefined && id_user!=undefined && id_novedad!=null && id_user!=null){
                        try {              
                              const result = await db.query(
                                `INSERT INTO me_gustas(id_novedad_pk_fk,usuarios_id) VALUES (?,?)`, 
                                [
                                  id_novedad,
                                  id_user
                                ]
                              );
                  
                              if (result.affectedRows) { 
                                message = 'Like de novedad agregado exitosamente';
                                return {message};
                              }
                              throw createError(400,message);
                        } catch(err) {
                            throw createError(400,err.message);
                              }
                }else{
                        throw createError(400,"Error por parámetros ingresados"); 
                    }
      }
}//End Function Create

/*--------------------------------REMOVE--LIKE-------------------------------------- */ 
async function eliminarLikes(id_novedad,token){
       let id_user=null;
       let message = 'Error al eliminar like a novedad';
       if(token && validarToken(token)){
             let payload=helper.parseJwt(token);
             id_user= payload.sub;                
                if(id_novedad!=undefined && id_user!=undefined && id_novedad!=null && id_user!=null){
                    try {
                          const result= await db.query(
                            `DELETE from me_gustas where id_novedad_pk_fk=? and usuarios_id=?`,
                              [id_novedad,id_user]
                              ); 
                  
                              if (result.affectedRows) {
                                message = 'Like de novedad eliminado exitosamente';
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
}/*fin remove like*/

/*_____________getDetailNovedad ________________________________*/
async function getDetailNovedad(idNovedad){
        try{
          let rows=[];  
          rows = await db.query(
            `SELECT nov.*, (SELECT tn.nombre FROM  tipos_novedades as tn  WHERE   tn.id_tipo_novedad=nov.id_novedad) as tipo_novedad,
                   (SELECT Concat(u2.nombres,' ',u2.apellidos) FROM  usuarios as u2  WHERE   u2.id=nov.usuarios_id) as creador_novedad
            FROM novedades as nov
            WHERE nov.id_novedad=?
            `, 
            [idNovedad]
          );         
            if(rows.length < 1){
              throw createError(404, "No se encuentra la novedad con el id "+idNovedad+".")
            }         
          const data = helper.emptyOrRows(rows);                      
          return {
            data
          }
        } catch(err){        
              console.log(err);
              throw err;
        }
}/*getDetailNovedad*/

/*------------------------------------getNovedadesTipo-----------------------------*/
async function getNovedadesTipo(page = 1, tipo, token){
        const offset = helper.getOffset(page, config.listPerPage);
        let cad= tipo;
        let user=-1;        
          if(token!='null' && validarToken(token)){ 
            const payload=helper.parseJwt(token);
            user=payload.sub;
          }
          const rows = await db.query(
            `SELECT  n.id_novedad, n.titulo, n.autor,n.url_foto_autor,n.url_foto_novedad,n.resumen,n.fecha_creacion,n.cant_visitas ,
                    (select count(*) from me_gustas m1,novedades n1 where m1.id_novedad_pk_fk=n1.id_novedad and m1.id_novedad_pk_fk= n.id_novedad) as likes ,
                    n.url_novedad,n.email_autor,n.canal,n.cuerpo,n.id_tipo_novedad as tipo_novedad,tn.nombre as tipo,
                    c.id_categoria,  c.nombre_categoria,c.descripcion_categoria,
                    (select count(*) from me_gustas as m2 where m2.id_novedad_pk_fk=n.id_novedad and m2.usuarios_id=?) as me_gusta
            FROM  novedades as n left join me_gustas m on (m.id_novedad_pk_fk=n.id_novedad)
                            left join tipos_novedades as tn on (n.id_tipo_novedad=tn.id_tipo_novedad)
                            left join categorias_novedades as cn on (cn.id_novedad_pk_fk=n.id_novedad)
                            left join categorias as c on (cn.id_categoria_pk_fk=c.id_categoria)
            WHERE (n.id_tipo_novedad=tn.id_tipo_novedad) and (tn.nombre like ?)
            order by n.id_novedad
            LIMIT ?,?`, 
            [user,cad, offset, config.listPerPage]
          );          
          if(rows[0] != undefined){

            var arraycategorias= new Array();
            var nuevoRows = new Array();
            var index= rows[0].id_novedad; 
            nuevoRows.push(rows[0]);            
          rows.forEach((element)=>{             
            if((index == element.id_novedad))
            { 
              arraycategorias.push(element.nombre_categoria); 
            }else { 
                      index= element.id_novedad;
                      nuevoRows[nuevoRows.length-1].categorias=arraycategorias;/*Arreglo de categorias agregado al final del arreglo de novedades */
                      nuevoRows.push(element);
                      arraycategorias=[];  
                      arraycategorias.push(element.nombre_categoria);
            }
          });
            nuevoRows[nuevoRows.length-1].categorias=arraycategorias;
          }
          else{ 
            console.log("No hay novedad con esa busqueda");
          }            
          const data = helper.emptyOrRows(nuevoRows);
          const meta = {page};
          return {
            data,
            meta
          }
}/*End getNovedadesTipo*/

/*_______________________________getNovedadesCadena_________________________________*/
async function getNovedadesCadena(page = 1, cadena, token){
      const offset = helper.getOffset(page, config.listPerPage);
      let cad= '%'+cadena+'%';
      let user=-1;
        if(token){
          const payload=helper.parseJwt(token);
          user=payload.sub;
        }
                const rows = await db.query(
                `SELECT distinctrow   n.id_novedad, n.titulo, n.autor,n.url_foto_autor,n.url_foto_novedad,n.resumen,n.fecha_creacion,n.cant_visitas ,
                                        (select count(*) from me_gustas m1 where  m1.id_novedad_pk_fk= n.id_novedad) as likes ,
                                        n.url_novedad,n.email_autor,n.canal,n.cuerpo,n.id_tipo_novedad as tipo_novedad,tn.nombre as tipo,
                                        c.id_categoria,  c.nombre_categoria,c.descripcion_categoria,
                                      (select count(*) from me_gustas as m2 where m2.id_novedad_pk_fk=n.id_novedad and m2.usuarios_id=?) as me_gusta
                FROM  novedades as n left join me_gustas m on (m.id_novedad_pk_fk=n.id_novedad)
                                  left join tipos_novedades as tn on (n.id_tipo_novedad=tn.id_tipo_novedad)
                                  left join categorias_novedades as cn on (cn.id_novedad_pk_fk=n.id_novedad)
                                  left join categorias as c on (cn.id_categoria_pk_fk=c.id_categoria)

                WHERE  n.titulo like ? or n.autor like ? or n.cuerpo like ? or n.resumen like ?
                order by n.id_novedad
                LIMIT ?,?`, 
                  [user,cad, cad, cad, cad, offset, config.listPerPage]
                );            
                if(rows[0] != undefined){
                  var arraycategorias= new Array();
                  var nuevoRows = new Array();
                  var index= rows[0].id_novedad; 
                  nuevoRows.push(rows[0]);              
                rows.forEach((element)=>{               
                  if((index == element.id_novedad))
                  { 
                    arraycategorias.push(element.nombre_categoria); 
                  }else { 
                            index= element.id_novedad;
                            nuevoRows[nuevoRows.length-1].categorias=arraycategorias;/*Arreglo de categorias agregado al final del arreglo de novedades */
                            nuevoRows.push(element);
                            arraycategorias=[];  
                            arraycategorias.push(element.nombre_categoria);
                  }
                });
                  nuevoRows[nuevoRows.length-1].categorias=arraycategorias;
                }
                else{ 
                  console.log("No hay novedad con esa busqueda");
                }              
                const data = helper.emptyOrRows(nuevoRows);
                const meta = {page};
                return {
                  data,
                  meta
                }  
}/*Fin getNovedadesCadena*/

/*------------------------------------getArticulos-----------------------------*/
async function getArticulos(page = 1, cadena,token){
          const offset = helper.getOffset(page, config.listPerPage);
          let cad= '%'+cadena+'%';
          let user=-1;            
          if(token!='null' && validarToken(token)){ 
            const payload=helper.parseJwt(token);
            user=payload.sub;
          }
          const rows = await db.query(
            `SELECT DISTINCT  n.id_novedad,   n.titulo,  n.autor,  n.url_foto_autor,  n.url_foto_novedad,  n.resumen,  n.fecha_creacion,  n.cant_visitas ,
                              (select count(*) from me_gustas m1,novedades n1 where m1.id_novedad_pk_fk=n1.id_novedad and m1.id_novedad_pk_fk= n.id_novedad) as likes ,
                              n.url_novedad,n.email_autor,n.canal,n.cuerpo,n.id_tipo_novedad as tipo_novedad,tn.nombre as tipo,
                              c.id_categoria,  c.nombre_categoria,c.descripcion_categoria,
                              (select count(*) from me_gustas as m2 where m2.id_novedad_pk_fk=n.id_novedad and m2.usuarios_id=?) as me_gusta     
              FROM  novedades as n inner join  tipos_novedades as tn on (n.id_tipo_novedad=tn.id_tipo_novedad and tn.nombre like 'Articulo' )   
                                  left join me_gustas m on (m.id_novedad_pk_fk=n.id_novedad)  
                                  left join categorias_novedades as cn on (cn.id_novedad_pk_fk=n.id_novedad)
                                  inner join categorias as c on (cn.id_categoria_pk_fk=c.id_categoria)
              WHERE n.titulo like ? or n.autor like ? or n.cuerpo like ? or n.resumen like ?
              order by n.id_novedad
              LIMIT ?,?`, 
            [user,cad, cad, cad, cad, offset, config.listPerPage]
          );            
          if(rows[0] != undefined){
            var arraycategorias= new Array();
            var nuevoRows = new Array();
            var index= rows[0].id_novedad; 
            nuevoRows.push(rows[0]);            
          rows.forEach((element)=>{             
            if((index == element.id_novedad))
            { 
              arraycategorias.push(element.nombre_categoria); 
            }else { 
                      index= element.id_novedad;
                      nuevoRows[nuevoRows.length-1].categorias=arraycategorias;/*Arreglo de categorias agregado al final del arreglo de novedades */
                      nuevoRows.push(element);
                      arraycategorias=[];  
                      arraycategorias.push(element.nombre_categoria);
            }
          });
            nuevoRows[nuevoRows.length-1].categorias=arraycategorias;
          }
          else{ 
            console.log("No hay novedad con esa busqueda");
          }            
          const data = helper.emptyOrRows(nuevoRows);
          const meta = {page};
          return {
            data,
            meta
          }
}//fin getArticulos

/*------------------------------------getArticulosColombianos----------------------------*/
async function getArticulosColombianos(page = 1, cadena,token){
          const offset = helper.getOffset(page, config.listPerPage);
          let cad= '%'+cadena+'%';
          let user=-1;
          if(token!='null' && validarToken(token)){ 
            const payload=helper.parseJwt(token);
            user=payload.sub;
          }
          const rows = await db.query(
            `SELECT DISTINCT  n.id_novedad,   n.titulo,  n.autor,  n.url_foto_autor,  n.url_foto_novedad,  n.resumen,  n.fecha_creacion,  n.cant_visitas ,
                              (select count(*) from me_gustas m1,novedades n1 where m1.id_novedad_pk_fk=n1.id_novedad and m1.id_novedad_pk_fk= n.id_novedad) as likes ,
                              n.url_novedad,n.email_autor,n.canal,n.cuerpo,n.id_tipo_novedad as tipo_novedad,tn.nombre as tipo,
                              c.id_categoria,  c.nombre_categoria,c.descripcion_categoria,
                              (select count(*) from me_gustas as m2 where m2.id_novedad_pk_fk=n.id_novedad and m2.usuarios_id=?) as me_gusta      
              FROM  novedades as n inner join  tipos_novedades as tn on (n.id_tipo_novedad=tn.id_tipo_novedad and tn.nombre like 'Articulo-Colombia' )   
                                  left join me_gustas m on (m.id_novedad_pk_fk=n.id_novedad)  
                                  left join categorias_novedades as cn on (cn.id_novedad_pk_fk=n.id_novedad)
                                  inner join categorias as c on (cn.id_categoria_pk_fk=c.id_categoria)
              WHERE n.titulo like ? or n.autor like ? or n.cuerpo like ? or n.resumen like ?
              order by n.id_novedad
              LIMIT ?,?`, 
            [user,cad, cad, cad, cad, offset, config.listPerPage]
          );     
          if(rows[0] != undefined){
            var arraycategorias= new Array();
            var nuevoRows = new Array();
            var index= rows[0].id_novedad; 
            nuevoRows.push(rows[0]);    
          rows.forEach((element)=>{     
            if((index == element.id_novedad))
            { 
              arraycategorias.push(element.nombre_categoria); 
            }else { 
                      index= element.id_novedad;
                      nuevoRows[nuevoRows.length-1].categorias=arraycategorias;/*Arreglo de categorias agregado al final del arreglo de novedades */
                      nuevoRows.push(element);
                      arraycategorias=[];  
                      arraycategorias.push(element.nombre_categoria);
            }
          });
            nuevoRows[nuevoRows.length-1].categorias=arraycategorias;

          }
          else{ 
            console.log("No hay novedad con esa busqueda");
          }    
          const data = helper.emptyOrRows(nuevoRows);
          const meta = {page};
          return {
            data,
            meta
          }
}//fin getArticulosColombianos

/*------------------------------------getRevistas----------------------------*/
async function getRevistas(page = 1, cadena,token){
      const offset = helper.getOffset(page, config.listPerPage);
      let cad= '%'+cadena+'%';
      let user=-1;
            if(token!='null' && validarToken(token)){ 
              const payload=helper.parseJwt(token);
              user=payload.sub;
            }
      const rows = await db.query(
        `SELECT DISTINCT  n.id_novedad,   n.titulo,  n.autor,  n.url_foto_autor,  n.url_foto_novedad,  n.resumen,  n.fecha_creacion,  n.cant_visitas ,
                          (select count(*) from me_gustas m1,novedades n1 where m1.id_novedad_pk_fk=n1.id_novedad and m1.id_novedad_pk_fk= n.id_novedad) as likes ,
                          n.url_novedad,n.email_autor,n.canal,n.cuerpo,n.id_tipo_novedad as tipo_novedad,tn.nombre as tipo,
                          c.id_categoria,  c.nombre_categoria,c.descripcion_categoria,
                          (select count(*) from me_gustas as m2 where m2.id_novedad_pk_fk=n.id_novedad and m2.usuarios_id=?) as me_gusta      
          FROM  novedades as n inner join  tipos_novedades as tn on (n.id_tipo_novedad=tn.id_tipo_novedad and tn.nombre like 'Revista' )   
                              left join me_gustas m on (m.id_novedad_pk_fk=n.id_novedad)  
                              left join categorias_novedades as cn on (cn.id_novedad_pk_fk=n.id_novedad)
                              inner join categorias as c on (cn.id_categoria_pk_fk=c.id_categoria)
          WHERE n.titulo like ? or n.autor like ? or n.cuerpo like ? or n.resumen like ?
          order by n.id_novedad
          LIMIT ?,?`, 
        [user,cad, cad, cad, cad, offset, config.listPerPage]
      );     
      if(rows[0] != undefined){
        var arraycategorias= new Array();
        var nuevoRows = new Array();
        var index= rows[0].id_novedad; 
        nuevoRows.push(rows[0]);    
      rows.forEach((element)=>{      
        if((index == element.id_novedad))
        { 
          arraycategorias.push(element.nombre_categoria); 
        }else { 
                  index= element.id_novedad;
                  nuevoRows[nuevoRows.length-1].categorias=arraycategorias;/*Arreglo de categorias agregado al final del arreglo de novedades */
                  nuevoRows.push(element);
                  arraycategorias=[];  
                  arraycategorias.push(element.nombre_categoria);
        }
      });
        nuevoRows[nuevoRows.length-1].categorias=arraycategorias;
      }
      else{ 
        console.log("No hay novedad con esa busqueda");
      }    
      const data = helper.emptyOrRows(nuevoRows);
      const meta = {page};
      return {
        data,
        meta
      }
}//fin getRevistas

/*------------------------------------getNoticias----------------------------*/
async function getNoticias(page = 1, cadena,token){
        const offset = helper.getOffset(page, config.listPerPage);
        let cad= '%'+cadena+'%';
        let user=-1;
              if(token!='null' && validarToken(token)){ 
                const payload=helper.parseJwt(token);
                user=payload.sub;
              }
        const rows = await db.query(
          `SELECT DISTINCT  n.id_novedad,   n.titulo,  n.autor,  n.url_foto_autor,  n.url_foto_novedad,  n.resumen,  n.fecha_creacion,  n.cant_visitas ,
                            (select count(*) from me_gustas m1,novedades n1 where m1.id_novedad_pk_fk=n1.id_novedad and m1.id_novedad_pk_fk= n.id_novedad) as likes ,
                            n.url_novedad,n.email_autor,n.canal,n.cuerpo,n.id_tipo_novedad as tipo_novedad,tn.nombre as tipo,
                            c.id_categoria,  c.nombre_categoria,c.descripcion_categoria,
                            (select count(*) from me_gustas as m2 where m2.id_novedad_pk_fk=n.id_novedad and m2.usuarios_id=?) as me_gusta      
            FROM  novedades as n inner join  tipos_novedades as tn on (n.id_tipo_novedad=tn.id_tipo_novedad and tn.nombre like 'Noticia' )   
                                left join me_gustas m on (m.id_novedad_pk_fk=n.id_novedad)  
                                left join categorias_novedades as cn on (cn.id_novedad_pk_fk=n.id_novedad)
                                inner join categorias as c on (cn.id_categoria_pk_fk=c.id_categoria)
            WHERE n.titulo like ? or n.autor like ? or n.cuerpo like ? or n.resumen like ? 
            order by n.id_novedad
            LIMIT ?,?`, 
          [user,cad, cad, cad, cad, offset, config.listPerPage]
        );     
        if(rows[0] != undefined){
          var arraycategorias= new Array();
          var nuevoRows = new Array();
          var index= rows[0].id_novedad; 
          nuevoRows.push(rows[0]);    
        rows.forEach((element)=>{      
          if((index == element.id_novedad))
          { 
            arraycategorias.push(element.nombre_categoria); 
          }else { 
                    index= element.id_novedad;
                    nuevoRows[nuevoRows.length-1].categorias=arraycategorias;/*Arreglo de categorias agregado al final del arreglo de novedades */
                    nuevoRows.push(element);
                    arraycategorias=[];  
                    arraycategorias.push(element.nombre_categoria);
          }
        });
          nuevoRows[nuevoRows.length-1].categorias=arraycategorias;
        }
        else{ 
          console.log("No hay novedad con esa busqueda");
        }    
        const data = helper.emptyOrRows(nuevoRows);
        const meta = {page};
        return {
          data,
          meta
        }
}//fin getNoticias

/*------------------------------updateParcialNovedad-------------------------------------------------*/
async function updateParcialNovedad(idNovedad, novedad, token){
      try{
            if(token && validarToken(token))
            {
                  const payload=helper.parseJwt(token);  
                  const id_user=payload.sub;
                  const rol = payload.rol;
                  if(rol!='Administrador'){
                        throw createError(401,"Usted no tiene autorización para actualizar la novedad");
                  }    
                                
                  var atributos = Object.keys(novedad);   
                  if(atributos.length!=0)
                  {    
                    var params = Object.values(novedad);   
                    var query = "update novedades set ";
                    params.push(idNovedad);
                    for(var i=0; i < atributos.length; i++) {
                      query = query + atributos[i] + '=?,';
                    }
                    query = query.substring(0, query.length-1);/*eliminar la coma final*/ 
                    query = query +' '+'where id_novedad=?'
                    const result = await db.query(query,params);                  
                    let message = '';
                    if (result.affectedRows) {
                      message = 'Neovedad actualizada exitosamente';
                    }else{
                      throw createError(500,"No se pudo actualizar la novedad");    
                    }
                    return {message};
                  }
                  throw createError(400,"No hay parámetros para actualizar");
          }else{
            throw createError(401,"Usuario no autorizado");
          }
      }catch(error){
          throw error;
      }
}/*End updateParcialNovedad*/



module.exports = {
  getMultiple,
  create,
  update,
  remove,
  updateVisitas,
  agregarLikes,
  eliminarLikes,
  getDetailNovedad,
  getNovedadesTipo,
  getNovedadesCadena,
  getArticulos,
  getArticulosColombianos,
  getRevistas,
  getNoticias,
  updateParcialNovedad
}