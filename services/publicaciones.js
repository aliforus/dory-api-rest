const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

/*_____________getPublicacionesUsuario ________________________________*/
async function getPublicacionesUsuario(id_user){
    try{ 
      const rows = await db.query(
        `SELECT p.id_publicacion, p.cantidad, p.preciokilogramo, 
                (select e.nombre from especies as e where e.id_especie= p.id_especie_fk) as especie,
                (select m.nombre from municipios as m where m.id_municipio = p.id_municipio_fk) as municipio,
                (select concat (u.nombres,' ',u.apellidos) from usuarios as u where u.id= p.usuarios_id) as publicado_por,
                p.titulo, p.descripcion, p.fecha,
                fp.fotop,
                p.id_especie_fk as id_especie
        FROM publicaciones as p left join fotospublicaciones as fp on (fp.id_publicacion_fk = p.id_publicacion)
        WHERE p.usuarios_id=?
        `, 
        [id_user]
      );
      let data;
      if(rows.length<1){
        data = [];
        return {data}
      }
      var arrayfotos= new Array();
      var nuevoRows = new Array();
      var index= rows[0].id_publicacion;
      nuevoRows.push(rows[0]);        
      rows.forEach((element)=>{           
        if((index == element.id_publicacion))
        { 
          if(element.fotop){
                arrayfotos.push(element.fotop);
          }          
        }else { 
                  index= element.id_publicacion;
                  nuevoRows[nuevoRows.length-1].fotos=arrayfotos;
                  nuevoRows.push(element);
                  arrayfotos=[];  
                  if(element.fotop){
                      arrayfotos.push(element.fotop);
                  } 
        }
      });        
      nuevoRows[nuevoRows.length-1].fotos=arrayfotos;          
      data = helper.emptyOrRows(nuevoRows);  
      return {
        data
      }
    }catch(err){
      throw err;
    }
}/*End getPublicacionesUsuario*/

/*_____________getPublicacionesMultiple ________________________________*/
async function getPublicacionesMultiple(page = 1){
      const offset = helper.getOffset(page, config.listPerPage);
      const rows = await db.query(
        `SELECT p.id_publicacion, p.cantidad, p.preciokilogramo, 
                (select e.nombre from especies as e where e.id_especie= p.id_especie_fk) as especie,
                (select m.nombre from municipios as m where m.id_municipio = p.id_municipio_fk) as municipio,
                (select concat (u.nombres,' ',u.apellidos) from usuarios as u where u.id= p.usuarios_id) as publicado_por,
                p.titulo, p.descripcion, p.fecha,
                fp.fotop,
                p.id_especie_fk as id_especie
        FROM publicaciones as p left join fotospublicaciones as fp on (fp.id_publicacion_fk = p.id_publicacion)
        order by p.fecha desc`, 
        []
      );  
        let data=[];
      if(rows.length<1){
         return {data};
      }   
      var fotosN= new Array();
      var publicaciones = new Array();
      var index= rows[0].id_publicacion;
      publicaciones.push(rows[0]);        
      rows.forEach((element)=>{           
        if((index == element.id_publicacion))
        { 
          fotosN.push(element.fotop);
        }else { 
                  index= element.id_publicacion;
                  publicaciones[publicaciones.length-1].fotos=fotosN;
                  publicaciones.push(element);
                  fotosN=[];  
                  fotosN.push(element.fotop);
        }
      });
        publicaciones[publicaciones.length-1].fotos=fotosN;          
      data = helper.emptyOrRows(publicaciones); 
      return {
        data
      }
}/*End getPublicacionesMultiple*/

/*_____________Create Publicación________________________________*/
async function createPublicacion(body,token){  
     
    if(token && validarToken(token)){
          try {                   
                const payload=helper.parseJwt(token);
                const id_user=payload.sub;              
                if(body.cantidad===undefined || 
                   body.preciokilogramo===undefined ||                   
                   body.id_especie===undefined || 
                   body.id_municipio===undefined ||                   
                   body.titulo===undefined || 
                   body.descripcion===undefined 
                  )
                {
                  throw createError(400,"Se requieren todos los parámetros!");
                }
                const currentDate = new Date();    
                const fecha = currentDate.toISOString();
                 const result = await db.query(
                    `INSERT INTO publicaciones (cantidad,preciokilogramo,id_especie_fk,id_municipio_fk,usuarios_id,titulo, descripcion, fecha) VALUES (?,?,?,?,?,?,?,?)`, 
                    [
                      body.cantidad,
                      body.preciokilogramo,                      
                      body.id_especie,
                      body.id_municipio,
                      id_user,
                      body.titulo,
                      body.descripcion,
                      fecha
                    ]
                ); 
                if (result.affectedRows) {              
                    return {
                            message:'Publicación creada exitosamente',
                            insertId:result.insertId
                    };
                }
                   throw createError(500,"Se presentó un problema al registrar la publicación");
          }catch (error) {
                throw error;
          } 
     }else{
          throw createError(401,"Usted no tiene autorización"); 
     }
  }/*End Create*/

  /*____________________________updatePublicacion__________________________*/
  async function updatePublicacion(idpublicacion, body, token){     
    if(token && validarToken(token)){
              const payload=helper.parseJwt(token);  
              const id_user=payload.sub;
        const rows = await db.query(
          `SELECT p.usuarios_id
          FROM publicaciones as p
          WHERE p.usuarios_id=?`, 
          [id_user]
        );
        if(rows.length<1){
          return {message:'Usted no tiene autorización para éste proceso'};
        }   
      try { 
            if(body.cantidad===undefined || 
              body.preciokilogramo===undefined ||                   
              body.id_especie===undefined || 
              body.id_municipio===undefined ||                   
              body.titulo===undefined || 
              body.descripcion===undefined 
             )
            {
              throw createError(400,"Se requieren todos los parámetros!");
            }
            const result = await db.query(
              `UPDATE publicaciones
               SET cantidad=?,
                   preciokilogramo=?,                   
                   id_especie_fk=?,
                   id_municipio_fk=?,
                   usuarios_id=?,
                   titulo=?,
                   descripcion=?
               WHERE id_publicacion=?`,
               [
                body.cantidad,
                body.preciokilogramo,                      
                body.id_especie,
                body.id_municipio,
                id_user,
                body.titulo,
                body.descripcion,
                idpublicacion
               ] 
            );          
            if (result.affectedRows) {              
              return {message:'Publicación Actualizada exitosamente'};
            }
             throw createError(500,"Se presento un problema al actualizar la publicación");
      }catch (error) {           
            throw error;
      } 
    }else{
      throw createError(401,"Usted no tiene autorización"); 
    }
  }/*End updatePublicacion*/
  
   /*_____________removePublicacion ________________________________*/
  async function removePublicacion(idpublicacion,token){
    
    if(token && validarToken(token)){
            const payload=helper.parseJwt(token);  
            const id_user=payload.sub;
            const rows = await db.query(
              `SELECT p.usuarios_id
              FROM publicaciones as p
              WHERE p.usuarios_id=?`, 
              [id_user]
            );
            if(rows.length<1){
              return {message:'Usted no tiene autorización para éste proceso'};
            }
          try {
                await db.query(
                  `DELETE FROM fotospublicaciones WHERE id_publicacion_fk=?`, 
                  [idpublicacion]
                );
                const result = await db.query(
                  `DELETE FROM publicaciones WHERE id_publicacion=?`, 
                  [idpublicacion]
                );       
                if (result.affectedRows) {              
                  return {message:'Publicación eliminado exitosamente'};
                }
                throw createError(500,"Se presento un problema al eliminar la publicación");
           }catch (error) {           
                 throw error;
           } 
    }else{
      throw createError(401,"Usted no tiene autorización"); 
    }
  }/*End removePublicacion*/

   /*_____________updatePhotosPublicacion ________________________________*/
  async function updatePhotosPublicacion(idpublicacion,body,token){  
    var arrayfotos= body.arrayFotos;    
    let tipo_user=null;     
    const conection= await db.newConnection();
    await conection.beginTransaction();
    if(token && validarToken(token)){
        let payload=helper.parseJwt(token);
        tipo_user= payload.rol;
        let userN= payload.sub;         
        try{         
            if(tipo_user!="Piscicultor" && tipo_user!="Pescador" ){ 
              throw createError(401,"Usted no tiene autorización");
            }else{
                if(arrayfotos){ 
                  try{  
                        const publicacionDeUsuario= await db.query(
                        `SELECT *
                        FROM publicaciones as p
                        WHERE p.usuarios_id=? and p.id_publicacion=? `,
                          [userN,idpublicacion]
                        );                       
                        if(publicacionDeUsuario.length<1){
                           throw createError(401,"Usuario no autorizado");
                        }
                        await db.query(
                        `DELETE from fotospublicaciones where id_publicacion_fk=?`,
                          [idpublicacion]
                        );       
                        for(var i=0;i<arrayfotos.length;i++){
                            await db.query(
                              `INSERT INTO fotospublicaciones(fotop,id_publicacion_fk) VALUES (?,?)`,
                              [arrayfotos[i], idpublicacion]
                            );
                        }                         
                  }catch(err) {
                        throw createError(400,err.message);
                  }
                }else{
                  throw createError(400,"Usted no agregó las fotos para actualizarlas"); 
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
  } //* updatePhotosPublicacion */

  /*_____________getDetailPublicacion ________________________________*/
  async function getDetailPublicacion(idpublicacion){
    try{
      let rows=[];
          rows = await db.query(
            `SELECT p.*,
                    (select concat(u.nombres," ",u.apellidos) from usuarios as u where u.id = p.usuarios_id) as usuario,
                    (select u.email from usuarios as u where u.id = p.usuarios_id) as email,
                    (select u.celular from usuarios as u where u.id = p.usuarios_id) as celular,
                    (select tu.nombre_tipo_usuario  
                     from usuarios as u inner join tipos_usuarios as tu on u.id_tipo_usuario=tu.id_tipo_usuario
                     where u.id= p.usuarios_id) as tipo_usuario,
                    (select u.foto from usuarios as u where u.id = p.usuarios_id) as foto_perfil,
                    (select e.nombre from especies as e where e.id_especie= p.id_especie_fk) as especie,
                    (select m.nombre from municipios as m where m.id_municipio = p.id_municipio_fk) as municipio,
                    (select d.nombre_departamento from departamentos as d inner join municipios as m on d.id_departamento=m.id_departamento_fk
                      where m.id_municipio = p.id_municipio_fk) as departamento
            FROM publicaciones as p
            WHERE p.id_publicacion=?
            `, 
            [idpublicacion]
          );         
            if(rows.length < 1){
              throw createError(404, "No se encuentra la publicación con el id "+idpublicacion+".")
            }
          const rowsfotos = await db.query(
            `SELECT fp.id_foto_publicacion, fp.fotop
            FROM  fotospublicaciones as fp
            WHERE fp.id_publicacion_fk =?
            `, 
          [idpublicacion]
          );  
          var arrayfotos= new Array();  
          rowsfotos.forEach((element)=>{ 
              arrayfotos.push(element.fotop);
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
}/*getDetailPublicacion*/


/*------------------------------updateParcialPublicacion-------------------------------------------------*/
async function updateParcialPublicacion(idpublicacion, publicacion, token){
  
  if(token && validarToken(token))
  {
    const payload=helper.parseJwt(token);  
    const id_user=payload.sub;
    const rol = payload.rol;
    if(rol != "Piscicultor" && rol != "Pescador"){
      throw createError('401', "Usted no es un usuario Piscicultor ó Pescador. No esta autorizado para actualizar la publicación.")
    }      
    const rows2 = await db.query(
      `select p.*
       from publicaciones as p
       where p.usuarios_id = ? and p.id_publicacion = ? `, 
      [
        id_user,
        idpublicacion
      ]
    );
    if(rows2.length < 1 ){
      throw createError('401', 'El usuario no es propietario de la publicación y no esta autorizado para actualizarla.')
    }
   /* delete negocio.password; */
    var atributos = Object.keys(publicacion);   
    if(atributos.length!=0)
    {    
      var params = Object.values(publicacion);   
      var query = "update publicaciones set ";
      params.push(idpublicacion);

      for(var i=0; i < atributos.length; i++) {
        query = query + atributos[i] + '=?,';
      }
      query = query.substring(0, query.length-1);/*eliminar la coma final*/ 
      query = query +' '+'where id_publicacion=?'

      const result = await db.query(query,params);
    
      let message = '';
      if (result.affectedRows) {
        message = 'Publicación actualizada exitosamente';
      }else{
        throw createError(500,"No se pudó actualizar el registro del negocio");    
      }
      return {message};
    }
    throw createError(400,"No hay parámetros para actualizar");
}else{
  throw createError(401,"Usuario no autorizado");
}
}/*End updateParcialPublicacion*/


module.exports = {
  getPublicacionesUsuario, 
  getPublicacionesMultiple,
  createPublicacion,
  updatePublicacion,
  removePublicacion,
  updatePhotosPublicacion,
  getDetailPublicacion,
  updateParcialPublicacion
}