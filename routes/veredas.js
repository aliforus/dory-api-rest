const express = require('express');
const router = express.Router();
const veredas = require('../services/veredas');

router.get('/municipio/:idMunicipio', async function(req, res, next) {
  try {
    res.json(await veredas.getVeredasMunicipio(req.query.page,req.params.idMunicipio));
  } catch (err) {
    console.error(`Error al traer las veredas del Municipio `, err.message);
    next(err);
  }
});

router.get('/', async function(req, res, next) {
  try {
    res.json(await veredas.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las veredas `, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await veredas.create(req.body));
    } catch (err) {
      console.error(`Error creando la vereda`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await veredas.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar la vereda`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await veredas.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar la vereda`, err.message);
      next(err);
    }
  });

module.exports = router;