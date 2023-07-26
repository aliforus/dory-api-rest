const express = require('express');
const router = express.Router();
const pescadores = require('../services/pescadores');

router.get('/todos', async function(req, res, next) {
  try {
    res.json(await pescadores.getPescadoresTodos(req.query.page));
  } catch (err) {
    console.error(`Error al traer los Pescadores del sistemas `, err.message);
    next(err);
  }
});

router.get('/municipio/:idMunicipio', async function(req, res, next) {
  try {
    res.json(await pescadores.getPescadoresMunicipio(req.query.page,req.params.idMunicipio));
  } catch (err) {
    console.error(`Error al traer los Pescadores de los municipios `, err.message);
    next(err);
  }
});

router.get('/departamento/:idDepartamento', async function(req, res, next) {
  try {
    res.json(await pescadores.getPescadoresDepartamento(req.query.page,req.params.idDepartamento));
  } catch (err) {
    console.error(`Error al traer los Pescadores del departamento`, err.message);
    next(err);
  }
});

router.get('/asociacion/:nit', async function(req, res, next) {
  try {
    res.json(await pescadores.getPescadoresAsociacion(req.query.page,req.params.nit));
  } catch (err) {
    console.error(`Error al traer los Pescadores de las asociaciones `, err.message);
    next(err);
  }
});

module.exports = router;