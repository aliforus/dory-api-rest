const express = require('express');
const router = express.Router();
const tipos_novedades = require('../services/tipos_novedades');


router.get('/', async function(req, res, next) {
  try {
    res.json(await tipos_novedades.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los tipos de novedades`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await tipos_novedades.create(req.body));
    } catch (err) {
      console.error(`Error registrando tipo de novedad`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await tipos_novedades.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar el tipo de novedad`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await tipos_novedades.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar tipo de novedad`, err.message);
      next(err);
    }
  });

module.exports = router;