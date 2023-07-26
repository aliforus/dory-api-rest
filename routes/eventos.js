const express = require('express');
const router = express.Router();
const eventos = require('../services/eventos');


router.get('/todos', async function(req, res, next) {
  try {
    res.json(await eventos.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los eventos`, err.message);
    next(err);
  }
});

router.get('/capacitaciones/buscar/:cadena', async function(req, res, next) {
  try {
    res.json(await eventos.getEventosCapacitaciones(req.query.page,req.params.cadena));
  } catch (err) {
    console.error(`Error al traer los Eventos de Capacitaciones`, err.message);
    next(err);
  }
});

router.get('/congresos/buscar/:cadena', async function(req, res, next) {
  try {
    res.json(await eventos.getEventosCongresos(req.query.page,req.params.cadena));
  } catch (err) {
    console.error(`Error al traer los Eventos de Congresos`, err.message);
    next(err);
  }
});

router.get('/diplomados/buscar/:cadena', async function(req, res, next) {
  try {
    res.json(await eventos.getEventosDiplomados(req.query.page,req.params.cadena));
  } catch (err) {
    console.error(`Error al traer los Eventos de Diplomados`, err.message);
    next(err);
  }
});

router.get('/cursos/buscar/:cadena', async function(req, res, next) {
  try {
    res.json(await eventos.getEventosCursos(req.query.page,req.params.cadena));
  } catch (err) {
    console.error(`Error al traer los Eventos de Cursos`, err.message);
    next(err);
  }
});

router.get('/seminarios/buscar/:cadena', async function(req, res, next) {
  try {
    res.json(await eventos.getEventosSeminarios(req.query.page,req.params.cadena));
  } catch (err) {
    console.error(`Error al traer los Eventos de Seminarios`, err.message);
    next(err);
  }
});

router.get('/talleres/buscar/:cadena', async function(req, res, next) {
  try {
    res.json(await eventos.getEventosTalleres(req.query.page,req.params.cadena));
  } catch (err) {
    console.error(`Error al traer los Eventos de Talleres`, err.message);
    next(err);
  }
});

router.get('/tipos/buscar/:tipo', async function(req, res, next) {
  try {
    res.json(await eventos.getEventosTipos(req.query.page,req.params.tipo));
  } catch (err) {
    console.error(`Error al traer los Eventos por tipo`, err.message);
    next(err);
  }
});

router.post('/', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await eventos.create(req.body,token));
    } catch (err) {
      console.error(`Error creando el evento`, err.message);
      next(err);
    }
  });


router.put('/:id', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await eventos.update(req.params.id, req.body,token));
    } catch (err) {
      console.error(`Error al actualizar el evento`, err.message);
      next(err);
    }
});


router.delete('/:id', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await eventos.remove(req.params.id,token));
    } catch (err) {
      console.error(`Error al borrar el evento`, err.message);
      next(err);
    }
  });

  router.put('/update/parcial/evento/:idEvento', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await eventos.updateParcialEvento(req.params.idEvento, req.body,token));
    } catch (err) {
      console.error(`Error al actualizar el evento`, err.message);
      next(err);
    }
});

module.exports = router;