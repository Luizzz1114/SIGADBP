import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UsuariosRepositorio from '../repositories/usuariosRepositorio.js';
import EvaluacionesRepositorio from '../repositories/evaluacionesRepositorio.js';
import pool from '../config/database.js';

class UsuariosService {
  async listar() {
    return await UsuariosRepositorio.listar();
  }

  async validarUsernameCorreo(validar) {
    return await UsuariosRepositorio.validarUsernameCorreo(validar);
  }

  async obtenerPorId(id) {
    return await UsuariosRepositorio.obtenerPorId(id);
  }

  async iniciarSesion(usuario) {
    const { username, contrasena } = usuario;
    const user = { username };
    const validacion = await UsuariosRepositorio.iniciarSesion(user);
    
    if (!validacion) {
      return { autenticado: false, mensaje: 'Usuario no encontrado.' };
    }

    const match = await bcrypt.compare(contrasena, validacion.contrasena);
    if (!match) {
      return { autenticado: false, mensaje: 'Credenciales incorrectas.' };
    }

    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1; 
    const semestreActual = mes <= 6 ? `I-${año}` : `II-${año}`;

    const encuesta = {
      id: validacion.id,
      semestreActual: semestreActual 
    }

    const encuestaRespondida = await EvaluacionesRepositorio.encuestaRespondida(encuesta);

    const token = jwt.sign(
      { id: validacion.id, username: validacion.username, rol: validacion.rol },
      process.env.JWT_SECRET,
    );

    return {
      autenticado: true,
      token: token,
      mensaje: 'Inicio de sesión exitoso.',
      usuario: {
        id: validacion.id,
        username: validacion.username,
        correo: validacion.correo,
        rol: validacion.rol,
        encuestaRespondida: encuestaRespondida
      },
    };
  }

  async recuperarContrasena(user) {
    const { identificador, pregunta, respuesta } = user;
    const recuperar = await UsuariosRepositorio.recuperarContrasena(identificador);
    if (!recuperar) {
      return { encontrado: false, mensaje: 'Usuario no encontrado.' };
    }
    if (pregunta !== recuperar.pregunta) {
      return { encontrado: false, mensaje: 'Pregunta incorrecta.' };
    }
    const match = await bcrypt.compare(respuesta, recuperar.respuesta);
    if (!match) {
      return { encontrado: false, mensaje: 'Respuesta incorrecta.' };
    }
    return { encontrado: true, mensaje: 'Usuario verificado.', id: recuperar.id, username: recuperar.username, correo: recuperar.correo };
  }

  async crear(usuario) {
    const { personal, username, correo, contrasena, rol, pregunta, respuesta } = usuario;
    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const respuestaHash = await bcrypt.hash(respuesta, 10);
    const user = {
      personal,
      username,
      correo,
      contrasena: contrasenaHash,
      rol,
      pregunta,
      respuesta: respuestaHash
    };
    return await UsuariosRepositorio.crear(user);
  }

  async actualizar(usuario) {
    let { id, username, correo, contrasena, rol, pregunta, respuesta } = usuario;

    if (contrasena && contrasena.trim() !== '') {
      contrasena = await bcrypt.hash(contrasena, 10);
    }
    if (respuesta && respuesta.trim() !== '') {
      respuesta = await bcrypt.hash(respuesta, 10);
    }
    const user = {
      id,
      username,
      correo,
      contrasena,
      rol,
      pregunta,
      respuesta,
    };
    return await UsuariosRepositorio.actualizar(user);
  }
  
/*
  async eliminar(id) {
    return await UsuariosRepositorio.eliminar(id);
  }
*/

  async eliminar(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const contador = await UsuariosRepositorio.contarAdministradores(client, id);
      console.log('Contador de administradores:', contador);
      if (contador.total_admin === '1' && contador.rol === 'Administrador') {
        throw new Error('ULTIMO_ADMIN');
      }
      const resultado = await UsuariosRepositorio.eliminar(client, id);
      await client.query('COMMIT');
      return resultado;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new UsuariosService();
