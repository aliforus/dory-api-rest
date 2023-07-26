const express = require('express');
const router = express.Router();
const chat = require('../services/chat');

router.get('/mensajes/privados/:idUser2', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await chat.getMensajesPrivados(token, req.params.idUser2));
  } catch (err) {
    console.error(`Error al traer los mensajes privados del chat`, err.message);
    next(err);
  }
});

router.get('/ultimos/', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await chat.getUltimos(token));
  } catch (err) {
    console.error(`Error al traer los ultimos mensajes`, err.message);
    next(err);
  }
});

router.get('/unreads/', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await chat.getUnreads(token));
  } catch (err) {
    console.error(`Error al traer los contadores de mensajes no leidos`, err.message);
    next(err);
  }
});

//coloca todos los mensajes no leidos como leidos en un chat determnado
router.put('/set/readed/all/:usuarioEmisorId', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await chat.setReadedAll(token,req.params.usuarioEmisorId));
  } catch (err) {
    console.error(`Error al setear los mensajes como leidos`, err.message);
    next(err);
  }
});

module.exports = router;