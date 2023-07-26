const express = require('express');
const router = express.Router();
const departamentos = require('../services/departamentos');


router.get('/', async function(req, res, next) {
  try {
    res.json(await departamentos.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los departamentos `, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await departamentos.create(req.body));
    } catch (err) {
      console.error(`Error creando el departamento`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await departamentos.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar el departamento`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await departamentos.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar el departamento`, err.message);
      next(err);
    }
  });

module.exports = router;