const express = require('express');
const router = express.Router();
const modalidades = require('../services/modalidades');


router.get('/', async function(req, res, next) {
  try {
    res.json(await modalidades.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las modalidades`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await modalidades.create(req.body));
    } catch (err) {
      console.error(`Error creando la modalidad`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await modalidades.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar la modalidad`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await modalidades.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar la modalidad`, err.message);
      next(err);
    }
  });

module.exports = router;