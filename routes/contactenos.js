const express = require('express');
const router = express.Router();
const contactenos = require('../services/contactenos');


router.post('/', async function(req, res, next) {
  try {
         res.json(await contactenos.contactenos(req.body));
      } catch (err) {
         console.error(`Error al enviar los datos del formulario`, err.message);
    next(err);
  }
});

module.exports = router;