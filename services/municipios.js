const db = require('./db');
const helper = require('../helper');
const config = require('../config');
const createError = require('http-errors');

/*--------------------- GetMunicipio X Id--------------------------------*/
async function getMunicipio(page = 1,id_municipio){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT m.id_municipio, m.nombre, m.descripcion, m.poblacion, id_departamento_fk,  
            (select d.nombre_departamento from departamentos d  where d.id_departamento=m.id_departamento_fk) as departamento, id_subregion_fk,
            (select subr.nombre from subregiones as subr  where subr.id_subregion=m.id_subregion_fk) as subregion,
            m.latitud, m.longitud
     FROM municipios as m
     WHERE m.id_municipio=?
     LIMIT ?,?`, 
    [id_municipio, offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*End GetMunicipio*/

/* ------------------------------------GetMunicipioDelDepartamento------------------------------------*/
async function GetMunicipioDelDepartamento(page = 1,idDepartamento){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT m.id_municipio, m.nombre
    FROM municipios as m, departamentos as d
    WHERE (m.id_departamento_fk=d.id_departamento)  and
          d.id_departamento=? LIMIT ?,?`, 
    [idDepartamento, offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*End GetMunicipioDelDepartamento*/

/* ------------------------------------getMultiple------------------------------------*/
async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM municipios LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};
  return {
    data,
    meta
  }
}/*End getMultiple*/

/* ------------------------------------create------------------------------------*/
async function create(municipio){
    const result = await db.query(
      `INSERT INTO municipios(id_municipio, nombre,descripcion,poblacion,id_departamento_fk,id_subregion_fk) VALUES (?,?,?,?,?,?)`, 
      [
        municipio.id_municipio,
        municipio.nombre,
        municipio.descripcion,
        municipio.poblacion,
        municipio.id_departamento_fk,
        municipio.id_subregion_fk
      ]
    );  
    let message = 'Error creando municipio';  
    if (result.affectedRows) {
      message = {  insertId: result.insertId, message:'municipio creado exitosamente'};
    }  
    return {message};
  }/*End create*/

/* ------------------------------------Eupdate------------------------------------*/
  async function update(id, municipio){
    const result = await db.query(
      `UPDATE municipios 
       SET nombre=?,
           descripcion=?,
           poblacion=?,
           id_departamento_fk=?, 
           id_subregion_fk=?
       WHERE id_municipio=?`,
       [
         municipio.nombre,
         municipio.descripcion, 
         municipio.poblacion,
         municipio.id_departamento_fk,
         municipio.id_subregion_fk,
         id
       ] 
    );  
    let message = 'Error actualizando municipio';  
    if (result.affectedRows) {
      message = 'municipio actualizado exitosamente';
    }  
    return {message};
  }/*End update*/

  /* ------------------------------------remove------------------------------------*/
  async function remove(id){
    const result = await db.query(
      `DELETE FROM municipios WHERE id_municipio=?`, 
      [id]
    );  
    let message = 'Error borrando municipio';  
    if (result.affectedRows) {
      message = 'municipio borrado exitosamente';
    }  
    return {message};
  }/*End remove*/

/* ------------------------------------getConsumosEspecies------------------------------------*/
  async function getConsumosEspecies(id_municipio){
   
            const rowsEspecies = await db.query(
              `SELECT e.*
              FROM especies as e
              `, 
              []
            );                
            let consumototalMunicipio=[]; 
            let rowsConsumos;
           for(let i=0; i<rowsEspecies.length;i++){
                rowsConsumos= await db.query(
                  `SELECT e.nombre as especie, sum(eu.cantidad_consumo) as consumo, count(eu.usuarios_id) as cantidad_usuario,
                   ( select m.nombre from municipios as m where m.id_municipio=u.id_municipio ) as municipio
                  FROM especies_usuarios as eu inner join especies as e on e.id_especie=eu.id_especie_pk_fk
                                              inner join usuarios as u on u.id=eu.usuarios_id
                  WHERE u.id_municipio=? and eu.id_especie_pk_fk=?
                  `, 
                  [id_municipio,rowsEspecies[i].id_especie]
                );            
                consumototalMunicipio.push(rowsConsumos[0]);
           }/*end for*/          
                const data = helper.emptyOrRows(consumototalMunicipio);            
                return {
                      data
                }
          }/* End getConsumosEspecies*/

/*------------------------------------getConsumosEspeciesTotalNuevo------------------------------------*/
async function getConsumosEspeciesDepartamento(params){ 
  let  {idDepartamento, year } = params;
  if(!idDepartamento || !year){
    throw createError(400, "Se requieren todos los parámetros");
  }

  const rowsMunicipios = await db.query(
    `SELECT m.*
    FROM municipios as m
    WHERE m.id_departamento_fk=?
    `, 
    [idDepartamento]
  );   
  let data=[];           
  let arrayConsumo=[]; 
  
  arrayConsumo= await db.query(
              `select m.nombre as municipio, m.id_municipio as id_municipio, m.id_departamento_fk as id_departamento, e.nombre as especie, sum(eu.cantidad_consumo) as consumo, count(eu.usuarios_id)as cantidad_usuario, year(eu.fecha_consumo)  as año
              from especies_usuarios as eu inner join especies as e on e.id_especie = eu.id_especie_pk_fk inner join usuarios as u on u.id = eu.usuarios_id inner join municipios as m on m.id_municipio = u.id_municipio
              group by municipio, especie, año
              having año = ? and id_departamento = ?;
              `, 
              [ year, idDepartamento]
            );          
  
  
    // Estos for se utilizan para convertir la respuesta del query en json con la estructura de la respuesta anterior
    for(let i=0; i<rowsMunicipios.length;i++){ 
      let consumoEspecie=[];
      for(let j=0; j<arrayConsumo.length;j++){ 
        if(rowsMunicipios[i].id_municipio == arrayConsumo[j].id_municipio){
          delete arrayConsumo[j]['año']
          delete arrayConsumo[j]['municipio']
          delete arrayConsumo[j]['id_municipio']
          delete arrayConsumo[j]['id_departamento']
          consumoEspecie.push(arrayConsumo[j]);  
        }
      } 
      if(consumoEspecie.length>0){
        data.push({
              municipio:rowsMunicipios[i].nombre,
              id_municipio:rowsMunicipios[i].id_municipio,
              consumo:consumoEspecie
         });
      }
      
    }
return {
data
}
}
/*async function getConsumosEspeciesDepartamento(params){ 
  let  {idDepartamento, year } = params;
  if(!idDepartamento || !year){
    throw createError(400, "Se requieren todos los parámetros");
  }
  const rowsEspecies = await db.query(
    `SELECT e.*
    FROM especies as e
    `, 
    []
  );        
  const rowsMunicipios = await db.query(
    `SELECT m.*
    FROM municipios as m
    WHERE m.id_departamento_fk=?
    `, 
    [idDepartamento]
  );   
  let data=[];           
  let rowsConsumos;
  let arrayConsumo=[];
    for(let i=0; i<rowsMunicipios.length;i++){   
      arrayConsumo=[];
      for(let j=0; j<rowsEspecies.length;j++){
            rowsConsumos= await db.query(
              `SELECT e.nombre as especie, sum(eu.cantidad_consumo) as consumo, count(eu.usuarios_id) as cantidad_usuario,
              ( select m.id_municipio from municipios as m where m.id_municipio=u.id_municipio ) as id_municipio
              FROM especies_usuarios as eu inner join especies as e on e.id_especie=eu.id_especie_pk_fk
                                           inner join usuarios as u on u.id=eu.usuarios_id
                                           inner join municipios as m on u.id_municipio=m.id_municipio
              WHERE eu.id_especie_pk_fk=? and u.id_municipio=? and year(eu.fecha_consumo)=?
              `, 
              [rowsEspecies[j].id_especie,rowsMunicipios[i].id_municipio, year]
            );                                
            if(rowsConsumos[0].consumo==null){
                  rowsConsumos[0].especie=rowsEspecies[j].nombre;
                  rowsConsumos[0].consumo=0;
            }
            rowsConsumos[0].id_municipio = undefined;
            arrayConsumo.push(rowsConsumos[0]);
                  
      }//end for especies
      data.push({
        municipio:rowsMunicipios[i].nombre,
        id_municipio:rowsMunicipios[i].id_municipio,
        consumo:arrayConsumo
      })
    } //end for municipios             
return {
data
}
}*/
//End getConsumosEspeciesTotalNuevo

module.exports = {
  getMunicipio,
  GetMunicipioDelDepartamento,
  getMultiple,
  create,
  update,
  remove,
  getConsumosEspecies,
  getConsumosEspeciesDepartamento
}