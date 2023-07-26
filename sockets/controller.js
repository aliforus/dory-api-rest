const { Socket } = require('socket.io');
const { validarToken } = require('../middelware/auth');
const ChatMensajes = require('../models/chat-mensajes');
const ChatDbService = require('../services/chat');
const helper = require('../helper');
const chatMensajes = new ChatMensajes();
var createError = require('http-errors');

const socketController = async (socket = new Socket(), io) => {
    const token = socket.handshake.auth.token;
    let valid = false;
    console.log("socket created")
    if (token) {
        valid = validarToken(token)
    }

    if (!valid) {
        socket.disconnect();
        console.log("Usuario no autorizado");
    } else {
        console.log("Usuario autorizado")
        let usuario = helper.parseJwt(token)

        // Agregar el usuario conectado
        let userDetail = await chatMensajes.conectarUsuario(usuario);
        io.emit('usuarios-activos', chatMensajes.usuariosArr);
        io.emit('ultimo-conectado', usuario.sub)

        // Conectarlo a una sala especial
        console.log("el usuario ", usuario.email, " se ha conectado a la sala ", usuario.sub)
        socket.join(usuario.sub); // global, socket.id, usuario.id

        //El usuario puede solicitar la lista de usuarios conectados
        socket.on('usuarios-activos', () => {
            io.to(usuario.sub).emit('usuarios-activos', chatMensajes.usuariosArr);
        })

        // Limpiar cuando alguien se desconeta
        socket.on('disconnect', () => {
            chatMensajes.desconectarUsuario(usuario.sub);
            io.emit('usuarios-activos', chatMensajes.usuariosArr);
            io.emit('ultimo-desconectado', usuario.sub)
        })

        socket.on('new-message', async ({ uid, mensaje }) => {
            console.log("message recived! uid ", uid)
            console.log("message recived! mensaje ", mensaje)

            if (uid) {
                try {
                    // Mensaje privado
                    console.log("send message to ", uid)
                    let message = {
                        contenido: mensaje,
                        usuario_receptor_id: uid,
                        tipo_mensaje_id: 1,
                        grupos_id: null,
                    }
                    let result = await ChatDbService.createMessage(message, token)
                    console.log("Resultado guardado de mensaje->> ",result)
                    console.log("Enviar mensaje a usuario.sub", usuario.sub)
                    socket.to(uid).emit('new-message', { de: usuario.sub, mensaje, metadata:result });
                    io.to(usuario.sub).emit('confirmation-message', { de: usuario.sub, mensaje,metadata:result });
                } catch (err) {
                    console.log(err)
                    throw err;
                }
            }
            /* else {
                chatMensajes.enviarMensaje(usuario.id, usuario.nombre, mensaje );
                io.emit('recibir-mensajes', chatMensajes.ultimos10 );
            } */
        })

    }
}

module.exports = {
    socketController
}