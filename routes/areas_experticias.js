const express = require('express');
const router = express.Router();
const areas_experticias = require('../services/areas_experticias');

router.get('/obtener', async function(req, res, next) {
  try {
    res.json(await areas_experticias.getAreasExperticia(req.query.page));
  } catch (err) {
    console.error(`Error al traer las areas_experticias`, err.message);
    next(err);
  }
});

router.post('/registrar', async function(req, res, next) {
    try {
      res.json(await areas_experticias.createAreaExperticia(req.body));
    } catch (err) {
      console.error(`Error creando area de experticia`, err.message);
      next(err);
    }
  });

router.put('/actualizar/:id', async function(req, res, next) {
    try {
      res.json(await areas_experticias.updateAreaExperticia(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar area de experticia`, err.message);
      next(err);
    }
});

router.delete('/eliminar/:id', async function(req, res, next) {
    try {
      res.json(await areas_experticias.removeAreaExperticia(req.params.id));
    } catch (err) {
      console.error(`Error al borrar area de experticia`, err.message);
      next(err);
    }
  });

module.exports = router;