const express = require('express');
const router = express.Router();
const buscarPescadores = require('../services/buscar-pescadores');


router.get('/:cadena', async function(req, res, next) {
  try {
    res.json(await buscarPescadores.getMultiple(req.query.page,req.params.cadena));
  } catch (err) {
    console.error(`Error al traer los pescadores con esa cadena `, err.message);
    next(err);
  }
});


module.exports = router;