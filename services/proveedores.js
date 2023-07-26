 const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

async function ObtenerTodosProductos(){         
               const rows = await db.query(
                `SELECT p.codigo,
                p.nombreProducto,p.precio,p.descripcion,
                p.usuarios_id as id_proveedor,
                f.foto,
                (select concat(u.nombres,'',u.apellidos))as proveedor,
                m.nombre as municipio_proveedor
                FROM productos as p left join usuarios as u on p.usuarios_id = u.id
                                    left join fotosProductos as f on (f.codigo_producto_fk = p.codigo)
                                    left join municipios as m on u.id_municipio = m.id_municipio
                `,               
                []
                );
                let data=[];
                if(rows.length<1){
                  return {data};
                }
                var arrayfotos= new Array();
                var nuevoRows = new Array();
                var index= rows[0].codigo; 
                console.log(' foto?','', rows[0].foto); 
                nuevoRows.push(rows[0]);                  
                rows.forEach((element)=>{ 
                  if((index == element.codigo))
                  { 
                    if(element.foto){                            
                          arrayfotos.push(element.foto);          
                    }          
                  }else {                                                  
                            index= element.codigo;
                            nuevoRows[nuevoRows.length-1].fotos=arrayfotos;
                            nuevoRows.push(element);
                            arrayfotos=[];  
                            if(element.foto){
                                arrayfotos.push(element.foto);
                            }                                              
                  }  
                });        
                nuevoRows[nuevoRows.length-1].fotos=arrayfotos;         
                data = helper.emptyOrRows(nuevoRows); 
                return {
                  data
                }
}/*End ObtenerTodosProductos*/

/*-----------------------------------getProductosUsuarioProveedor---------------------------------------------------*/
async function getProductosUsuarioProveedor(id_user){
   const rows = await db.query(
    `SELECT p.codigo,p.nombreProducto,p.precio, p.descripcion, f.foto
    FROM productos as p left join usuarios as u on p.usuarios_id = u.id
                        left join fotosProductos as f on (f.codigo_producto_fk = p.codigo)
     WHERE p.usuarios_id = ?`, 
    [id_user]
  );
  let data=[];
  if(rows.length<1){
    return {data};
  }
  var arrayfotos= new Array();
  var nuevoRows = new Array();
  var index= rows[0].codigo; 
  console.log(' foto?','', rows[0].foto); 
  nuevoRows.push(rows[0]);                  
  rows.forEach((element)=>{ 
    if((index == element.codigo))
    { 
      if(element.foto){                            
            arrayfotos.push(element.foto);          
      }          
    }else {                                                  
              index= element.codigo;
              nuevoRows[nuevoRows.length-1].fotos=arrayfotos;
              nuevoRows.push(element);
              arrayfotos=[];  
              if(element.foto){
                  arrayfotos.push(element.foto);
              }                                              
    }  
  });        
  nuevoRows[nuevoRows.length-1].fotos=arrayfotos;         
   data = helper.emptyOrRows(nuevoRows);
  return {
    data
  }
}/*------------End getProductosUsuarioProveedor-------------*/

/*-----------------------------------create de productos---------------------------------------------------*/
async function create(producto,token){    
   if(token && validarToken(token)){
       try {
            let payload=helper.parseJwt(token);
            let rol= payload.rol;         
                if (rol=='Proveedor') {                                      
                      const result = await db.query(
                        `INSERT INTO productos(nombreProducto,precio,descripcion,usuarios_id) VALUES (?,?,?,?)`, 
                        [
                          producto.nombreProducto,
                          producto.precio,
                          producto.descripcion,
                          payload.sub
                        ]
                      );                  
                    let message = 'Error al registrar el producto';                  
                    if (result.affectedRows) {
                      message = {  insertId: result.insertId, message:'producto creado exitosamente'};
                    }                    
                    return {message};
                }else {
                  throw createError(401,"tipo de usuario no autorizado");
                }
            } catch (error) {
                if(!(error.statusCode=='401')){
                      throw createError(500,"Un problema registrando el producto del usuario");
                    }else{
                      throw createError(401,"tipo de usuario no autorizado"); 
                    }    
            }         
    } else {
           throw createError(401,"Usted no tiene autorización"); 
        }
}/*--End create productos-------*/

/*-----------------------------------update de productos---------------------------------------------------*/
  async function update(codigo, producto, token){
    if(token && validarToken(token)){
          try{
            let payload=helper.parseJwt(token);
            let rol= payload.rol;
            let id_user= payload.sub;
                  if (rol=='Proveedor') {
                    if(producto.nombreProducto==undefined || producto.precio==undefined || producto.descripcion==undefined ){
                         throw createError(400,"Se requieren todos los parámetros!");
                    }
                    const rows = await db.query(
                      `SELECT *
                      FROM productos as p
                      Where p.codigo=? and usuarios_id=?`, 
                      [codigo,id_user]
                    );

                    if(rows.length<1){
                      throw createError(401,"Usted no esta autorizado para modificar éste producto");
                    }
                      const result = await db.query(
                        `UPDATE productos 
                        SET nombreProducto=?,
                            precio=?,
                            descripcion=?
                        WHERE codigo=?`,
                        [
                          producto.nombreProducto,
                          producto.precio,
                          producto.descripcion,
                          codigo
                        ] 
                      );                    
                      let message = 'Error actualizando producto';                    
                      if (result.affectedRows) {
                        message = 'producto actualizado exitosamente';
                      }                    
                      return {message};
                  }else {
                    throw createError(401,"tipo de usuario no autorizado");
                  }
          } catch (error) {
                        if((error.statusCode!='500')){
                              throw error;  
                        }else{
                            throw createError(500,"Un problema actualizando el producto del usuario");
                        }
             }                   
   } else {
            throw createError(401,"Usted no tiene autorización"); 
        }
  }/*--End update productos----*/

  /*-----------------------------------remove de productos---------------------------------------------------*/  
  async function remove(codigo,token){
    if(token && validarToken(token)){      
        try{
              let payload=helper.parseJwt(token);
              let rol= payload.rol;
              const id_user=payload.sub;
                    if (rol=='Proveedor') {
                      const rows = await db.query(
                        `SELECT p.usuarios_id
                        FROM productos as p
                        WHERE p.usuarios_id=?`, 
                        [id_user]
                      );
                      if(rows.length<1){
                        return {message:'Usted no tiene autorización para éste proceso'};
                      }
                      await db.query(
                        `DELETE FROM fotosProductos WHERE codigo_producto_fk=?`, 
                        [codigo]
                      );
                        const result = await db.query(
                          `DELETE FROM productos WHERE codigo=?`, 
                          [codigo]
                        );                      
                        let message = 'Error borrando el producto de proveedor';
                        if (result.affectedRows) {
                          message = 'producto borrado exitosamente';
                          return {message};
                        }else{
                          throw createError(404,"El recurso que desea eliminar no existe");
                        }                                          
                    }else {
                        throw createError(401,"tipo de usuario no autorizado");
                    }
         } catch (error) {               
                    if((error.statusCode!='500')){
                            throw error;  
                    }else{
                        throw createError(500,"Un problema eliminando el producto del usuario");
                    }
         }
    } else{
           throw createError(401,"Usted no tiene autorización"); 
        }
  }/*--End Remove productos----*/

   /*_____________updatePhotosProducto ________________________________*/
   async function updatePhotosProducto(codigoProducto,body,token){  
    var arrayfotos= body.arrayFotos;    
    let tipo_user=null;     
    const conection= await db.newConnection();
    await conection.beginTransaction();
    if(token && validarToken(token)){
        let payload=helper.parseJwt(token);
        tipo_user= payload.rol;
        let userN= payload.sub;         
        try{
            if(tipo_user!="Proveedor"){ 
              throw createError(401,"Usted no tiene autorización");
            }else{
                if(arrayfotos){ 
                  try{  
                        const productoDeUsuario= await db.query(
                        `SELECT *
                        FROM productos as p
                        WHERE p.usuarios_id=? and p.codigo=? `,
                          [userN,codigoProducto]
                        );
                       
                        if(productoDeUsuario.length<0){
                           throw createError(401,"Usuario no autorizado");
                        }

                        await db.query(
                        `DELETE from fotosProductos where codigo_producto_fk=?`,
                          [codigoProducto]
                        );       
                        for(var i=0;i<arrayfotos.length;i++){
                            await db.query(
                              `INSERT INTO fotosProductos(foto,codigo_producto_fk) VALUES (?,?)`,
                              [arrayfotos[i], codigoProducto]
                            );
                        }                         
                  }catch(err) {
                        throw createError(400,err.message);
                  }
                }else{
                  throw createError(400,"Usted no agrego las fotos del producto para actualizarlas"); 
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
  } //* updatePhotosProducto */

  /*_____________getDetailProducto ________________________________*/
  async function getDetailProducto(codigoProducto, token){
    try{
      let rows=[];  
      rows = await db.query(
        `SELECT p.*,
        (select m.nombre from municipios as m , usuarios as u where m.id_municipio=u.id_municipio and u.id=p.usuarios_id) as municipio_proveedor,
        d.nombre_departamento as departamento_proveedor,
        u.celular as celular_proveedor,
        u.email as email_proveedor,
        concat(u.nombres,' ',u.apellidos) as nombre_proveedor
        FROM productos as p
        inner join usuarios as u on p.usuarios_id = u.id
        left join departamentos as d on u.id_departamento = d.id_departamento
        WHERE p.codigo=?
        `, 
        [codigoProducto]
      ); 
  
      if(rows.length < 1){
        throw createError(404, "No se encuentra el producto con el código "+codigoProducto+".");
      }
      const rowsfotos = await db.query(
        `SELECT fp.id_foto_producto, fp.foto
        FROM  fotosProductos as fp
        WHERE fp.codigo_producto_fk =?
        `, 
      [codigoProducto]
      );  
      var arrayfotos= new Array();  
      rowsfotos.forEach((element)=>{ 
          arrayfotos.push(element.foto);
      });      
      var nuevoRows = new Array();
      nuevoRows.push(rows[0]);
      nuevoRows[nuevoRows.length-1].fotos_producto=arrayfotos; 

      const data = helper.emptyOrRows(nuevoRows);                      
      return {
        data
      }
    } catch(err){        
          console.log(err);
          throw err;
    }
}/*getDetailProducto*/

module.exports = {
  getProductosUsuarioProveedor,
  create,
  update,
  remove,
  ObtenerTodosProductos,
  updatePhotosProducto,
  getDetailProducto
}