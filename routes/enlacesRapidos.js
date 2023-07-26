const express = require('express');
const router = express.Router();
const enlacesRapidos = require('../services/enlacesRapidos');

router.get('/obtener', async function(req, res, next) {
  try {
    res.json(await enlacesRapidos.obtenerEnlaceR());
  } catch (err) {
    console.error(`Error al obtener los enlaces rápidos `, err.message);
    next(err);
  }
});

router.post('/crear', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await enlacesRapidos.crearEnlaceR(req.body,token));
  } catch (err) {
    console.error(`Error al crear el enlace rápido`, err.message);
    next(err);
  }
});

router.put('/actualizar/:idEnlaceRapido', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await enlacesRapidos.actualizarEnlaceR(req.params.idEnlaceRapido,req.body,token));
    } catch (err) {
      console.error(`Error al actualizar el enlace rápido`, err.message);
      next(err);
    }
});

router.delete('/eliminar/enlaceRapido/:idEnlaceRapido', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await enlacesRapidos.eliminarEnlaceR(req.params.idEnlaceRapido,token));
  } catch (err) {
    console.error(`Error al eliminar el enlace rápido`, err.message);
    next(err);
  }
});

router.put('/update/enlacesRapidos', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await enlacesRapidos.actualizarCarruselEnlaceR(req.body,token));
  } catch (err) {
    console.error(`Error al actualizar carrusel de los enlaces rápidos`, err.message);
    next(err);
  }
});



module.exports = router;