const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');

async function getMultiple(page = 1, email){

    const offset = helper.getOffset(page, config.listPerPage);
    let message = "Usuario no esta registrado";

        const rows = await db.query(
          `SELECT  u.id,u.cedula, u.nombres, u.apellidos,
          u.celular,u.direccion,u.informacion_adicional_direccion,u.email,tu.id_tipo_usuario,tu.nombre_tipo_usuario as tipo_usuario,u.id_area_experticia,
          (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
          (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
          (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
          (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
          (select a.nombre from areas_experticias a  where a.id_area=u.id_area_experticia) as area_experticia,u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
          u.id_departamento,
          (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
          u.id_municipio,
          (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
          u.id_corregimiento,
          (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
          u.id_vereda,
          (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
          u.latitud,u.longitud,u.nombre_corregimiento,u.nombre_vereda,u.estaVerificado,u.otra_area_experticia,u.otra_area_experticia_descripcion,u.sobre_mi, u.takeTour, u.url_imagen_cedula, u.url_sisben,u.carnet
          FROM usuarios as u left join tipos_usuarios as tu  on u.id_tipo_usuario=tu.id_tipo_usuario
          WHERE   u.email=?
          LIMIT ?,?`, 
          [email, offset, config.listPerPage]
        );
      if ((rows.length!=0 )){
            var idUser=rows[0].id;
            const rows2 = await db.query(
              `SELECT g.nombre as nombre_granja, g.id_granja ,g.descripcion,g.direccion,g.area, g.produccion_estimada_mes,g.numero_trabajadores
              FROM usuarios  as u 
                      left join usuarios_granjas as ug on u.id=ug.usuarios_id and ug.espropietario=1
                      left join  granjas as g   on  g.id_granja=ug.id_granja_pk_fk

              WHERE  u.id=?
                    LIMIT ?,?`, 
              [idUser,offset, config.listPerPage]
            );
            var arraygranjas= new Array();
            var nuevoRows = new Array();
            nuevoRows.push(rows[0]);
          if((rows2[0].id_granja!=null)){

              rows2.forEach((element)=>{ 
                arraygranjas.push(element);
                nuevoRows[nuevoRows.length-1].granjas=arraygranjas;
              });
          }else{ 
            nuevoRows[nuevoRows.length-1].granjas=arraygranjas;
          }
          const data = helper.emptyOrRows(nuevoRows);
          const meta = {page};
            return {
              data,
              meta
            }
      }
        throw createError(404,message);
}

module.exports = {
  getMultiple
}