const express = require('express');
const router = express.Router();
const negocios = require('../services/negocios');

router.get('/usuario/:idUser', async function(req, res, next) {
  try {  
    res.json(await negocios.getNegocioUsuario(req.params.idUser));
  } catch (err) {
    console.error(`Error al traer los negocios de éste usuario`, err.message);
    next(err);
  }
});

router.get('/', async function(req, res, next) {
  try {
    res.json(await negocios.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los negocios `, err.message);
    next(err);
  }
});

router.post('/', async function(req, res, next){
    try {
          var token=req.headers.authorization;
          res.json(await negocios.createNegocio(req.body,token));
    } catch (err) {
          console.error(`Error creando el negocio`, err.message);
          next(err);
    }
  });

router.put('/update/:idNegocio', async function(req, res, next) {
    try {
         var token=req.headers.authorization;
         res.json(await negocios.updateNegocio(req.params.idNegocio, req.body,token));
    } catch (err) {
         console.error(`Error al actualizar el negocio`, err.message);
         next(err);
    }
});

  router.delete('/eliminar/:idNegocio', async function(req, res, next) {
    try { 
         var token=req.headers.authorization;  
         res.json(await negocios.eliminarNegocio(req.params.idNegocio,token));
    } catch (err) {
         console.error(`Error al borrar el negocio`, err.message);
         next(err);
    }
  });

  router.put('/update/photos/:idNegocio', async function(req, res, next) {
    try { 
         var token=req.headers.authorization;
         res.json(await negocios.updatePhotosNegocio(req.params.idNegocio,req.body,token));
    } catch (err) {
         console.error(`Error al actualizar las fotos del negocio`, err.message);
         next(err);
    }
  });

  router.get('/detailed/:idNegocio', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await negocios.getDetailNegocio(req.params.idNegocio,token));
    } catch (err) {
      console.error(`Error al traer el negocio detallado `, err.message);
      next(err);
    }
  });

  router.put('/parcial/:idNegocio', async function(req, res, next) {
    try {
         var token=req.headers.authorization;
         res.json(await negocios.updateParcialNegocio(req.params.idNegocio, req.body,token));
    } catch (err) {
         console.error(`Error al actualizar el negocio parcialmente`, err.message);
         next(err);
    }
  });

module.exports = router;