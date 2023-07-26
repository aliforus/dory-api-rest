const express = require('express');
const router = express.Router();
const resenas = require('../services/resenas');

router.get('/granja/:idGranja', async function(req, res, next) {
  try {
        res.json(await resenas.getResenasGranja(req.query.page,req.params.idGranja));
  } catch (err) {
        console.error(`Error al traer las reseñas de la granja `, err.message);
        next(err);
  }
});

router.get('/', async function(req, res, next) {
  try {
    res.json(await resenas.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer las resenas del usuario  `, err.message);
    next(err);
  }
});

router.get('/usuario/granja/:idGranja', async function(req, res, next) {
  try {
    res.json(await resenas.getResenaUsuario(req.headers.authorization, req.params.idGranja));
  } catch (err) {
    console.error(`Error al traer las resena del usuario de la granja ${req.query.idGranja}`, err.message);
    next(err);
  }
});


router.post('/', async function(req, res, next) {
    try {
          var token=req.headers.authorization;
          res.json(await resenas.create(req.body,token));
    } catch (err) {
      console.error(`Error creando la reseña del usuario `, err.message);
      next(err);
    }
  });


router.put('/:idResena', async function(req, res, next) {
    try {
          var token=req.headers.authorization;
          res.json(await resenas.update(req.params.idResena, req.body,token));
    } catch (err) {
          console.error(`Error al actualizar la reseña del usuario`, err.message);
          next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await resenas.remove(req.params.id, token));
    } catch (err) {
      console.error(`Error al borrar la reseña del usuario`, err.message);
      next(err);
    }
  });

module.exports = router;