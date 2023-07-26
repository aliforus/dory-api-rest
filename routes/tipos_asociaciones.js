const express = require('express');
const router = express.Router();
const tipos_asociaciones = require('../services/tipos_asociaciones');


router.get('/', async function(req, res, next) {
  try {
    res.json(await tipos_asociaciones.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los tipos de asociaciones`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await tipos_asociaciones.create(req.body));
    } catch (err) {
      console.error(`Error registrando tipo de asociación`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await tipos_asociaciones.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar el tipo de asociación`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await tipos_asociaciones.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar tipo de asociación`, err.message);
      next(err);
    }
  });

module.exports = router;