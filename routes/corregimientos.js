const express = require('express');
const router = express.Router();
const corregimientos = require('../services/corregimientos');

router.get('/municipio/:idMunicipio', async function(req, res, next) {
  try {
    res.json(await corregimientos.getCorregimientosMunicipio(req.query.page,req.params.idMunicipio));
  } catch (err) {
    console.error(`Error al traer los corregimientos del Municipio `, err.message);
    next(err);
  }
});

router.get('/obtener', async function(req, res, next) {
  try {
    res.json(await corregimientos.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los corregimientos `, err.message);
    next(err);
  }
});

router.post('/registrar', async function(req, res, next) {
    try {
      res.json(await corregimientos.create(req.body));
    } catch (err) {
      console.error(`Error creando el corregimiento`, err.message);
      next(err);
    }
  });

router.put('/actualizar/:id', async function(req, res, next) {
    try {
      res.json(await corregimientos.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar el corregimiento`, err.message);
      next(err);
    }
});

router.delete('/eliminar/:id', async function(req, res, next) {
    try {
      res.json(await corregimientos.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar el corregimiento`, err.message);
      next(err);
    }
  });

module.exports = router;