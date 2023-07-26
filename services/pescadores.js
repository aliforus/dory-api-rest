const db = require('./db');
const helper = require('../helper');
const config = require('../config');
var createError = require('http-errors');

async function getPescadoresTodos(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
 `SELECT distinctrow   u.id, tu.id_tipo_usuario,tu.nombre_tipo_usuario as tipo_usuario,u.cedula,concat(u.nombres," ",u.apellidos) as nombre,
    u.celular,u.direccion,u.email,u.id_area_experticia,
    (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
    (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
    (select a.nombre from areas_experticias a  where a.id_area=u.id_area_experticia) as area_experticia,u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
    (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
    (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
    (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
    (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
    u.latitud,u.longitud
 FROM tipos_usuarios as tu, usuarios as u
 WHERE (u.id_tipo_usuario=tu.id_tipo_usuario) and (tu.nombre_tipo_usuario like('Pescador')) and u.estaVerificado=1
           LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*End getPescadoresTodos*/

async function getPescadoresMunicipio(page = 1,idMunicipio){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
 `SELECT distinctrow   u.id, tu.id_tipo_usuario,tu.nombre_tipo_usuario as tipo_usuario,u.cedula,concat(u.nombres," ",u.apellidos) as nombre,
    u.celular,u.direccion,u.email,u.id_area_experticia,
    (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
    (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
    (select a.nombre from areas_experticias a  where a.id_area=u.id_area_experticia) as area_experticia,u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
    (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
    (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
    (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
    (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
    u.latitud,u.longitud
 FROM tipos_usuarios as tu, usuarios as u
 WHERE (u.id_tipo_usuario=tu.id_tipo_usuario) and (tu.nombre_tipo_usuario like('Pescador')) and u.estaVerificado=1 and 
       u.id_municipio=?
           LIMIT ?,?`, 
    [idMunicipio,offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}/*End getPescadoresMunicipio*/

async function getPescadoresDepartamento(page = 1, idDepartamento){
      const offset = helper.getOffset(page, config.listPerPage);
      const rows = await db.query(
       `SELECT distinct  m.id_municipio, m.nombre, m.poblacion,
           (SELECT count(*) 
            FROM municipios m1, usuarios u1, tipos_usuarios tu 
            WHERE m1.id_municipio=u1.id_municipio and  m1.id_municipio=m.id_municipio and 
            u1.id_tipo_usuario=tu.id_tipo_usuario and tu.nombre_tipo_usuario like('Pescador')) as count_pescadores
        FROM  municipios as m  
                                  left join corregimientos as c on (c.id_municipio=m.id_municipio)
                                  left join veredas as v  on  (v.id_municipio=m.id_municipio) 
                                  left join   usuarios as u on (m.id_municipio=u.id_municipio)
        WHERE m.id_departamento_fk=?
        LIMIT ?,?`, 
        [idDepartamento, offset, config.listPerPage]
     );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}/*End getPescadoresDepartamento*/

async function getPescadoresAsociacion(page = 1,nit){
  const valid_rows = await db.query(
    `SELECT  *
    FROM asociaciones as a
    WHERE  a.nit=?
    `, 
    [nit]
  );
  if(valid_rows.length<1){
      throw createError(404,"La asociación ingresada no existe"); 
  }
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query( 
    `SELECT DISTINCT   tu.id_tipo_usuario, tu.nombre_tipo_usuario as tipo_usuario,u.id,u.cedula,concat(u.nombres," ",u.apellidos) as nombre,
                       u.celular,u.direccion,u.email,u.id_area_experticia,
                       (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                       (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                       (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                       (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                       (select a.nombre from areas_experticias a  where a.id_area=u.id_area_experticia) as area_experticia,
                       u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
                       (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                       (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                       (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                       (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                       u.latitud,u.longitud, a.nit as nit_asociacion, a.nombre as nombre_asociacion,
                       a.legalconstituida, a.fecha_renovacion_camarac, a.foto_camarac, a.id_tipo_asociacion_fk as id_tipo_asociacion, a.telefono,
                       (select ta.nombre from tipos_asociaciones as ta  where ta.id_tipo_asociacion=a.id_tipo_asociacion_fk) as tipo_asociacion,
                        s.id_solicitud
    FROM usuarios as u  inner join tipos_usuarios as tu on tu.nombre_tipo_usuario like('Pescador') and (u.id_tipo_usuario=tu.id_tipo_usuario) 
                        inner join solicitudes as s on (u.id=s.usuarios_id and s.id_estado_fk=2)				   
                        inner join asociaciones as a on (a.nit=s.nit_asociacion_fk)                                   
    WHERE  a.nit=?
            LIMIT ?,?`, 
    [nit,offset, config.listPerPage]
  );
     const row = await db.query(
    `select m.nombre 
    from asociaciones as a inner join municipios as m on a.id_municipio = m.id_municipio 
    where a.nit = ?`,
    [nit]
    );
  const municipio = row[0].nombre;
  let data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    municipio,
    meta
  }
}/*End getPescadoresAsociacion*/

module.exports = {
  getPescadoresMunicipio,
  getPescadoresDepartamento,
  getPescadoresAsociacion,
  getPescadoresTodos
}