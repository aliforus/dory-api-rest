const express = require('express');
const router = express.Router();
const slider = require('../services/slider');

router.get('/obtener', async function(req, res, next) {
  try {
    res.json(await slider.obtenerSlide());
  } catch (err) {
    console.error(`Error al obtener los slid`, err.message);
    next(err);
  }
});

router.post('/crear', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await slider.crearSlide(req.body,token));
  } catch (err) {
    console.error(`Error al crear el slider`, err.message);
    next(err);
  }
});

router.put('/actualizar/:idSlide', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await slider.actualizarSlide(req.params.idSlide,req.body,token));
    } catch (err) {
      console.error(`Error al actualizar el slider`, err.message);
      next(err);
    }
});

router.delete('/delete/slide/:idSlide', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await slider.eliminarSlide(req.params.idSlide,token));
  } catch (err) {
    console.error(`Error al eliminar el slid`, err.message);
    next(err);
  }
});

router.put('/update/carrusel/slider', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await slider.actualizarCarruselSlide(req.body,token));
  } catch (err) {
    console.error(`Error al actualizar los slider`, err.message);
    next(err);
  }
});

router.put('/update/parcial/slide/:idSlide', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await slider.updateParcialSlide(req.params.idSlide,req.body,token));
  } catch (err) {
    console.error(`Error al actualizar parcialmente el slid`, err.message);
    next(err);
  }
});

router.put('/update/time/slider', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await slider.updateTimeSlider(req.body,token));
  } catch (err) {
    console.error(`Error al actualizar el tiempo del slider`, err.message);
    next(err);
  }
});

module.exports = router;