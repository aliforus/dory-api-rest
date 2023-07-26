const express = require('express');
const router = express.Router();
const etnias = require('../services/etnias');

router.get('/obtener', async function(req, res, next) {
  try {
    res.json(await etnias.getEtnias(req.query.page));
  } catch (err) {
    console.error(`Error al traer las etnias`, err.message);
    next(err);
  }
});

router.post('/registrar', async function(req, res, next) {
    try {
      res.json(await etnias.createEtnia(req.body));
    } catch (err) {
      console.error(`Error creando la etnia`, err.message);
      next(err);
    }
  });

router.put('/actualizar/:idEtnia', async function(req, res, next) {
    try {
      res.json(await etnias.updateEtnia(req.params.idEtnia, req.body));
    } catch (err) {
      console.error(`Error al actualizar la etnia`, err.message);
      next(err);
    }
});

router.delete('/eliminar/:idEtnia', async function(req, res, next) {
    try {
      res.json(await etnias.removeEtnia(req.params.idEtnia));
    } catch (err) {
      console.error(`Error al borrar la etnia`, err.message);
      next(err);
    }
  });

module.exports = router;