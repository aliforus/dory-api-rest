const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

/*_____________getPreguntasForos ________________________________*/
async function getPreguntasForos(){
      const rows = await db.query(
        `SELECT p.id_preguntaf as id, p.titulo, p.descripcion, p.fecha, p.usuarios_id as usuarioId, fp.fotopf as foto, 
                (select Concat(u2.nombres,' ',u2.apellidos) from  usuarios as u2  where   u2.id=p.usuarios_id) as nombreUsuario,
                (select u2.foto from  usuarios as u2  where   u2.id=p.usuarios_id) as fotoUsuario,
                (select tu.nombre_tipo_usuario from usuarios as u2 inner join tipos_usuarios as tu on u2.id_tipo_usuario=tu.id_tipo_usuario
                  where u2.id= p.usuarios_id) as tipoUsuario,
                (select count(*) from  respuestasforos as rf left join usuarios as u2 on ( u2.id=rf.usuarios_id) where rf.id_preguntaf=p.id_preguntaf) as countRespuestas
         FROM preguntasforos as p left join fotospreguntas as fp on p.id_preguntaf = fp.id_preguntaf
         order by p.fecha desc
        `, 
        []
      );
            let data = [];
            if(rows.length<1){
              return {data};
            }
              var arrayfotos= new Array();
              var preguntas = new Array();  
              var index= rows[0].id;
              preguntas.push(rows[0]);        
              rows.forEach((element)=>{                      
                      if((index == element.id))
                      { 
                        arrayfotos.push(element.foto);
                      }else { 
                                index= element.id;
                                preguntas[preguntas.length-1].fotos=arrayfotos;
                                preguntas.push(element);
                                arrayfotos=[];  
                                arrayfotos.push(element.foto);
                      }                  
              });
                preguntas[preguntas.length-1].fotos=arrayfotos; 
                preguntas.forEach((element)=>{                      
                  if((element.foto==null))
                  { 
                    element.fotos=[];
                  }              
                });
                data = helper.emptyOrRows(preguntas);                
              return {
                data
              }
}/*End getPreguntasForos*/

/*_____________getPreguntasUsuario ________________________________*/
async function getPreguntasUsuario(idusuario){
          const rows = await db.query(
            `SELECT p.id_preguntaf as id, p.titulo, p.descripcion, p.fecha, p.usuarios_id as usuarioId, fp.fotopf as foto, 
                    (select Concat(u2.nombres,' ',u2.apellidos) from  usuarios as u2  where   u2.id=p.usuarios_id) as nombreUsuario,
                    (select u2.foto from  usuarios as u2  where   u2.id=p.usuarios_id) as fotoUsuario,
                    (select tu.nombre_tipo_usuario from usuarios as u2 inner join tipos_usuarios as tu on u2.id_tipo_usuario=tu.id_tipo_usuario
                      where u2.id= p.usuarios_id) as tipoUsuario,
                    (select count(*) from  respuestasforos as rf left join usuarios as u2 on ( u2.id=rf.usuarios_id) where rf.id_preguntaf=p.id_preguntaf) as countRespuestas
            FROM preguntasforos as p left join fotospreguntas as fp on p.id_preguntaf = fp.id_preguntaf
            WHERE p.usuarios_id=?
            order by p.fecha desc
            `, 
            [idusuario]
          );
          let data = [];
            if(rows.length<1){
              return {data};
            }
          var fotosN= new Array();
          var preguntas = new Array();
          var index= rows[0].id;
          preguntas.push(rows[0]);        
          rows.forEach((element)=>{           
            if((index == element.id))
            { 
              fotosN.push(element.foto);
            }else { 
                      index= element.id;
                      preguntas[preguntas.length-1].fotos=fotosN;
                      preguntas.push(element);
                      fotosN=[];  
                      fotosN.push(element.foto);
            }
          });
          preguntas[preguntas.length-1].fotos=fotosN;                       
          data = helper.emptyOrRows(preguntas);       
          return {
            data
          }
}/*End getPreguntasUsuario*/

/*_____________getRespuestasPregunta ________________________________*/
async function getRespuestasPregunta(idPregunta){
        const rows = await db.query(
          `SELECT r.idrespuestaf as id, r.id_preguntaf as preguntaId, r.respuesta, r.fecha, r.usuarios_id as usuarioId, fr.fotorf as foto,
                  (select Concat(u2.nombres,' ',u2.apellidos) from  usuarios as u2  where   u2.id=r.usuarios_id) as nombreUsuario,
                  (select u2.foto from  usuarios as u2  where   u2.id=r.usuarios_id) as fotoUsuario,
                  (select tu.nombre_tipo_usuario from usuarios as u2 inner join tipos_usuarios as tu on u2.id_tipo_usuario=tu.id_tipo_usuario
                    where u2.id= r.usuarios_id) as tipoUsuario
          FROM respuestasforos as r left join preguntasforos as p on (p.id_preguntaf = r.id_preguntaf)
                                    left join fotosrespuestas as fr on r.idrespuestaf = fr.id_respuestaf
          WHERE r.id_preguntaf=?   
          order by r.fecha desc
          `, 
          [idPregunta]
        ); 
        let data = [];
            if(rows.length<1){
              return {data};
            }
            var arrayfotos= new Array();
            var respuestas = new Array();  
            var index= rows[0].id;
            respuestas.push(rows[0]);        
            rows.forEach((element)=>{                      
                    if((index == element.id))
                    { 
                      arrayfotos.push(element.foto);
                    }else { 
                              index= element.id;
                              respuestas[respuestas.length-1].fotos=arrayfotos;
                              respuestas.push(element);
                              arrayfotos=[];  
                              arrayfotos.push(element.foto);
                    }                  
            });
              respuestas[respuestas.length-1].fotos=arrayfotos; 
              respuestas.forEach((element)=>{                      
                if((element.foto==null))
                { 
                  element.fotos=[];
                }              
              });
              data = helper.emptyOrRows(respuestas);    
            return {
              data
            }
}/*End getRespuestasPregunta */

/*_____________getTodasRespuestas ________________________________*/
async function getTodasRespuestas(){
          const rows = await db.query(
            `SELECT  r.id_preguntaf as preguntaId, p.titulo ,r.idrespuestaf as id, r.respuesta, r.fecha, r.usuarios_id as usuarioId, fr.fotorf as foto,
                    (select Concat(u2.nombres,' ',u2.apellidos) from  usuarios as u2  where   u2.id=r.usuarios_id) as nombreUsuario,
                    (select u2.foto from  usuarios as u2  where   u2.id=r.usuarios_id) as fotoUsuario,
                    (select tu.nombre_tipo_usuario from usuarios as u2 inner join tipos_usuarios as tu on u2.id_tipo_usuario=tu.id_tipo_usuario
                      where u2.id= p.usuarios_id) as tipoUsuario
            FROM respuestasforos as r left join preguntasforos as p on (p.id_preguntaf = r.id_preguntaf)
                                      left join fotosrespuestas as fr on r.idrespuestaf = fr.id_respuestaf
            order by r.fecha desc
            `, 
            []
          ); 
          let data = [];
            if(rows.length<1){
              return {data};
            }
            var arrayfotos= new Array();
            var respuestas = new Array();  
            var index= rows[0].id;
            respuestas.push(rows[0]);        
            rows.forEach((element)=>{                      
                    if((index == element.id))
                    { 
                      arrayfotos.push(element.foto);
                    }else { 
                              index= element.id;
                              respuestas[respuestas.length-1].fotos=arrayfotos;
                              respuestas.push(element);
                              arrayfotos=[];  
                              arrayfotos.push(element.foto);
                    }                  
            });
              respuestas[respuestas.length-1].fotos=arrayfotos; 
              respuestas.forEach((element)=>{                      
                if((element.foto==null))
                { 
                  element.fotos=[];
                }              
              });
              data = helper.emptyOrRows(respuestas);           
      return {
        data
      }
}/*End getTodasRespuestas */

/*_________________registrarRespuesta_________________________________*/
async function registrarRespuesta(body,token){     
          if(body.idpregunta===undefined || body.respuesta===undefined)
          {
            throw createError(400,"Se requiere la respuesta y el ID de de la pregunta");
          } 
        if(token && validarToken(token)){
              try {
                      const payload=helper.parseJwt(token);
                      const id_user=payload.sub; 
                      const currentDate = new Date();    
                      const fecha = currentDate.toISOString();                     
                      const rows = await db.query(
                      `SELECT p.id_preguntaf as preguntaId
                      FROM preguntasforos as p 
                      WHERE p.id_preguntaf=? 
                      `, 
                      [body.idpregunta]
                      );
                    if(rows.length<1){
                      throw createError(404,"La pregunta no existe");
                    }                    
                    const result = await db.query(
                        `INSERT INTO respuestasforos (usuarios_id,id_preguntaf,fecha,respuesta) VALUES (?,?,?,?)`, 
                        [
                          id_user,
                          body.idpregunta,
                          fecha,
                          body.respuesta
                        ]
                    ); 
                    if (result.affectedRows) {              
                        return {
                                message:'Respuesta registrada exitosamente',
                                insertId:result.insertId
                        };
                    }
                      throw createError(500,"Se presento un problema al registrar la respuesta");
              }catch (error) {
                    throw error;
              } 
        }else{
              throw createError(401,"Usted no tiene autorización"); 
        }
}/*End registrarRespuesta*/

/*_________________registrarPregunta_________________________________*/
async function registrarPregunta(body,token){          
    if(token && validarToken(token)){
        try {                   
              const payload=helper.parseJwt(token);
              const id_user=payload.sub;              
              if(body.titulo===undefined || 
                 body.descripcion===undefined 
                )
              {
                throw createError(400,"Se requieren todos los parámetros!");
              }
              const currentDate = new Date();    
              const fecha = currentDate.toISOString();
              const result = await db.query(
                  `INSERT INTO preguntasforos (titulo,descripcion,fecha,usuarios_id) VALUES (?,?,?,?)`, 
                  [
                    body.titulo,
                    body.descripcion,
                    fecha,
                    id_user
                  ]
              ); 
              if (result.affectedRows) {              
                  return {
                          message:'Pregunta registrada exitosamente',
                          insertId:result.insertId
                  };
              }
                 throw createError(500,"Se presento un problema al registrar la pregunta");
        }catch (error) {
              throw error;
        } 
   }else{
        throw createError(401,"Usted no tiene autorización"); 
   }
}/*End registrarPregunta*/

/*____________________________actualizarPregunta__________________________*/
  async function actualizarPregunta(idpregunta, body, token){     
          if(token && validarToken(token)){
                    const payload=helper.parseJwt(token);  
                    const id_user=payload.sub;
                    const rows = await db.query(
                      `SELECT p.usuarios_id
                        FROM preguntasforos as p
                        WHERE p.usuarios_id=? and p.id_preguntaf=?`, 
                        [id_user,idpregunta]
                     );
                    if(rows.length<1){
                      return {message:'Usted no tiene autorización para éste proceso'};
                    }
                    const norespuesta = await db.query(
                      `SELECT count(r.usuarios_id)
                        FROM respuestasforos as r
                        WHERE r.id_preguntaf=?`, 
                        [idpregunta]
                     ); 
                    if(norespuesta.length<1){
                      throw createError(500,"Pregunta de foro no puede ser editada, se han asignado respuestas a la pregunta");
                    }  
               try{ 
                  if(body.titulo===undefined || body.descripcion===undefined)
                   {
                     throw createError(400,"Se requieren todos los parámetros!");
                   }
                  const result = await db.query(
                    `UPDATE preguntasforos 
                     SET titulo=?,
                        descripcion=?
                     WHERE id_preguntaf=?`,
                     [
                      body.titulo,
                      body.descripcion,
                      idpregunta
                    ] 
                    );          
                    if (result.affectedRows) {              
                      return {message:'Pregunta Actualizada exitosamente'};
                    }
                    throw createError(500,"Se presento un problema al actualizar la pregunta del foro");
                }catch (error) {           
                      throw error;
                } 
              }else{
                throw createError(401,"Usted no tiene autorización"); 
              }
  }/*End actualizarPregunta*/

/*____________________________actualizarRespuesta__________________________*/
async function actualizarRespuesta(idrespuesta, body, token){     
          if(token && validarToken(token)){
                    const payload=helper.parseJwt(token);  
                    const id_user=payload.sub;
                    const rows = await db.query(
                      `SELECT r.respuesta
                        FROM respuestasforos as r
                        WHERE r.usuarios_id=? and r.idrespuestaf=?`, 
                        [id_user,idrespuesta]
                    );
                    if(rows.length<1){
                      return {message:'Usted no tiene autorización para éste proceso'};
                    }                 
              try{ 
                  if(body.respuesta===undefined)
                  {
                    throw createError(400,"Se requiere la respuesta!");
                  }
                  const result = await db.query(
                    `UPDATE respuestasforos 
                    SET respuesta=?
                    WHERE idrespuestaf=?`,
                    [
                      body.respuesta,
                      idrespuesta
                    ] 
                    );          
                    if (result.affectedRows) {              
                      return {message:'Respuesta Actualizada exitosamente'};
                    }
                    throw createError(500,"Se presento un problema al actualizar la respuesta a pregunta del foro");
                }catch (error) {           
                      throw error;
                } 
              }else{
                throw createError(401,"Usted no tiene autorización"); 
      }
}/*End actualizarRespuesta*/


 /*_____________eliminarPregunta________________________________*/
  async function eliminarPregunta(idpregunta,token){
    const conection= await db.newConnection();
    await conection.beginTransaction();
    if(token && validarToken(token)){
            const payload=helper.parseJwt(token);  
            const id_user=payload.sub;
            const rows = await db.query(
              `SELECT p.usuarios_id
               FROM preguntasforos as p
               WHERE p.usuarios_id=? and p.id_preguntaf=?`, 
               [id_user, idpregunta]
            );
            if(rows.length<1){
              return {message:'Usted no tiene autorización para éste proceso'};
            }
          try {
               await conection.execute(
                  `DELETE FROM fotospreguntas WHERE id_preguntaf=?`, 
                  [idpregunta]
                );
                /*-------------------------------Eliminación de las fotos de la respuesta-----------------------*/
                const idRespuesta = await db.query(
                  `SELECT DISTINCT r.idrespuestaf
                   FROM respuestasforos as r left join preguntasforos as p on r.id_preguntaf=p.id_preguntaf
                                             left join fotosrespuestas as fr on r.idrespuestaf = fr.id_respuestaf
                   WHERE p.usuarios_id=? and p.id_preguntaf=?`, 
                   [id_user, idpregunta]
                );                
                
                  for(let i=0; i< idRespuesta.length; i++){
                     const idBorrar= idRespuesta[i].idrespuestaf;
                      if (idBorrar){ 
                            await db.query(
                              `DELETE FROM fotosrespuestas WHERE id_respuestaf=?`, 
                              [idBorrar]
                            ); 
                      }               
                   }
                /*---------------------------------------------------------------------*/
                await conection.execute(
                  `DELETE FROM respuestasforos WHERE id_preguntaf=?`, 
                  [idpregunta]
                );
                const result = await conection.execute(
                  `DELETE FROM preguntasforos WHERE id_preguntaf=?`, 
                  [idpregunta]
                );
                let message = '';   
                 if (result[0]['affectedRows'] > 0)
                  {
                       message = 'Pregunta de foro eliminada exitosamente';
                   }else{
                        throw createError(500,'Se presento un problema al eliminar la pregunta del foro');
                   }                                  
                await conection.commit(); 
                conection.release();                
                return { message };
           }catch (error) {           
                  await conection.rollback(); 
                  conection.release();
                  throw error;
           }         
    }else{
      throw createError(401,"Usted no tiene autorización"); 
    }
  }/*End eliminarPregunta*/

 /*_____________eliminarRespuesta________________________________*/
 async function eliminarRespuesta(idrespuesta,token){
          const conection= await db.newConnection();
          await conection.beginTransaction();
          if(token && validarToken(token)){
                  const payload=helper.parseJwt(token);  
                  const id_user=payload.sub;
                  const rows = await db.query(
                    `SELECT r.usuarios_id
                    FROM respuestasforos as r
                    WHERE r.usuarios_id=? and r.idrespuestaf=?`, 
                    [id_user, idrespuesta]
                  );
                  if(rows.length<1){
                    return {message:'Usted no tiene autorización para éste proceso'};
                  }
                try {  
                          await conection.execute(
                            `DELETE FROM fotosrespuestas WHERE id_respuestaf=?`, 
                            [idrespuesta]
                          );                  
                          const result = await conection.execute(
                            `DELETE FROM respuestasforos WHERE idrespuestaf=? and usuarios_id=?`, 
                            [idrespuesta, id_user]
                          );
                          let message = '';   
                          if (result[0]['affectedRows'] > 0)
                          {
                                message = 'Respuesta de foro eliminada exitosamente';
                            }else{
                                throw createError(500,'Se presento un problema al eliminar la respuesta del foro');
                            }                                  
                          await conection.commit(); 
                          conection.release();                
                          return { message };  
                      }catch (error) {   
                          await conection.rollback(); 
                          conection.release();
                          throw error;
                      }         
          }else{
            throw createError(401,"Usted no tiene autorización"); 
          }
}/*End eliminarRespuesta*/



     /*_____________actualizarFotosPregunta ________________________________*/
  async function actualizarFotosPregunta(idpregunta,body,token){ 
     if(body.arrayFotos.length>5){
         throw createError(400,"Capacidad de almacenamiento sobrepasado, cinco es la cantidad máxima");
     }
    var arrayfotos= body.arrayFotos; 
    const conection= await db.newConnection();
    await conection.beginTransaction();
    if(token && validarToken(token)){
        let payload=helper.parseJwt(token);        
        let userN= payload.sub;         
        try{            
                if(arrayfotos){ 
                  try{  
                        const preguntaDeUsuario= await db.query(
                        `SELECT *
                        FROM preguntasforos as p
                        WHERE p.usuarios_id=? and p.id_preguntaf=? `,
                          [userN,idpregunta]
                        );
                       
                        if(preguntaDeUsuario.length<0){
                           throw createError(401,"Usuario no autorizado");
                        }

                        await db.query(
                        `DELETE from fotospreguntas where id_preguntaf=?`,
                          [idpregunta]
                        );       
                        for(var i=0;i<arrayfotos.length;i++){
                            await db.query(
                              `INSERT INTO fotospreguntas(fotopf,id_preguntaf) VALUES (?,?)`,
                              [arrayfotos[i], idpregunta]
                            );
                        }                         
                  }catch(err) {
                        throw createError(400,err.message);
                  }
                }else{
                  throw createError(400,"Usted no agrego las fotos para actualizarlas"); 
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
  }/* End actualizarFotosPregunta */

 /*_____________obtenerDetallePregunta ________________________________ */    
 async function obtenerDetallePregunta(idpregunta){
          try{
                let rows=[];  
                rows = await db.query(
                  `SELECT p.id_preguntaf as id, p.titulo, p.descripcion, p.fecha, p.usuarios_id as usuarioId,
                          (select Concat(u2.nombres,' ',u2.apellidos) from  usuarios as u2  where   u2.id=p.usuarios_id) as nombreUsuario,
                          (select u2.foto from  usuarios as u2  where   u2.id=p.usuarios_id) as fotoUsuario,
                          (select u2.email from  usuarios as u2  where   u2.id=p.usuarios_id) as email,
                          (select tu.nombre_tipo_usuario from usuarios as u2 inner join tipos_usuarios as tu on u2.id_tipo_usuario=tu.id_tipo_usuario
                            where u2.id= p.usuarios_id) as tipoUsuario,
                          (select count(*) from  respuestasforos as rf left join usuarios as u2 on ( u2.id=rf.usuarios_id) where rf.id_preguntaf=p.id_preguntaf) as countRespuestas
                  FROM preguntasforos as p
                  WHERE p.id_preguntaf=?
                  `, 
                  [idpregunta]
                );   
                  if(rows.length < 1){
                    throw createError(404, "No se encuentra la pregunta con el id "+idpregunta+".");
                  }
                const rowsfotos = await db.query(
                  `SELECT f.idfotopf as id_foto, f.fotopf as foto
                  FROM  fotospreguntas as f
                  WHERE f.id_preguntaf=?
                  `, 
                [idpregunta]
                );  
                var arrayfotos= new Array();  
                rowsfotos.forEach((element)=>{ 
                    arrayfotos.push(element.foto);
                });      
                var nuevoRows = new Array();
                nuevoRows.push(rows[0]);
                nuevoRows[nuevoRows.length-1].fotos=arrayfotos; 
                const data = helper.emptyOrRows(nuevoRows);                      
                return {
                  data
                }
          } catch(err){        
                console.log(err);
                throw err;
          }
}/*obtenerDetallePregunta*/


/*------------------------------updateParcialRespuesta-------------------------------------------------*/
async function updateParcialRespuesta(idrespuesta, respuesta, token){

          if(token && validarToken(token))
          {
                const payload=helper.parseJwt(token);  
                const id_user=payload.sub;                     
                const rows2 = await db.query(
                  `SELECT r.idrespuestaf as id, r.usuarios_id as id_usuario, r.id_preguntaf as id_pregunta, r.fecha, r.respuesta, r.foto
                   FROM respuestasforos as r
                   WHERE r.usuarios_id = ? and r.idrespuestaf = ? `, 
                  [
                    id_user,
                    idrespuesta
                  ]
                );
                if(rows2.length < 1 ){
                  throw createError('401', 'Usuario no autorizado.')
                }
                var atributos = Object.keys(respuesta);   
                if(atributos.length!=0)
                {    
                  var params = Object.values(respuesta);   
                  var query = "update respuestasforos set ";
                  params.push(idrespuesta);
                  for(var i=0; i < atributos.length; i++) {
                    query = query + atributos[i] + '=?,';
                  }
                  query = query.substring(0, query.length-1);
                  query = query +' '+'where idrespuestaf=?'
                  const result = await db.query(query,params);                
                  let message = '';
                  if (result.affectedRows) {
                    message = 'Respuesta actualizada exitosamente';
                  }else{
                    throw createError(500,"Actualización de respuesta fallida");    
                  }
                  return {message};
                }
                throw createError(400,"No hay parámetros para actualizar");
          }else{
             throw createError(401,"Usuario no autorizado");
          }
}/*End updateParcialRespuesta*/

/*_____________actualizarFotosRespuesta ________________________________*/
async function actualizarFotosRespuesta(idrespuesta,body,token){  
  var arrayfotos= body.arrayFotos;    
  const conection= await db.newConnection();
  await conection.beginTransaction();
  if(token && validarToken(token)){
      let payload=helper.parseJwt(token);
      tipo_user= payload.rol;
      let userN= payload.sub;         
      try{         
            if(arrayfotos){ 
                try{  
                      const respuestasDeUsuario= await db.query(
                      `SELECT *
                      FROM respuestasforos as r
                      WHERE r.usuarios_id=? and r.idrespuestaf=? `,
                        [userN,idrespuesta]
                      );                       
                      if(respuestasDeUsuario.length<1){
                         throw createError(401,"Usuario no autorizado");
                      }
                      await db.query(
                      `DELETE from fotosrespuestas where id_respuestaf=?`,
                        [idrespuesta]
                      );       
                      for(var i=0;i<arrayfotos.length;i++){
                          await db.query(
                            `INSERT INTO fotosrespuestas(fotorf,id_respuestaf) VALUES (?,?)`,
                            [arrayfotos[i], idrespuesta]
                          );
                      }                         
                }catch(err) {
                      throw createError(400,err.message);
                }
              }else{
                throw createError(400,"Usted no agregó las fotos para actualizarlas"); 
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
} //* actualizarFotosRespuesta */

module.exports = {
  getPreguntasForos,
  getPreguntasUsuario,
  getRespuestasPregunta,
  getTodasRespuestas,
  registrarRespuesta,
  registrarPregunta,
  actualizarPregunta,
  actualizarRespuesta,
  eliminarPregunta,
  eliminarRespuesta,
  actualizarFotosPregunta,
  obtenerDetallePregunta,
  updateParcialRespuesta,
  actualizarFotosRespuesta
 }
