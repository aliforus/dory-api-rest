const express = require('express');
const router = express.Router();
const search = require('../services/search');

router.get('/', async function(req, res, next) {
  try {
    res.json(await search.getIndex());
  } catch (err) {
    console.error(`Error al obtener los index`, err.message);
    next(err);
  }
});

router.post('/init', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await search.createIndex(req.body,token));
  } catch (err) {
    console.error(`Error al registrar index`, err.message);
    next(err);
  }
});

router.post('/add/entries', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await search.addCreateIndex(req.body,token));
  } catch (err) {
    console.error(`Error al registrar index`, err.message);
    next(err);
  }
});

router.delete('/delete/:idIndex', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await search.deleteIndex(req.params.idIndex,token));
  } catch (err) {
    console.error(`Error al eliminar search de index`, err.message);
    next(err);
  }
});

router.put('/update/parcial/:idIndex', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await search.updateParcialIndex(req.params.idIndex,req.body,token));
  } catch (err) {
    console.error(`Error al acualizar el search del index`, err.message);
    next(err);
  }
});

module.exports = router;