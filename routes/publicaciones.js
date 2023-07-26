const express = require('express');
const router = express.Router();
const publicaciones = require('../services/publicaciones');

router.get('/usuario/:idUser', async function(req, res, next) {
  try {  
    res.json(await publicaciones.getPublicacionesUsuario(req.params.idUser));
  } catch (err) {
    console.error(`Error al traer las publicaciones de éste usuario`, err.message);
    next(err);
  }
});

router.get('/', async function(req, res, next) {
  try {
    res.json(await publicaciones.getPublicacionesMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las publicaciones `, err.message);
    next(err);
  }
});

router.post('/', async function(req, res, next){
    try {
          var token=req.headers.authorization;
          res.json(await publicaciones.createPublicacion(req.body,token));
    } catch (err) {
          console.error(`Error creando la publicación`, err.message);
          next(err);
    }
  });

router.put('/update/:idPublicacion', async function(req, res, next) {
    try {
         var token=req.headers.authorization;
         res.json(await publicaciones.updatePublicacion(req.params.idPublicacion, req.body,token));
    } catch (err) {
         console.error(`Error al actualizar la publicación`, err.message);
         next(err);
    }
});

  router.delete('/eliminar/:idPublicacion', async function(req, res, next) {
    try { 
         var token=req.headers.authorization;  
         res.json(await publicaciones.removePublicacion(req.params.idPublicacion,token));
    } catch (err) {
         console.error(`Error al borrar la publicación`, err.message);
         next(err);
    }
  });

  router.put('/update/photos/:idPublicacion', async function(req, res, next) {
    try { 
         var token=req.headers.authorization;
         res.json(await publicaciones.updatePhotosPublicacion(req.params.idPublicacion,req.body,token));
    } catch (err) {
         console.error(`Error al actualizar las fotos de la publicación`, err.message);
         next(err);
    }
  });

  router.get('/detailed/:idPublicacion', async function(req, res, next) {
    try {
      res.json(await publicaciones.getDetailPublicacion(req.params.idPublicacion));
    } catch (err) {
      console.error(`Error al traer la publicación detallada `, err.message);
      next(err);
    }
  });

  router.put('/parcial/:idPublicacion', async function(req, res, next) {
    try {
         var token=req.headers.authorization;
         res.json(await publicaciones.updateParcialPublicacion(req.params.idPublicacion, req.body,token));
    } catch (err) {
         console.error(`Error al actualizar la publicación parcialmente`, err.message);
         next(err);
    }
  });

module.exports = router;