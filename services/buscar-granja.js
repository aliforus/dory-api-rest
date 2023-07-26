const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function buscarGranjaCadena(page = 1,cadena){
          const offset = helper.getOffset(page, config.listPerPage);
          let cad= '%'+cadena+'%';
          const rows = await db.query(
            `SELECT g.id_granja as id_granja, g.nombre, g.descripcion, g.area, g.numero_trabajadores, 
                    g.produccion_estimada_mes, g.direccion, g.latitud, g.longitud, 
                    g.id_departamento, g.id_municipio, g.id_corregimiento, g.id_vereda,
                  (select count(*) from reseñas r1,granjas g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja and g1.id_granja=g.id_granja) as count_resenas
            FROM granjas as g
            WHERE  g.nombre like ? or
                    g.descripcion like ? or
                    g.area like ?                    
                  LIMIT ?,?`, 
            [cad,cad,cad, offset, config.listPerPage]
          );
          var nuevoRows = new Array();
          var indice=100;
        for  (var i = 0;i<rows.length;i++){          
          indice=rows[i].id_granja;        
          const rowsfotos = await db.query(
            `SELECT f.id_foto,f.imagen
            FROM  fotos as f
            WHERE f.id_granja_fk =?
              LIMIT ?,?`, 
          [indice,offset, config.listPerPage]
          );
        var arrayfotos= new Array();
        rowsfotos.forEach((element)=>{ 
          arrayfotos.push(element.imagen);
        });        
          nuevoRows.push(rows[i]);
          nuevoRows[nuevoRows.length-1].fotos=arrayfotos;
          const rows1 = await db.query(
            `SELECT concat(u.nombres, " ", u.apellidos) as nombre_completo, u.direccion, u.celular
            FROM granjas as g, usuarios_granjas as ug, usuarios as u
            WHERE (u.id=ug.usuarios_id) and
              (g.id_granja=ug.id_granja_pk_fk) and
              (ug.espropietario=1) and
              g.id_granja=? LIMIT ?,?`,
              [indice,offset, config.listPerPage]
              );
              var arraypropietarios= new Array();
              rows1.forEach((element)=>{ 
              arraypropietarios.push(element);
              nuevoRows[nuevoRows.length-1].propietarios=arraypropietarios;/*Arreglo de propietarios agregado al final del arreglo de granjas */
        });
        const rows2 = await db.query(
          `select e.nombre 
            from granjas as g, especies_granjas as eg, especies as e
            where (e.id_especie=eg.id_especie_pk_fk) and 
                  (eg.id_granja_pk_fk=g.id_granja) and 
                  g.id_granja=? LIMIT ?,?`, 
          [indice,offset, config.listPerPage]
        );
        var arrayespecies= new Array();
        rows2.forEach((element)=>{ 
                arrayespecies.push(element.nombre);
                nuevoRows[nuevoRows.length-1].especies=arrayespecies;/*Arreglo de especies agregado al final del arreglo de granjas */
        });
        const rows3 = await db.query(
          `select i.nombre 
            from granjas as g, infraestructuras_granjas as ig, infraestructuras as i
            where (i.id_infraestructura=ig.id_infraestructura_pk_fk) and 
                  (ig.id_granja_pk_fk=g.id_granja) and 
                  g.id_granja=? LIMIT ?,?`, 
          [indice,offset, config.listPerPage]
        );
        var arrayinfraestructuras= new Array();
        rows3.forEach((element)=>{ 
                arrayinfraestructuras.push(element.nombre);
                nuevoRows[nuevoRows.length-1].infraestructuras=arrayinfraestructuras;/*Arreglo de especies agregado al final del arreglo de granjas */
        });
        };
        const data = helper.emptyOrRows(nuevoRows);
        const meta = {page};
        return {
        data,
        meta
        }
 }

 async function buscarGranjaMunicipio(page = 1,idMunicipio, cadena){
                      const offset = helper.getOffset(page, config.listPerPage);
                      let cad= '%'+cadena+'%';
                      const rows = await db.query(
                        `SELECT g.id_granja as id_granja, g.nombre, g.descripcion, g.area, g.numero_trabajadores, 
                                g.produccion_estimada_mes, g.direccion, g.latitud, g.longitud, 
                                g.id_departamento, g.id_municipio, g.id_corregimiento, g.id_vereda,
                              (select count(*) from reseñas r1,granjas g1 where r1.id_granja_pk_fk=g1.id_granja and r1.id_granja_pk_fk= g.id_granja and g1.id_granja=g.id_granja) as count_resenas
                        FROM granjas as g
                        WHERE   g.nombre like ? or  g.descripcion like ? or g.area like ?  and ( g.id_municipio = ? )                 
                              LIMIT ?,?`, 
                        [cad,cad,cad, idMunicipio, offset, config.listPerPage]
                      );
                      var nuevoRows = new Array();
                      var indice=100;
                    for  (var i = 0;i<rows.length;i++){          
                      indice=rows[i].id_granja;        
                      const rowsfotos = await db.query(
                        `SELECT f.id_foto,f.imagen
                        FROM  fotos as f
                        WHERE f.id_granja_fk =?
                          LIMIT ?,?`, 
                      [indice,offset, config.listPerPage]
                      );
                    var arrayfotos= new Array();
                    rowsfotos.forEach((element)=>{ 
                      arrayfotos.push(element.imagen);
                    });        
                      nuevoRows.push(rows[i]);
                      nuevoRows[nuevoRows.length-1].fotos=arrayfotos;
                      const rows1 = await db.query(
                        `SELECT concat(u.nombres, " ", u.apellidos) as nombre_completo, u.direccion, u.celular
                        FROM granjas as g, usuarios_granjas as ug, usuarios as u
                        WHERE (u.id=ug.usuarios_id) and
                          (g.id_granja=ug.id_granja_pk_fk) and
                          (ug.espropietario=1) and
                          g.id_granja=? LIMIT ?,?`,
                          [indice,offset, config.listPerPage]
                          );
                          var arraypropietarios= new Array();
                          rows1.forEach((element)=>{ 
                          arraypropietarios.push(element);
                          nuevoRows[nuevoRows.length-1].propietarios=arraypropietarios;/*Arreglo de propietarios agregado al final del arreglo de granjas */
                    });
                    const rows2 = await db.query(
                      `select e.nombre 
                        from granjas as g, especies_granjas as eg, especies as e
                        where (e.id_especie=eg.id_especie_pk_fk) and 
                              (eg.id_granja_pk_fk=g.id_granja) and 
                              g.id_granja=? LIMIT ?,?`, 
                      [indice,offset, config.listPerPage]
                    );
                    var arrayespecies= new Array();
                    rows2.forEach((element)=>{ 
                            arrayespecies.push(element.nombre);
                            nuevoRows[nuevoRows.length-1].especies=arrayespecies;/*Arreglo de especies agregado al final del arreglo de granjas */
                    });
                    const rows3 = await db.query(
                      `select i.nombre 
                        from granjas as g, infraestructuras_granjas as ig, infraestructuras as i
                        where (i.id_infraestructura=ig.id_infraestructura_pk_fk) and 
                              (ig.id_granja_pk_fk=g.id_granja) and 
                              g.id_granja=? LIMIT ?,?`, 
                      [indice,offset, config.listPerPage]
                    );
                    var arrayinfraestructuras= new Array();
                    rows3.forEach((element)=>{ 
                            arrayinfraestructuras.push(element.nombre);
                            nuevoRows[nuevoRows.length-1].infraestructuras=arrayinfraestructuras;/*Arreglo de especies agregado al final del arreglo de granjas */
                    });
                    };
                    const data = helper.emptyOrRows(nuevoRows);
                    const meta = {page};
                    return {
                    data,
                    meta
                    }
}


module.exports = {
  buscarGranjaCadena,
  buscarGranjaMunicipio
}