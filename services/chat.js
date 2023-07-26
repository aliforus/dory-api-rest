const db = require('./db');
const helper = require('../helper');
var createError = require('http-errors');
const { validarToken } = require('../middelware/auth');
const dayjs = require('dayjs');


async function createMessage(message, token) {
  if (token && validarToken(token)) {
    const payload = helper.parseJwt(token);
    message.usuario_emisor_id = payload.sub;
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    //message.fecha_creacion = dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
    message.fecha_creacion = currentDate.toISOString();
    console.log("timestamp ", timestamp)
    console.log("fecha creacion mensaje", message.fecha_creacion)
    console.log("UTC time ", currentDate.toISOString())
    try {
      if (message.contenido === undefined ||
        message.usuario_receptor_id === undefined ||
        message.tipo_mensaje_id === undefined ||
        message.grupos_id === undefined
      ) {
        throw createError(400, "Se requieren todos los parámetros!");
      }

      console.log("message ", message)
      const result = await db.query(
        `INSERT INTO mensajes(contenido,fecha_creacion,usuario_emisor_id,usuario_receptor_id,tipo_mensaje_id,grupos_id) VALUES (?,?,?,?,?,?)`,
        [
          message.contenido,
          message.fecha_creacion,
          message.usuario_emisor_id,
          message.usuario_receptor_id,
          message.tipo_mensaje_id,
          message.grupos_id
        ]
      );
      console.log("result ", result)
      if (result['affectedRows']) {
        console.log("mensaje guardado")
        return { message: message, result: 'ok' };
      } else {
        throw createError(500, "No se pudo guardar el mensaje");
      }
    } catch (error) {
      throw error;
    }
  } else {
    throw createError(401, "Usted no tiene autorización");
  }
}/*End createMessage*/

/*retorna los mensajes de un chat*/
async function getMensajesPrivados(token, idUser2) {
  if (token && validarToken(token)) {
    const payload = helper.parseJwt(token);
    const idUser1 = payload.sub;
    const rows = await db.query(
      `SELECT *
                    FROM mensajes as m
                    WHERE (m.usuario_emisor_id=? and m.usuario_receptor_id=?) || (m.usuario_emisor_id=? and m.usuario_receptor_id=?)
                    order by fecha_creacion asc`,
      [idUser1, idUser2, idUser2, idUser1]
    );
    let data;
    data = helper.emptyOrRows(rows);
    return { data };
  } else {
    throw createError(401, "Usted no tiene autorización");
  }
}/*End getMensajesPrivados*/

/*retorna los ultimos mensajes de cada chat*/
async function getUltimos(token) {
  if (token && validarToken(token)) {
    const payload = helper.parseJwt(token);
    const idUser = payload.sub;
    const rows = await db.query(
      `select m.contenido, m.fecha_creacion, m.usuario_emisor_id, m.usuario_receptor_id, m.tipo_mensaje_id, m.usuario_emisor_id + m.usuario_receptor_id as chat_id
      from mensajes as m
      where usuario_emisor_id = ? || usuario_receptor_id = ?
      order by chat_id asc, m.fecha_creacion desc`,
      [idUser, idUser]
    );
    let res;
    res = helper.emptyOrRows(rows);
    let added = -1;
    res = res.filter(
      (element) => {
        if (element.chat_id == added) {
          return false;
        } else {
          added = element.chat_id;
          return true;
        }
      }
    )

    res = res.sort(
      (a, b) => {
        if (a.fecha_creacion > b.fecha_creacion) {
          return -1;
        } else {
          return 1;
        }
      }
    )
    
    let unreads = await getUnreads(token);
    const initialValue = 0;
    console.log("unreads--> ",unreads)
    console.log("unreads.data--> ",unreads.data)
    let totalCount = unreads.data.reduce(
      (a,b)=> {
        console.log(a + '+' + b.count )
        return a + b.count
      },initialValue
    )
    let data = {
      ultimos:res,
      unreads:{
        chats:unreads.data,
        totalCount:totalCount
      }  
    }
    return { data };
  } else {
    throw createError(401, "Usted no tiene autorización");
  }
}

async function getUnreads(token) {
  if (token && validarToken(token)) {
    const payload = helper.parseJwt(token);
    const idUser = payload.sub;
    const rows = await db.query(
      `SELECT count(*) as count, (m.usuario_emisor_id + m.usuario_receptor_id) as chat_id, m.usuario_emisor_id, m.usuario_receptor_id
      FROM mensajes as m 
      WHERE m.usuario_receptor_id=? and readed = 0
      group by chat_id`,
      [idUser]
    );
    let data;
    data = helper.emptyOrRows(rows);
    return { data };
  } else {
    throw createError(401, "Usted no tiene autorización");
  }
}

async function setReadedAll(token, usuarioEmisorId) {
  if (token && validarToken(token)) {
    const payload = helper.parseJwt(token);
    const idUser = payload.sub;
    await db.query(
      `update mensajes as m set readed = 1 where m.usuario_receptor_id = ? and m.usuario_emisor_id = ?`,
      [idUser,usuarioEmisorId]
    );
  
    return { 
      message:"mensajes setados como leidos"
     };
  } else {
    throw createError(401, "Usted no tiene autorización");
  }
}
module.exports = {
  createMessage,
  getMensajesPrivados,
  getUltimos,
  getUnreads,
  setReadedAll
}