const jwt = require("jwt-simple");
var moment = require("moment");
const config = require('./config');
const nodemailer = require('nodemailer');

function getOffset(currentPage = 1, listPerPage) {
    return (currentPage - 1) * [listPerPage];
  }
  
  function emptyOrRows(rows) {
    if (!rows) {
      return [];
    }
    return rows;
  }

  function isProductionEnv(){
    return process.env.NODE_ENV == 'production';
  }

  function createToken (user,minutes) {
    var payload = {
    email:user.email,
    sub: user.id,
    rol: user.nombre_tipo_usuario,
    iat: moment().unix(),
    exp: moment().add(minutes, "minutes").unix(),
  };
  return  jwt.encode(payload, config.TOKEN_SECRET);
  };
  
  function parseJwt(token) {
    var base64Payload = token.split('.')[1];
    var payload = Buffer.from(base64Payload, 'base64');
    return JSON.parse(payload.toString());
  };

  function sendEmail(email,tema,contentHtml) {
    let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports --color gris #343A40
    auth: {
    user: "plataforma.piscicola@gmail.com", // generated ethereal user
    pass: process.env.GOOGLE_PASSWORD_APP, // generated ethereal password
    },
    });
    // send mail with defined transport object
    let info = transporter.sendMail({
    from: tema+' <plataforma.piscicola@gmail.com>', // user
    to: email, //email---ginelect@unisucre.edu.co 
    subject: tema, // Subject line
    html: contentHtml, // html body
    });

    let message = 'Enlace de'+tema+'enviado con éxito al correo eléctronico';
    return {message};
  };

  module.exports = {
    getOffset,
    emptyOrRows,
    isProductionEnv,
    createToken,
    parseJwt,
    sendEmail
  }