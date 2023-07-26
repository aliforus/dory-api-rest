const express = require('express');
const router = express.Router();
const proveedores = require('../services/proveedores');

router.get('/productos/userId/:id', async function(req, res, next) {
  try {
    res.json(await proveedores.getProductosUsuarioProveedor(req.params.id));
  } catch (err) {
    console.error(`Error al traer los productos del usuario proveedor ingresado`, err.message);
    next(err);
  }
});

router.post('/producto', async function(req, res, next) {
    try {
              var token=req.headers.authorization;
              res.json(await proveedores.create(req.body,token));
    } catch (err) {
            console.error(`Error creando el producto del usuario`, err.message);
            next(err);
    }
  });

router.put('/producto/:codigo', async function(req, res, next) {
    try {
          var token=req.headers.authorization;
          res.json(await proveedores.update(req.params.codigo, req.body,token));
    } catch (err) {
          console.error(`Error al actualizar el producto del usuario`, err.message);
          next(err);
    }
});

router.delete('/producto/:id', async function(req, res, next) {
    try {
          var token=req.headers.authorization;
          res.json(await proveedores.remove(req.params.id,token));
    } catch (err) {
          console.error(`Error al borrar el producto del usuario`, err.message);
          next(err);
    }
  });

  router.get('/producto/todos', async function(req, res, next) {
    try {
          res.json(await proveedores.ObtenerTodosProductos());
    } catch (err) {
          console.error(`Error al traer todos los productos del sistema`, err.message);
          next(err);
    }
  });

  router.put('/update/photos/:codigoProducto', async function(req, res, next) {
    try { 
         var token=req.headers.authorization;
         res.json(await proveedores.updatePhotosProducto(req.params.codigoProducto,req.body,token));
    } catch (err) {
         console.error(`Error al actualizar las fotos del producto`, err.message);
         next(err);
    }
  });

  router.get('/producto/detailed/:codigoProducto', async function(req, res, next) {
    try {
      var token=req.headers.authorization;
      res.json(await proveedores.getDetailProducto(req.params.codigoProducto,token));
    } catch (err) {
      console.error(`Error al traer los productos detallados `, err.message);
      next(err);
    }
  });
  
module.exports = router;