const express = require('express');
const router = express.Router();
const foros = require('../services/foros');

router.get('/obtener/todas/preguntas', async function(req, res, next) {
  try {
    res.json(await foros.getPreguntasForos());
  } catch (err) {
    console.error(`Error al traer todas las preguntas del sistema`, err.message);
    next(err);
  }
});

router.get('/obtener/preguntas/usuario/:idusuario', async function(req, res, next) {
  try {
        res.json(await foros.getPreguntasUsuario(req.params.idusuario));
  } catch (err) {
        console.error(`Error al traer las preguntas del usuario`, err.message);
        next(err);
  }
});

router.get('/obtener/respuestas/pregunta/:idpregunta', async function(req, res, next) {
  try {
    res.json(await foros.getRespuestasPregunta(req.params.idpregunta));
  } catch (err) {
    console.error(`Error al traer las respuestas a pregunta del foro`, err.message);
    next(err);
  }
});

router.get('/obtener/todas/respuestas', async function(req, res, next) {
  try {
    res.json(await foros.getTodasRespuestas());
  } catch (err) {
    console.error(`Error al traer las respuestas de todos los foros`, err.message);
    next(err);
  }
});


router.post('/registrar/respuesta', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await foros.registrarRespuesta(req.body, token));
    } catch (err) {
      console.error(`Error al registrar la respuesta de la pregunta del foro`, err.message);
      next(err);
    }
  });

  router.post('/registrar/pregunta', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await foros.registrarPregunta(req.body, token));
    } catch (err) {
      console.error(`Error al registrar la pregunta del foro`, err.message);
      next(err);
    }
  });


router.put('/actualizar/pregunta/:idpregunta', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await foros.actualizarPregunta(req.params.idpregunta, req.body, token));
    } catch (err) {
      console.error(`Error al actualizar la pregunta del foro`, err.message);
      next(err);
    }
});

router.put('/actualizar/respuesta/:idrespuesta', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await foros.actualizarRespuesta(req.params.idrespuesta, req.body, token));
  } catch (err) {
    console.error(`Error al actualizar la respuesta del foro`, err.message);
    next(err);
  }
});

router.delete('/eliminar/pregunta/:idpregunta', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await foros.eliminarPregunta(req.params.idpregunta, token));
    } catch (err) {
      console.error(`Error al borrar la pregunta del foro`, err.message);
      next(err);
    }
  });

  router.delete('/eliminar/respuesta/:idrespuesta', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await foros.eliminarRespuesta(req.params.idrespuesta, token));
    } catch (err) {
      console.error(`Error al borrar la respuesta de la pregunta del foro`, err.message);
      next(err);
    }
  });

  router.put('/actualizar/fotos/pregunta/:idpregunta', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await foros.actualizarFotosPregunta(req.params.idpregunta, req.body, token));
    } catch (err) {
      console.error(`Error al actualizar las fotos de la pregunta en foro`, err.message);
      next(err);
    }
});


router.get('/detalle/pregunta/:idpregunta', async function(req, res, next) {
  try {    
    res.json(await foros.obtenerDetallePregunta(req.params.idpregunta));
  } catch (err) {
    console.error(`Error al traer el detalle de la pregunta `, err.message);
    next(err);
  }
});

router.put('/actualizar/parcial/respuesta/:idrespuesta', async function(req, res, next) {
  try {
       var token=req.headers.authorization;
       res.json(await foros.updateParcialRespuesta(req.params.idrespuesta, req.body,token));
  } catch (err) {
       console.error(`Error al actualizar la respuesta parcialmente`, err.message);
       next(err);
  }
});

router.put('/actualizar/fotos/respuesta/:idrespuesta', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await foros.actualizarFotosRespuesta(req.params.idrespuesta, req.body, token));
  } catch (err) {
    console.error(`Error al actualizar las fotos de la respuesta`, err.message);
    next(err);
  }
});

module.exports = router;