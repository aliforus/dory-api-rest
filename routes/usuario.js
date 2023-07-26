const express = require('express');
const router = express.Router();
const usuario = require('../services/usuario');


router.get('/id/:idUser', async function(req, res, next) {
  try {
    res.json(await usuario.getUserId(req.query.page,req.params.idUser));
  } catch (err) {
    console.error(`Error al traer el usuario`, err.message);
    next(err);
  }
});/* Get del usuario ingresado */

router.get('/all', async function(req, res, next) {
  try {
    res.json(await usuario.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios`, err.message);
    next(err);
  }
});/*De usuarios Múltiples */

router.post('/create', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await usuario.create(req.body,token));
  } catch (err) {
    console.error(`Error al registrar el usuario`, err.message);
    next(err);
  }
});/* Create del usuario*/

router.put('/total/:idUser', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await usuario.update(req.params.idUser, req.body,token));
  } catch (err) {
    console.error(`Error al actualizar el usuario`, err.message);
    next(err);
  }
});/* Update usuario */

router.put('/update/password', async function(req, res, next) {
  try {
    res.json(await usuario.updatePassword(req.body));
  } catch (err) {
    console.error(`Error al actualizar la contraseña del usuario`, err.message);
    next(err);
  }
});/* Update del password de usuario */

router.post('/recover/password', async function(req, res, next) {
  try {
    res.json(await usuario.recoverPassword(req.body));
  } catch (err) {
    console.error(`Error al recuperar la contraseña del usuario`, err.message);
    next(err);
  }
});/* Recuperar password de usuario */

router.put('/parcial/:idUser', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await usuario.updateParcialUsuario(req.params.idUser, req.body, token));
  } catch (err) {
    console.error(`Error al actualizar el usuario`, err.message);
    next(err);
  }
});/* Actualización parcial de usuario */

router.put('/change/password', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.changePassword(req.body,token));
  } catch (err) {
        console.error(`Error al modificar la contraseña del usuario`, err.message);
        next(err);
  }
});/* Cambio de password de usuario */

router.put('/verify/account', async function(req, res, next) {
  try {
        res.json(await usuario.verifyAccount(req.body));
  } catch (err) {
        console.error(`Error al verificar el usuario por el email`, err.message);
        next(err);
  }
});/* Verificar Cuenta de usuario */

router.delete('/:idUser', async function(req, res, next) {
  try {
    var token=req.headers.authorization;
    res.json(await usuario.remove(req.params.idUser,token));
  } catch (err) {
    console.error(`Error al borrar el usuario`, err.message);
    next(err);
  }
});/* Eliminar Cuenta de usuario */

router.get('/misconsumos', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.misConsumos(token,req.query));
  } catch (err) {
        console.error(`Error al mostrar los consumos del usuario`, err.message);
        next(err);
  }
});/* Consumos del usuario */

router.put('/update/misconsumos', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.updateMisconsumos(req.body,token));
  } catch (err) {
        console.error(`Error al actualizar los consumos del usuario`, err.message);
        next(err);
  }
});/* Actualización de Consumos del usuario */

router.get('/pescador/asociacion/:nit', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.getPescadoresAsociacion(req.params.nit,token));
  } catch (err) {
        console.error(`Error al retornar los pescadores de la asociación ingresada`, err.message);
        next(err);
  }
}); /* Obtener todos los pescadores de la asociacion del usuario */

router.get('/piscicultor/asociacion/:nit', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.getPiscicultoresAsociacion(req.params.nit,token));
  } catch (err) {
        console.error(`Error al retornar los piscicultores de la asociación ingresada`, err.message);
        next(err);
  }
}); /* Obtener todos los piscicultores de la asociacion del usuario */

router.get('/solicitudes/noaceptadas/porusuario', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.getSolicitudesNoaceptadasPorUsuario(token));
  } catch (err) {
        console.error(`Error al retornar las solicitudes no aceptadas del usuario`, err.message);
        next(err);
  }
});/*Solicitudes no aceptadas por el usuario*/

/*Envia todas las solicitudes que han llegado a todas las asociaciones que él representa*/
router.get('/solicitudes/noaceptadas/representante', async function(req, res, next) {
  try {
        var token=req.headers.authorization;
        res.json(await usuario.getSolicitudesNoAceptadasTodasAsociacionesRep(token));
  } catch (err) {
        console.error(`Error al retornar las solicitudes no aceptadas de las asociaciones del representante`, err.message);
        next(err);
  }
}); /*Solicitudes no aceptadas por el representante*/

router.get('/proveedores/todos', async function(req, res, next) {
  try {
    res.json(await usuario.getUsersProveedores(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios de tipo proveedor`, err.message);
    next(err);
  }
}); /*Obtener todos los usuarios proveedores*/

router.get('/investigadores/todos', async function(req, res, next) {
  try {
    res.json(await usuario.getUsersInvestigadoresExpertos(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios de tipo investigador experto`, err.message);
    next(err);
  }
});/*Obtener todos los usuarios investigadores*/

router.get('/transportadores/todos', async function(req, res, next) {
  try {
    res.json(await usuario.getUsersTransportadores(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios de tipo transportador`, err.message);
    next(err);
  }
});/*Obtener todos los usuarios transportadores*/

router.get('/consumidores/todos', async function(req, res, next) {
  try {
    res.json(await usuario.getUsersConsumidores(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios de tipo consumidor`, err.message);
    next(err);
  }
});/*Obtener todos los usuarios consumidores*/

router.get('/comerciantes/todos', async function(req, res, next) {
  try {
    res.json(await usuario.getUsersComerciantes(req.query.page));
  } catch (err) {
    console.error(`Error al traer los usuarios de tipo comerciante`, err.message);
    next(err);
  }
});/*Obtener todos los usuarios comerciantes*/

module.exports = router;