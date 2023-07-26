
const nodemailer = require('nodemailer');
var createError = require('http-errors');

async function compartir(datos){

  const{email,link,}=datos;

  if(email!=undefined && link!=undefined)
   { 
       contentHtml = `<h1 style="color:#26A5B8">Información del Usuario</h1>
                      <p>Email:  &nbsp; ${email}</p> 
                      <p> <b>${link}</b></p>             
               `;

        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: "plataforma.piscicola@gmail.com", 
            pass: process.env.GOOGLE_PASSWORD_APP, 
          },
        }); 

        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"Remitente" <plataforma.piscicola@gmail.com>', // user
          to: "ginelect@unisucre.edu.co", //ginelect@unisucre.edu.co 
          html: contentHtml, // html body
        });
        /*
        console.log("Mensaje enviado:", info.messageId);
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
        */
        let message = 'Se Compartió el enlace con éxito';
        return {message};
  }
  throw createError(400,"Un problema con los parámetros ingresados"); 
} 

module.exports = {
 compartir
}