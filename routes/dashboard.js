const express = require('express');
const router = express.Router();
const dashboard = require('../services/dashboard');

router.get('/', async function(req, res, next) {
  try {
    res.json(await dashboard.getDashboard());
  } catch (err) {
    console.error(`Error en el dashboard de Dory `, err.message);
    next(err);
  }
});

module.exports = router;