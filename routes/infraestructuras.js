const express = require('express');
const router = express.Router();
const infraestructuras = require('../services/infraestructuras');


router.get('/', async function(req, res, next) {
  try {
    res.json(await infraestructuras.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las infraestructuras`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
      res.json(await infraestructuras.create(req.body));
    } catch (err) {
      console.error(`Error creando la infraestructura`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      res.json(await infraestructuras.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar la infraestructura`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      res.json(await infraestructuras.remove(req.params.id));
    } catch (err) {
      console.error(`Error al borrar la infraestructura`, err.message);
      next(err);
    }
  });

module.exports = router;