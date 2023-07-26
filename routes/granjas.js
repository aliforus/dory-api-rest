const express = require('express');
const router = express.Router();
const granjas = require('../services/granjas');

router.get('/user/:id', async function(req, res, next) {
  try {  
        var token=req.headers.authorization;
        res.json(await granjas.getGranjaUsuario(req.query.page, req.params.id,token));
  } catch (err) {
        console.error(`Error al traer las granjas de éste usuario`, err.message);
        next(err);
  }
});

router.get('/todas', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await granjas.getGranjasTodas(req.query.page,token));
  } catch (err) {
        console.error(`Error al traer las granjas del sistema`, err.message);
        next(err);
  }
});

router.get('/mayorcalificacion/:idMunicipio', async function(req, res, next) {
  try {
    res.json(await granjas.getGranjasMayorCalificacion(req.query.page,req.params.idMunicipio));
  } catch (err) {
    console.error(`Error al traer las granjas ordenadas por mayor calificacion`, err.message);
    next(err);
  }
});

router.get('/mayorArea/:idMunicipio', async function(req, res, next) {
  try {
    res.json(await granjas.getGranjasMayorArea(req.query.page,req.params.idMunicipio));
  } catch (err) {
    console.error(`Error al traer las granjas ordenadas por mayor area`, err.message);
    next(err);
  }
});

router.get('/menorArea/:idMunicipio', async function(req, res, next) {
  try {
    res.json(await granjas.getGranjasMenorArea(req.query.page,req.params.idMunicipio));
  } catch (err) {
    console.error(`Error al traer las granjas ordenadas por menor area`, err.message);
    next(err);
  }
});

router.post('/', async function(req, res, next) {
    try {
          var token=req.headers.authorization;
          res.json(await granjas.createGranja(req.body,token));
    } catch (err) {
          console.error(`Error creando la granja`, err.message);
          next(err);
    }
  });

router.put('/general/:id', async function(req, res, next) {
    try {
         var token=req.headers.authorization;
         res.json(await granjas.updateGranja(req.params.id, req.body,token));
    } catch (err) {
         console.error(`Error al actualizar la granja`, err.message);
         next(err);
    }
});

router.put('/parcial/:id', async function(req, res, next) {
  try {
       var token=req.headers.authorization;
       res.json(await granjas.updateParcial(req.params.id, req.body,token));
  } catch (err) {
       console.error(`Error al actualizar la granja`, err.message);
       next(err);
  }
});

/*router.put('/anular/:id', async function(req, res, next) {
    try { 
         var token=req.headers.authorization;
         res.json(await granjas.anularGranja(req.params.id,token));
    } catch (err) {
         console.error(`Error al borrar la granja`, err.message);
         next(err);
    }
  });
*/
  router.delete('/eliminar/:idGranja', async function(req, res, next) {
    try { 
         var token=req.headers.authorization;  
         res.json(await granjas.eliminarGranja(req.params.idGranja,token));
    } catch (err) {
         console.error(`Error al borrar la granja`, err.message);
         next(err);
    }
  });

  router.get('/departamento/:idDepartamento', async function(req, res, next) { 
    try { 
         res.json(await granjas.getGranjasDepartamento(req.query.page,req.params.idDepartamento));
    } catch (err) {
          console.error(`Error al traer las Granjas por Departamento `, err.message);
          next(err);
    }
  });

  router.get('/municipio/:id', async function(req, res, next) {
    try {
          var token=req.headers.authorization;
          res.json(await granjas.getGranjasMunicipio(req.query.page,req.params.id,token));
    } catch (err) {
          console.error(`Error al traer las granjas del municipio ingresado `, err.message);
          next(err);
    }
  });

  router.get('/detailed/:idGranja', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await granjas.getDetail(req.query.page,req.params.idGranja,token));
    } catch (err) {
      console.error(`Error al traer la granja `, err.message);
      next(err);
    }
  });

  router.put('/update/photos/:idGranja', async function(req, res, next) {
    try { 
         var token=req.headers.authorization;
         res.json(await granjas.updatePhotos(req.params.idGranja,req.body,token));
    } catch (err) {
         console.error(`Error al actualizar las fotos de la granja`, err.message);
         next(err);
    }
  });

  router.put('/esfavorita/:idGranja', async function(req, res, next) {
    try { 
         var token=req.headers.authorization;
         res.json(await granjas.esFavorita(req.params.idGranja,token));
    } catch (err) {
         console.error(`Error al agregar granja a favoritas`, err.message);
         next(err);
    }
  });
/*
  router.put('/calificar/:idGranja', async function(req, res, next) {
    try { 
         var token=req.headers.authorization;
         res.json(await granjas.calificar(req.params.idGranja,token,req.body));
    } catch (err) {
         console.error(`Error al calificar la granja`, err.message);
         next(err);
    }
  });*/

  router.get('/resenas/:idGranja', async function(req, res, next) {
    try { 
         res.json(await granjas.getResenasGranja(req.params.idGranja));
    } catch (err) {
         console.error(`Error al calificar la granja`, err.message);
         next(err);
    }
  });

  router.get('/misfavoritas', async function(req, res, next) {
    try { 
         var token=req.headers.authorization;
         res.json(await granjas.misFavoritas(token));
    } catch (err) {
         console.error(`Error al mostrar las granjas favoritas del usuario`, err.message);
         next(err);
    }
  });


module.exports = router;