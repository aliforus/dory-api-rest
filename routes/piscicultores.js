const express = require('express');
const router = express.Router();
const piscicultores = require('../services/piscicultores');

router.get('/todos', async function(req, res, next) {
  try {
    res.json(await piscicultores.getPiscicultoresTodos(req.query.page));
  } catch (err) {
    console.error(`Error al traer los piscicultores del sistema `, err.message);
    next(err);
  }
});

router.get('/municipio/:idMunicipio', async function(req, res, next) {
  try {
    res.json(await piscicultores.getPiscicultoresMunicipio(req.query.page,req.params.idMunicipio));
  } catch (err) {
    console.error(`Error al traer los piscicultores de los municipios `, err.message);
    next(err);
  }
});

router.get('/departamento/:idDepartamento', async function(req, res, next) {
  try {
    res.json(await piscicultores.getPiscicultoresDepartamento(req.query.page,req.params.idDepartamento));
  } catch (err) {
    console.error(`Error al traer los Piscicultores del departamento`, err.message);
    next(err);
  }
});

router.get('/asociacion/:nit', async function(req, res, next) {
  try {
    res.json(await piscicultores.getPiscicultoresAsociacion(req.query.page,req.params.nit));
  } catch (err) {
    console.error(`Error al traer los Piscicultores de las asociaciones `, err.message);
    next(err);
  }
});

module.exports = router;