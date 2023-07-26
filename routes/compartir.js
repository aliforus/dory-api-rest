const express = require('express');
const router = express.Router();
const compartir = require('../services/compartir');


router.post('/', async function(req, res, next) {
  try {
         res.json(await compartir.compartir(req.body));
      } catch (err) {
         console.error(`Error al compartir enlace`, err.message);
    next(err);
  }
});

module.exports = router;