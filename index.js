const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const {verifyToken, validarToken} = require ('./middelware/auth');
require('dotenv').config();

/*Socket.io con express*/
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
  cors: {
    origin:"*.*"
  }
}); 

const { socketController } = require('./sockets/controller')
const departamentosRouter = require('./routes/departamentos');
const tipos_usuariosRouter = require('./routes/tipos_usuarios');
const infraestructurasRouter = require('./routes/infraestructuras');
const areas_experticiasRouter = require('./routes/areas_experticias');
const especiesRouter = require('./routes/especies');
const tipos_eventosRouter = require('./routes/tipos_eventos');
const modalidadesRouter = require('./routes/modalidades');
const categoriasRouter = require('./routes/categorias');
const proveedoresRouter = require('./routes/proveedores');
const tipos_asociacionesRouter = require('./routes/tipos_asociaciones');
const municipiosRouter = require('./routes/municipios');
const corregimientosRouter = require('./routes/corregimientos');
const veredasRouter = require('./routes/veredas');
const asociacionesRouter = require('./routes/asociaciones');
const granjasRouter = require('./routes/granjas');
const subregionesRouter = require('./routes/subregiones');
const proyectosRouter = require('./routes/proyectos');
const sectoresRouter = require('./routes/sectores');
const tipos_normatividadesRouter = require('./routes/tipos_normatividades');
const vehiculosRouter = require('./routes/vehiculos');
const tipos_novedadesRouter = require('./routes/tipos_novedades');
const normatividadesRouter = require('./routes/normatividades');
const novedadesRouter = require('./routes/novedades');
const fotosRouter = require('./routes/fotos');
const mensajesRouter = require('./routes/mensajes');
const resenasRouter = require('./routes/resenas');
const eventosRouter = require('./routes/eventos');
const pescadoresRouter = require('./routes/pescadores');
const piscicultoresRouter = require('./routes/piscicultores');
const usuarioRouter = require('./routes/usuario');
const buscarGranjaRouter = require('./routes/buscar-granja');
const buscarPescadoresRouter = require('./routes/buscar-pescadores');
const buscarPiscicultoresRouter = require('./routes/buscar-piscicultores');
const buscarUsuarioEmailRouter = require('./routes/buscar-usuario-email');
const loginRouter = require('./routes/login');
const contactenosRouter = require('./routes/contactenos');
const compartirRouter = require('./routes/compartir');
const novedadesLikesRouter = require('./routes/novedades-likes');
const negociosRouter = require('./routes/negocios');
const publicacionesRouter = require('./routes/publicaciones');
const etniasRouter = require('./routes/etnias');
const sexosRouter = require('./routes/sexos');
const nosotrosRouter = require('./routes/nosotros');
const integrantesRouter = require('./routes/integrantes');
const conocenosRouter = require('./routes/conocenos');
const sliderRouter = require('./routes/slider');
const enlacesRapidosRouter = require('./routes/enlacesRapidos');
const dashboardRouter = require('./routes/dashboard');
const chatRouter = require('./routes/chat');
const topalertRouter = require('./routes/topalert');
const searchRouter = require('./routes/search');
const forosRouter = require('./routes/foros');

var cors = require('cors');
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(function(req, res, next){
  res.io = io;
  next();
});

// Configurar cabeceras y cors
/*app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});*/

app.use(cors());

app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/index.html');
});

app.use('/api/departamentos', departamentosRouter)
app.use('/api/tipos-usuarios', tipos_usuariosRouter)
app.use('/api/infraestructuras', infraestructurasRouter)
app.use('/api/areas-experticias', areas_experticiasRouter)
app.use('/api/especies', especiesRouter)
app.use('/api/tipos-eventos', tipos_eventosRouter)
app.use('/api/modalidades', modalidadesRouter)
app.use('/api/categorias', categoriasRouter)
app.use('/api/proveedores', proveedoresRouter)
app.use('/api/tipos-asociaciones', tipos_asociacionesRouter)
app.use('/api/municipios', municipiosRouter)
app.use('/api/corregimientos', corregimientosRouter)
app.use('/api/veredas', veredasRouter)
app.use('/api/asociaciones', asociacionesRouter)
app.use('/api/granjas', granjasRouter)
app.use('/api/subregiones', subregionesRouter)
app.use('/api/proyectos', proyectosRouter)
app.use('/api/sectores', sectoresRouter)
app.use('/api/tipos-normatividades', tipos_normatividadesRouter)
app.use('/api/vehiculos', vehiculosRouter)
app.use('/api/tipos-novedades', tipos_novedadesRouter)
app.use('/api/normatividades', normatividadesRouter)
app.use('/api/fotos', fotosRouter)
app.use('/api/mensajes', mensajesRouter)
app.use('/api/resenas', resenasRouter)
app.use('/api/eventos', eventosRouter)
app.use('/api/usuario', usuarioRouter)
app.use('/api/novedades', novedadesRouter)
app.use('/api/pescadores', pescadoresRouter)
app.use('/api/piscicultores', piscicultoresRouter)
app.use('/api/buscar/granja', buscarGranjaRouter)
app.use('/api/buscar/pescadores', buscarPescadoresRouter)
app.use('/api/buscar/piscicultores', buscarPiscicultoresRouter)
app.use('/api/piscicultores', piscicultoresRouter)
app.use('/api/buscar/usuario/email', buscarUsuarioEmailRouter) 
app.use('/api/login', loginRouter)
app.use('/api/contactenos',contactenosRouter)
app.use('/api/compartir',compartirRouter)
app.use('/api/negocios',negociosRouter)
app.use('/api/publicaciones',publicacionesRouter)
app.use('/api/novedades/auth',verifyToken,novedadesLikesRouter)
app.use('/api/etnias',etniasRouter)
app.use('/api/sexos',sexosRouter)
app.use('/api/nosotros',nosotrosRouter)
app.use('/api/integrantes',integrantesRouter)
app.use('/api/conocenos',conocenosRouter)
app.use('/api/slider',sliderRouter)
app.use('/api/enlacesRapidos',enlacesRapidosRouter)
app.use('/api/dashboard',dashboardRouter)
app.use('/api/chat',chatRouter)
app.use('/api/topalert',topalertRouter)
app.use('/api/search',searchRouter)
app.use('/api/foros',forosRouter)

/* Error de direccionamiento  */
 app.use(( req, res, next) => {
  const error= new Error('NOT FOUND');
  error.statusCode=404;
  next(error);
 });

/* Error handler middleware */
app.use((err, req, res, next) => {     
  
  if(err.code=='ER_DUP_ENTRY'){/* Clave primaria duplicada al enviar la solicitud */
    err.message="El registro ya existe";
    err.statusCode=400;
  }
 
  if(err.code=='ER_PARSE_ERROR'){
    err.statusCode=400;
  }
           
 if(err.code=='ER_BAD_FIELD_ERROR'){/* Parametros mal escritos al enviar la solicitud */
    err.statusCode=400;
    err.message="No existe parametro en la BD"+" "+err.sqlMessage; 
  }
             
  if(err.code=='ER_WRONG_ARGUMENTS'){
    err.statusCode=500;
  }
                
  if(err.code=='ERR_INVALID_ARG_TYPE'){
    err.statusCode=500;
  }
                 
  if(err.code=='EADDRINUSE'){
    err.statusCode=500;
  }

  if(err.code == 'ER_NO_REFERENCED_ROW_2'){
    err.statusCode = 400;
    err.message = "No se pudo realizar la operación. Revise la información enviada" 
  }

  const statusCode = err.statusCode || 500;
  console.error(err)
  console.error(err.message, err.stack);
  res.status(statusCode).json({'message': err.message});
  return;
  });

/* app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
}); */

/* io.use((socket,next)=>{
  const token = socket.handshake.auth.token;
  console.log(token)
  let valid = validarToken(token);
  if(!valid){
    socket.disconnect();
    console.log("Usuario no autorizado");
  }else{
    console.log("Usuario autorizado")
  }
})

 io.on('connection', (socket) => {
  console.log('a user connected');
}); */

io.on('connection', ( socket ) => socketController(socket, io ) )

server.listen(port, () => {
  console.log('listening on *:'+port);
});