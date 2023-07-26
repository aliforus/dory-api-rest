const express = require('express');
const router = express.Router();
const especies = require('../services/especies');


router.get('/', async function(req, res, next) {
  try {
    res.json(await especies.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las especies`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await especies.create(req.body));
    } catch (err) {
      console.error(`Error creando la especie`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await especies.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar la especie`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await especies.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar la especie`, err.message);
      next(err);
    }
  });

module.exports = router;