const express = require('express');
const router = express.Router();
const topalert = require('../services/topalert');

router.get('/', async function(req, res, next) {
  try {
    res.json(await topalert.getTopAlert());
  } catch (err) {
    console.error(`Error al obtener el top alert`, err.message);
    next(err);
  }
});

router.put('/total', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await topalert.updateTopAlert(req.body,token));
  } catch (err) {
    console.error(`Error al actualizar el top alert`, err.message);
    next(err);
  }
});

router.put('/parcial', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await topalert.updateParcialTopAlert(req.body,token));
  } catch (err) {
    console.error(`Error al actualizar el top alert parcialmente`, err.message);
    next(err);
  }
});

module.exports = router;