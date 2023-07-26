const express = require('express');
const router = express.Router();
const buscarGranja = require('../services/buscar-granja');

router.get('/cadena/:cadena', async function(req, res, next) {
  try {
    res.json(await buscarGranja.buscarGranjaCadena(req.query.page,req.params.cadena));
  } catch (err) {
    console.error(`Error al traer las granjas con esa cadena `, err.message);
    next(err);
  }
});

router.get('/municipio', async function(req, res, next) {
  try {
    res.json(await buscarGranja.buscarGranjaMunicipio(req.query.page,req.query.idMunicipio,req.query.cadena));
  } catch (err) {
    console.error(`Error al traer al buscar granjas por municipio `, err.message);
    next(err);
  }
});

module.exports = router;