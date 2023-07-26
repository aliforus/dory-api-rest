const express = require('express');
const router = express.Router();
const buscarPiscicultores = require('../services/buscar-piscicultores');


router.get('/:cadena', async function(req, res, next) {
  try {
    res.json(await buscarPiscicultores.getMultiple(req.query.page,req.params.cadena));
  } catch (err) {
    console.error(`Error al traer los piscicultores con esa cadena `, err.message);
    next(err);
  }
});


module.exports = router;