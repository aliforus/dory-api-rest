const express = require('express');
const router = express.Router();
const subregiones = require('../services/subregiones');


router.get('/', async function(req, res, next) {
  try {
    res.json(await subregiones.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las subregiones`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await subregiones.create(req.body));
    } catch (err) {
      console.error(`Error creando subregión`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await subregiones.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar subregión`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await subregiones.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar subregión`, err.message);
      next(err);
    }
  });

module.exports = router;