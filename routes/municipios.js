const express = require('express');
const router = express.Router();
const municipios = require('../services/municipios');

router.get('/:id_municipio', async function(req, res, next) {
  try {
    res.json(await municipios.getMunicipio(req.query.page, req.params.id_municipio));
  } catch (err) {
    console.error(`Error al traer los detalles de ese municipio `, err.message);
    next(err);
  }
});

router.get('/departamento/:idDepartamento', async function(req, res, next) {
  try {
    res.json(await municipios.GetMunicipioDelDepartamento(req.query.page,req.params.idDepartamento));
  } catch (err) {
    console.error(`Error al traer los municipios del departamento `, err.message);
    next(err);
  }
});

router.get('/', async function(req, res, next) {
  try {
    res.json(await municipios.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los municipios `, err.message);
    next(err);
  }
});

router.post('/', async function(req, res, next) {
    try {
      res.json(await municipios.create(req.body));
    } catch (err) {
      console.error(`Error creando el municipio`, err.message);
      next(err);
    }
  });

router.put('/:id', async function(req, res, next) {
    try {
      res.json(await municipios.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error al actualizar el municipio`, err.message);
      next(err);
    }
});

router.delete('/:idMunicipio', async function(req, res, next) {
    try {
      res.json(await municipios.remove(req.params.idMunicipio));
    } catch (err) {
      console.error(`Error al borrar el municipio`, err.message);
      next(err);
    }
  });

  router.get('/consumo/especies/municipio/:idMunicipio', async function(req, res, next) {
    try {
      res.json(await municipios.getConsumosEspecies(req.params.idMunicipio));
    } catch (err) {
      console.error(`Error al traer los consumos del municipio `, err.message);
      next(err);
    }
  });

  router.get('/consumo/especies/departamento', async function(req, res, next) {
    try {
      res.json(await municipios.getConsumosEspeciesDepartamento(req.query));
    } catch (err) {
      console.error(`Error al traer el total del consumo de especies en el departamento  `, err.message);
      next(err);
    }
  });

module.exports = router;