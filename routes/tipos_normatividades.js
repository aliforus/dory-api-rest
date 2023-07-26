const express = require('express');
const router = express.Router();
const tipos_normatividades = require('../services/tipos_normatividades');


router.get('/', async function(req, res, next) {
  try {
    res.json(await tipos_normatividades.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los tipos de normatividades`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await tipos_normatividades.create(req.body));
    } catch (err) {
      console.error(`Error registrando tipo de normatividad`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await tipos_normatividades.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar el tipo de normatividad`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await tipos_normatividades.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar tipo de normatividad`, err.message);
      next(err);
    }
  });

module.exports = router;