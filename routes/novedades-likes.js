const express = require('express');
const router = express.Router();
const novedades = require('../services/novedades');

router.post('/like/:id', async function(req, res, next) {
  try { 
        var token=req.headers.authorization;
        res.json(await novedades.agregarLikes(req.params.id,token));
  } catch (err) {
    console.error(`Error al agregar like a la novedad.`, err.message);
    next(err);
  }
});

router.delete('/dislike/:id', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await novedades.eliminarLikes(req.params.id,token));
  } catch (err) {
    console.error(`Error al eliminar like a novedad.`, err.message);
    next(err);
  }
});

module.exports = router;