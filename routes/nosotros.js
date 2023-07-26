const express = require('express');
const router = express.Router();
const nosotros = require('../services/nosotros');

router.get('/obtener', async function(req, res, next) {
  try {
    res.json(await nosotros.getNosotros(req.query.page));
  } catch (err) {
    console.error(`Error al traer la información de nosotros`, err.message);
    next(err);
  }
});

router.post('/registrar', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await nosotros.registrarNosotros(req.body,token));
    } catch (err) {
      console.error(`Error al registrar la información de nosotros`, err.message);
      next(err);
    }
  });

router.put('/actualizar/:id', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await nosotros.actualizarNosotros(req.params.id, req.body,token));
    } catch (err) {
      console.error(`Error al actualizar la información de nosotros`, err.message);
      next(err);
    }
});

router.delete('/eliminar/:id', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await nosotros.eliminarNosotros(req.params.id,token));
    } catch (err) {
      console.error(`Error al borrar la información de nosotros`, err.message);
      next(err);
    }
  });

  router.put('/actualizacion/parcial/:idNosotros', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await nosotros.actualizacionParcialNosotros(req.params.idNosotros, req.body,token));
    } catch (err) {
      console.error(`Error al actualizar parcialmente la información de nosotros`, err.message);
      next(err);
    }
});

module.exports = router;