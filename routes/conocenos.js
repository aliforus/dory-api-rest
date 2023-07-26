const express = require('express');
const router = express.Router();
const conocenos = require('../services/conocenos');

router.get('/obtener', async function(req, res, next) {
  try {
    res.json(await conocenos.getConocenos(req.query.page));
  } catch (err) {
    console.error(`Error al traer la información`, err.message);
    next(err);
  }
});

router.post('/registrar', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await conocenos.registrarConocenos(req.body,token));
    } catch (err) {
      console.error(`Error al registrar la información`, err.message);
      next(err);
    }
  });

router.put('/actualizar/:id', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await conocenos.actualizarConocenos(req.params.id, req.body,token));
    } catch (err) {
      console.error(`Error al actualizar la información`, err.message);
      next(err);
    }
});

router.delete('/eliminar/:id', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await conocenos.eliminarConocenos(req.params.id,token));
    } catch (err) {
      console.error(`Error al borrar la información`, err.message);
      next(err);
    }
  });

module.exports = router;