const express = require('express');
const router = express.Router();
const sectores = require('../services/sectores');


router.get('/', async function(req, res, next) {
  try {
    res.json(await sectores.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los sectores`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await sectores.create(req.body));
    } catch (err) {
      console.error(`Error creando el sector`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await sectores.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar el sector`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await sectores.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar el sector`, err.message);
      next(err);
    }
  });

module.exports = router;