const express = require('express');
const router = express.Router();
const mensajes = require('../services/mensajes');


router.get('/', async function(req, res, next) {
  try {
    res.json(await mensajes.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los mensajes`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await mensajes.create(req.body));
    } catch (err) {
      console.error(`Error creando el mensaje`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await mensajes.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar el mensaje`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await mensajes.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar el mensaje`, err.message);
      next(err);
    }
  });

module.exports = router;