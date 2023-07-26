const nodemailer = require('nodemailer');
var createError = require('http-errors');


async function contactenos(formulario){

  const{nombre,email,celular,asunto,mensaje,}=formulario;

  if(nombre!=undefined && email!=undefined && celular!=undefined && asunto!=undefined && mensaje!=undefined)
   {   
          contentHtml = `<h1 style="color:#26A5B8">Información del Usuario</h1>
                      <ul>
                      <li>nombre: &nbsp;  ${nombre}</li>
                      <li>celular: &nbsp; ${celular}</li>
                      <li>email: &nbsp; ${email}</li>
                      </ul>
                      <p>${mensaje}</p>
                      `;

            let transporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 465,
              secure: true, // true for 465, false for other ports
              auth: {
                user: "plataforma.piscicola@gmail.com", // generated ethereal user
                pass: process.env.GOOGLE_PASSWORD_APP, // generated ethereal password
              },
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
              from: '"Remitente 👻" <plataforma.piscicola@gmail.com>', // user
              to: "ginelect@unisucre.edu.co", // 
              subject: asunto, // Subject line
              text: mensaje, // plain text body
              html: contentHtml, // html body
            });

            let message = 'Formulario enviado al correo electrónico con éxito';
          return {message};
   }
     
      throw createError(400,"Un problema con los parametros ingresados"); 
}

module.exports = {
  contactenos
}