const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');
const {validarToken} = require ('../middelware/auth');

/*_____________________ getintegrantes______________________________________________*/
async function getintegrantes(page = 1){
        const offset = helper.getOffset(page, config.listPerPage);
        const rows = await db.query(
          `SELECT i.*,e.url_enlace
           FROM integrantes as i left join enlaces as e on (e.id_integrante = i.id) 
           LIMIT ?,?`, 
          [offset, config.listPerPage]
        );
        let data=[];
                if(rows.length<1){
                  return {data};
                }
        var arrayenlaces= new Array();
        var nuevoRows = new Array();  
        var index= rows[0].id;
        nuevoRows.push(rows[0]);        
        rows.forEach((element)=>{           
          if((index == element.id))
          { 
            arrayenlaces.push(element.url_enlace);
          }else { 
                    index= element.id;
                    nuevoRows[nuevoRows.length-1].arrayEnlaces=arrayenlaces;/*Arreglo de fotos agregado al final del arreglo de granjas */
                    nuevoRows.push(element);
                    arrayenlaces=[];  
                    arrayenlaces.push(element.url_enlace);
          }
        });
          nuevoRows[nuevoRows.length-1].arrayEnlaces=arrayenlaces; 
          data = helper.emptyOrRows(nuevoRows);
        const meta = {page};
        return {
          data,
          meta
        } 
}/*End getintegrantes*/

/*_____________________ registrarintegrantes______________________________________________*/
async function registrarintegrantes(integrantes,token){  
        try{
                if(token && validarToken(token)){
                     let payload=helper.parseJwt(token);
                     let tipo_user= payload.rol; 
                      if(tipo_user!='Administrador'){
                              throw createError(401,"Usted no tiene autorización para registrar la información de los integrantes");
                      }
                      const conection= await db.newConnection(); /*conection of TRANSACTION */
                      await conection.beginTransaction();
                      if(integrantes.nombres === undefined || 
                        integrantes.apellidos === undefined ||
                        integrantes.descripcion === undefined ||
                        integrantes.imagen === undefined ||
                        integrantes.fecha_nacimiento === undefined ||
                        integrantes.cargo === undefined ||
                        integrantes.municipio === undefined ||
                        integrantes.departamento=== undefined ||
                        integrantes.pais === undefined 
                        ){
                              throw createError(400,"Debe enviar todos los datos requeridos para el registro de la información de integrantes");
                        }
                      try{
                            const result = await db.query(
                              `INSERT INTO integrantes(nombres,apellidos,descripcion,imagen, fecha_nacimiento,cargo,municipio,departamento,pais) VALUES (?,?,?,?,?,?,?,?,?)`, 
                              [
                                integrantes.nombres,
                                integrantes.apellidos, 
                                integrantes.descripcion,
                                integrantes.imagen,
                                integrantes.fecha_nacimiento,
                                integrantes.cargo,
                                integrantes.municipio,
                                integrantes.departamento,
                                integrantes.pais
                              ]
                            );  
                            let message = 'Error registrando la información del integrante';  
                            if (result.affectedRows) {
                              message = 'integrante registrado exitosamente';
                            }
                            const rowsId = await db.query(
                              `SELECT MAX(id) as id FROM integrantes`
                            ); /*ultimo Id_integrante que se creo con autoincremental*/
                        
                            /*var enlaces2=JSON.parse(integrantes.arrayEnlaces);Pasar el string a vector*/    
                            var enlaces=integrantes.arrayEnlaces; 
                                for(var i=0;i<enlaces.length;i++){
                                    await db.query(
                                      `INSERT INTO enlaces(url_enlace,id_integrante) VALUES (?,?)`,
                                      [enlaces[i], rowsId[0].id]
                                    );
                                }
                                await conection.commit(); 
                                      conection.release();
                                return {message};
                      }catch(err){
                            await conection.rollback(); /*Si hay algún error  */ 
                                  conection.release();
                                  throw err;
                      } 
                }else{ 
                    throw createError(401,"Usted no tiene autorización"); 
                }
          }catch(error){
                throw error;
          }
  }/*End registrarintegrantes*/

  /*_____________________ actualizarintegrantes______________________________________________*/
  async function actualizarintegrantes(id, integrantes,token){  
            try{
              if(token && validarToken(token)){
                  let payload=helper.parseJwt(token);
                  let tipo_user= payload.rol; 
                    if(tipo_user!='Administrador'){
                            throw createError(401,"Usted no tiene autorización para actualizar la información de los integrantes");
                    }
                    const conection= await db.newConnection(); 
                          conection.beginTransaction();
                  if(
                    integrantes.nombres === undefined || 
                    integrantes.apellidos === undefined ||
                    integrantes.descripcion === undefined ||                   
                    integrantes.imagen === undefined ||
                    integrantes.fecha_nacimiento === undefined ||
                    integrantes.cargo === undefined ||
                    integrantes.municipio === undefined ||
                    integrantes.departamento=== undefined ||
                    integrantes.pais === undefined
                    )
                    {
                        throw createError(400,"Debe enviar todos los datos requeridos para la actualización de la información del integrante");
                    }
                    try{
                            const result = await db.query(
                            `UPDATE integrantes
                            SET nombres=?, 
                                apellidos=?,
                                descripcion=?,
                                imagen=?,
                                fecha_nacimiento=?,
                                cargo=?,
                                municipio=?,
                                departamento=?,
                                pais=?
                            WHERE id=?`,
                            [
                              integrantes.nombres,
                              integrantes.apellidos, 
                              integrantes.descripcion,
                              integrantes.imagen,
                              integrantes.fecha_nacimiento,
                              integrantes.cargo,
                              integrantes.municipio,
                              integrantes.departamento,
                              integrantes.pais,
                              id
                            ] 
                          );  
                          let message = 'Error actualizando la información del integrante';  
                          if (result.affectedRows) {
                            message = 'integrante actualizado exitosamente';
                          }
                          /*var enlaces=JSON.parse(integrantes.arrayEnlaces);Pasar el string a vector*/ 
                          var enlaces=integrantes.arrayEnlaces;     
                          await db.query(
                            `DELETE from enlaces where id_integrante=?`,
                            [id]
                          );        
                          for(var i=0;i<enlaces.length;i++){
                              await db.query(
                                `INSERT INTO enlaces(url_enlace,id_integrante) VALUES (?,?)`,
                                [enlaces[i],id]
                              );
                          } 
                            conection.commit(); 
                            conection.release(); 
                            return {message};
                      }catch(error){
                                conection.rollback(); 
                                conection.release(); 
                                throw error
                      }
                }else{ 
                  throw createError(401,"Usted no tiene autorización"); 
              }
        }catch(error){
              throw error;
        }
  }/*End actualizarintegrantes*/
  
  /*______________________ eliminarintegrantes_______________________________*/
  async function eliminarintegrantes(id,token){
          try{
              if(token && validarToken(token)){
                  let payload=helper.parseJwt(token);
                  let tipo_user= payload.rol; 
                    if(tipo_user!='Administrador'){
                            throw createError(401,"Usted no tiene autorización para eliminar la información de los integrantes");
                    }
                    const conection= await db.newConnection(); /*conection of TRANSACTION */
                          conection.beginTransaction();
                    try {
                              await db.query(
                              `DELETE from enlaces where id_integrante=?`,
                               [id]
                              );  /*Elimino la relación del integrante en la tabla enlaces(id_enlace,url-enlaces,id_integrante) */

                          const result = await db.query(
                            `DELETE FROM integrantes WHERE id=?`, 
                            [id]
                          );  
                          let message = 'Error borrando la información del integrante';  
                          if (result.affectedRows) {
                            message = 'integrante borrado exitosamente';
                          }  
                            conection.commit(); 
                            conection.release();
                            return {message};
                        }catch(error){
                                conection.rollback(); /*Si hay algún error  */ 
                                conection.release();
                                throw createError(500,"Error al eliminar el integrante");
                        }
                }else{ 
                    throw createError(401,"Usted no tiene autorización"); 
                }
          }catch(error){
                throw error;
          }
  }/*End eliminarintegrantes*/

/*______________________________________updateparcialIntegrante___________________________________________*/
  async function updateParcialIntegrante(idUser, integrante, token){  
    try{
          if(token && validarToken(token)){
                  let payload=helper.parseJwt(token);
                  let tipo_user= payload.rol; 
                  if(tipo_user!='Administrador'){
                    throw createError(401,"Usted no tiene autorización para actualizar integrantes");
                  }                     
                      var atributos=Object.keys(integrante); /*Arreglo de los keys del integrante*/ 
                      if (atributos.length!=0){    
                          var param=Object.values(integrante);
                          var query = "UPDATE integrantes SET ";
                          param.push(idUser);/*Agrego el id al final de los parametros*/ 
                          for(var i=0; i<atributos.length;i++) {
                            query= query+atributos[i]+'=?,';      }
                          query= query.substring(0, query.length-1);/*eliminar la coma final*/ 
                          query= query+' '+'WHERE id=?'
                          const result = await db.query(query,param);    
                          let message = 'Error actualizando el registro del integrante';    
                          if (result.affectedRows) {
                            message = 'Integrante actualizado exitosamente';
                          }
                          return {message};
                    }
                      throw createError(400,"No hay parametros para actualizar");
          }else{
            throw createError(401,"Usuario no autorizado"); 
          }
        } catch (error) {
              console.log(error);
              throw error;
        }   
}/*End updateParcialIntegrante*/


/*_____________________ actualizarEnlaces______________________________________________*/
async function actualizarEnlaces(idIntegrante,body,token){  
      var arrayenlaces= body.arrayEnlaces;
      let tipo_user=null; 
      const conection= await db.newConnection();
      await conection.beginTransaction();
      if(token && validarToken(token)){
          let payload=helper.parseJwt(token);
          tipo_user= payload.rol;        
          try{                    
              if(tipo_user!="Administrador"){ 
                throw createError(401,"Usted no tiene autorización");
              }else{
                  if(arrayenlaces){ 
                        try{
                              await conection.execute(
                              `DELETE from enlaces where id_integrante=?`,
                                [idIntegrante]
                              );       
                              for(var i=0;i<arrayenlaces.length;i++){
                                  await conection.execute(
                                    `INSERT INTO enlaces (url_enlace,id_integrante) VALUES (?,?)`,
                                    [arrayenlaces[i], idIntegrante]
                                  );
                              }                         
                        }catch(err) {
                              throw err;
                        }
                  }else{
                    throw createError(400,"Usted no agrego los enlaces para actualizar"); 
                  }
            } 
            await conection.commit(); 
            conection.release();
            message = "Enlaces actualizados correctamente";
            return { message };
          }catch (error) {
            await conection.rollback(); 
            conection.release();
            throw error;
        } 
      }else{
        throw createError(401,"Usuario no autorizado");
      }
}/*End actualizarEnlaces*/

module.exports = {
  getintegrantes,
  registrarintegrantes,
  actualizarintegrantes,
  eliminarintegrantes,
  updateParcialIntegrante,
  actualizarEnlaces
}