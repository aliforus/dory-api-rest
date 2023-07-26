const express = require('express');
const router = express.Router();
const integrantes = require('../services/integrantes');

router.get('/obtener', async function(req, res, next) {
  try {
    res.json(await integrantes.getintegrantes(req.query.page));
  } catch (err) {
    console.error(`Error al traer la información de los integrantes del equipo de trabajo`, err.message);
    next(err);
  }
});

router.post('/registrar', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await integrantes.registrarintegrantes(req.body,token));
    } catch (err) {
      console.error(`Error al registrar la información de los integrantes del equipo de trabajo`, err.message);
      next(err);
    }
  });

router.put('/actualizar/:id', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await integrantes.actualizarintegrantes(req.params.id, req.body,token));
    } catch (err) {
      console.error(`Error al actualizar la información de los integrantes del equipo de trabajo`, err.message);
      next(err);
    }
});

router.delete('/eliminar/:id', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await integrantes.eliminarintegrantes(req.params.id,token));
    } catch (err) {
      console.error(`Error al borrar la información de los integrantes del equipo de trabajo`, err.message);
      next(err);
    }
  });

  router.put('/parcial/:idIntegrante', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await integrantes.updateParcialIntegrante(req.params.idIntegrante, req.body, token));
    } catch (err) {
      console.error(`Error al actualizar el integrante`, err.message);
      next(err);
    }
  });

  router.put('/actualizar/enlaces/:idIntegrante', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await integrantes.actualizarEnlaces(req.params.idIntegrante,req.body,token));
    } catch (err) {
      console.error(`Error al actualizar los enlaces de interés del integrante del equipo de trabajo`, err.message);
      next(err);
    }
});

module.exports = router;