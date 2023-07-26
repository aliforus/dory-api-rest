const express = require('express');
const router = express.Router();
const tipos_usuarios = require('../services/tipos_usuarios');


router.get('/', async function(req, res, next) {
  try {
    res.json(await tipos_usuarios.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los tipos de usuarios`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await tipos_usuarios.create(req.body));
    } catch (err) {
      console.error(`Error creando el tipo de usuario`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await tipos_usuarios.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar el tipo de usuario`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await tipos_usuarios.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar el tipo de usuario`, err.message);
      next(err);
    }
  });

  router.delete('/', async function(req, res, next) {
    try {
      res.status(400).json({'message':"No se puede emininar usuario sin su identificador" });
    } catch (err) {    
        next(err);
    }
  });

  router.put('/', async function(req, res, next) {
    try {
      res.status(400).json({'message':"No se puede actualizar usuario sin su identificador" });
    } catch (err) {    
        next(err);
    }
  });

module.exports = router;