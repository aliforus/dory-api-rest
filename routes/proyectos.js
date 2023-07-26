const express = require('express');
const router = express.Router();
const proyectos = require('../services/proyectos');


router.get('/', async function(req, res, next) {
  try {
    res.json(await proyectos.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los proyectos `, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await proyectos.create(req.body));
    } catch (err) {
      console.error(`Error creando el proyecto`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await proyectos.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar el proyecto`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await proyectos.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar el proyecto`, err.message);
      next(err);
    }
  });

module.exports = router;