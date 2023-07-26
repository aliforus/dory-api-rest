const express = require('express');
const router = express.Router();
const fotos = require('../services/fotos');


router.get('/', async function(req, res, next) {
  try {
    res.json(await fotos.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las fotos `, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await fotos.create(req.body));
    } catch (err) {
      console.error(`Error creando la foto`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await fotos.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar la foto`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await fotos.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar la foto`, err.message);
      next(err);
    }
  });

module.exports = router;