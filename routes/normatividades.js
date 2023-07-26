const express = require('express');
const router = express.Router();
const normatividades = require('../services/normatividades');

router.get('/', async function(req, res, next) {
  try {
    res.json(await normatividades.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las normatividades`, err.message);
    next(err);
  }
});

router.get('/buscar/:cadena', async function(req, res, next) {
      try {
        res.json(await normatividades.getNormatividadesCadena(req.query.page,req.params.cadena));
      } catch (err) {
        console.error(`Error al traer las normatividades por Cadena`, err.message);
        next(err);
      }
 });

 router.get('/tipos/buscar/:tipo', async function(req, res, next) {
      try {
        res.json(await normatividades.getNormatividadesTipo(req.query.page,req.params.tipo));
      } catch (err) {
        console.error(`Error al traer las normatividades por tipo`, err.message);
        next(err);
      }
    });

router.post('/', async function(req, res, next) {
    try {
          var token=req.headers.authorization;
          res.json(await normatividades.create(req.body,token));
    } catch (err) {
          console.error(`Error registrando normatividad`, err.message);
          next(err);
    }
  });

router.put('/:id', async function(req, res, next) {
    try {
          var token=req.headers.authorization;
          res.json(await normatividades.update(req.params.id, req.body,token));
    } catch (err) {
          console.error(`Error al actualizar normatividad`, err.message);
          next(err);
    }
});

router.delete('/:id', async function(req, res, next) {
    try {
          var token=req.headers.authorization;
          res.json(await normatividades.remove(req.params.id,token));
    } catch (err) {
          console.error(`Error al borrar normatividad`, err.message);
          next(err);
    }
  });

  router.get('/obtener/tipos', async function(req, res, next) {
    try {
      res.json(await normatividades.obtenerTiposNormatividades());
    } catch (err) {
      console.error(`Error al traer los tipos de normatividades `, err.message);
      next(err);
    }
  });

module.exports = router;