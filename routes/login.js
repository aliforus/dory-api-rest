const express = require('express');
const router = express.Router();
const login = require('../services/login');

router.post('/', async function(req, res, next) {
    try {
      res.json(await login.createLogin(req.body));
    } catch (err) {
      console.error(`Error al loguear el usuario`, err.message);
      next(err);
    }
  });

router.post('/google', async function(req, res, next) {
  try {
    res.json(await login.loginWithGoogle(req));
  } catch (err) {
    console.error(`Error al loguear el usuario con google`, err.message);
    next(err);
  }
});

    
module.exports = router;