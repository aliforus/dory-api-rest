const express = require('express');
const router = express.Router();
const tipos_eventos = require('../services/tipos_eventos');


router.get('/', async function(req, res, next) {
  try {
    res.json(await tipos_eventos.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los tipos de eventos`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await tipos_eventos.create(req.body));
    } catch (err) {
      console.error(`Error registrando tipo de evento`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await tipos_eventos.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar el tipo de evento`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await tipos_eventos.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar tipo de evento`, err.message);
      next(err);
    }
  });

module.exports = router;