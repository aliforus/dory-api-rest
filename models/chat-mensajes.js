const usuarioService = require('../services/usuario');
class Mensaje {
    constructor( uid, nombre, mensaje ) {
        this.uid     = uid;
        this.nombre  = nombre;
        this.mensaje = mensaje;
    }
}


class ChatMensajes {

    constructor() {
        this.mensajes = [];
        this.usuarios = {};
    }

    get ultimos10() {
        this.mensajes = this.mensajes.splice(0,10);
        return this.mensajes;
    }

    get usuariosArr() {
        return Object.values( this.usuarios ); // [ {}, {}, {}]
    }

    enviarMensaje( uid, nombre, mensaje ) {
        this.mensajes.unshift(
            new Mensaje(uid, nombre, mensaje)
        );
    }

    async conectarUsuario( usuario ) {
        let userDetail = await usuarioService.getUserId(1, usuario.sub);
        if(!(usuario.sub in this.usuarios))
        {
            this.usuarios[usuario.sub] = userDetail.data[0]
        }
        console.log("Usuarios conectados ",this.usuariosArr.length)
        //this.printConectedUsers()

        return userDetail;
    }

    printConectedUsers(){
        console.log("\n\nconnected users...\n")
        this.usuariosArr.forEach(
            (u)=>{
                //console.log(u.nombre_completo)
            }
        )
    }

    desconectarUsuario( id ) {
        delete this.usuarios[id];
        this.printConectedUsers()
    }

    ultimoConectado(){
        
    }
}

module.exports = ChatMensajes;