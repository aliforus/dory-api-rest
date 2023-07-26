const jwt = require("jwt-simple");
var moment = require("moment");
var config = require("../config");

const verifyToken =  function (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).send({ message: "Tu petición no tiene cabecera de autorización" });
  }
  try {
    var token = req.headers.authorization.split(" ")[1];/*Obtenemos el token del string*/
    var payload = jwt.decode(token, config.TOKEN_SECRET);
  
    if (payload.exp <= moment().unix()) {
      return res.status(401).send({ message: "El token ha expirado" });
    }
  } catch (error) {
    res.status(401).send({ message: "Usuario no autorizado" });
  }
 
  req.user = payload;
  next();
};

const validarToken= function(token2){
  try {    
      var token =token2.split(" ")[1];/*Obtenemos el token del string*/   
      var payload = jwt.decode(token, config.TOKEN_SECRET);
      if (payload.exp <= moment().unix()) {
        return false; 
      }
       return true;
  } catch (error) {
      console.log('Error:',error);
      return false;
  }
};

module.exports = 
{
  verifyToken,
  validarToken
}


