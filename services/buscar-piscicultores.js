const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getMultiple(page = 1,cadena){
  const offset = helper.getOffset(page, config.listPerPage);
  let cad= '%'+cadena+'%';
 
  const rows = await db.query(
    `SELECT distinctrow   tu.id_tipo_usuario,tu.nombre_tipo_usuario as tipo_usuario,u.cedula,concat(u.nombres," ",u.apellidos) as nombre,
                          u.celular,u.direccion,u.email,u.password,u.id_area_experticia,
                          (select s.nombre from sexos as s  where s.id=u.id_sexo) as sexo,
                          (select s.id from sexos as s  where s.id=u.id_sexo) as id_sexo,
                          (select et.nombre from etnias as et  where et.id=u.id_etnia) as etnia,
                          (select et.id from etnias as et  where et.id=u.id_etnia) as id_etnia,
                          (select a.nombre from areas_experticias a  where a.id_area=u.id_area_experticia) as area_experticia,u.nombre_negocio,u.foto,u.fecha_registro,u.fecha_nacimiento,
                          (select d.nombre_departamento from departamentos d  where d.id_departamento=u.id_departamento) as departamento,
                          (select m.nombre from municipios as m  where m.id_municipio=u.id_municipio) as municipio,
                          (select c.nombre from corregimientos as c  where c.id_corregimiento=u.id_corregimiento) as corregimiento,
                          (select v.nombre from veredas as v  where v.id_vereda=u.id_vereda) as vereda,
                          u.latitud,u.longitud
     FROM tipos_usuarios as tu, usuarios as u
     WHERE (( u.id_tipo_usuario=tu.id_tipo_usuario) and (tu.nombre_tipo_usuario like('%Piscicultor%'))) and 
           ( u.nombres like ? or  u.apellidos like ? )
           LIMIT ?,?`, 
    [cad,cad,offset, config.listPerPage]
  );

const data = helper.emptyOrRows(rows);
const meta = {page};

return {
 data,
 meta
}
}

module.exports = {
getMultiple
}