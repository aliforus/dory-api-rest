const express = require('express');
const router = express.Router();
const sexos = require('../services/sexos');

router.get('/obtener', async function(req, res, next) {
  try {
    res.json(await sexos.getSexos(req.query.page));
  } catch (err) {
    console.error(`Error al traer los sexos de los usuarios`, err.message);
    next(err);
  }
});

router.post('/registrar', async function(req, res, next) {
    try {
      res.json(await sexos.createSexo(req.body));
    } catch (err) {
      console.error(`Error creando el sexo del usuario`, err.message);
      next(err);
    }
  });

router.put('/actualizar/:idSexo', async function(req, res, next) {
    try {
      res.json(await sexos.updateSexo(req.params.idSexo, req.body));
    } catch (err) {
      console.error(`Error al actualizar el sexo del usuario`, err.message);
      next(err);
    }
});

router.delete('/eliminar/:idSexo', async function(req, res, next) {
    try {
      res.json(await sexos.removeSexo(req.params.idSexo));
    } catch (err) {
      console.error(`Error al borrar el sexo del usuario`, err.message);
      next(err);
    }
  });

module.exports = router;