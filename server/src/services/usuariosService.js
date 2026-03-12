import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UsuariosRepositorio from '../repositories/usuariosRepositorio.js';
import EvaluacionesRepositorio from '../repositories/evaluacionesRepositorio.js';

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
    const semestreActual = mes <= 6 ? `${año}-1` : `${año}-2`;

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

  async crear(usuario) {
    const { personal, username, correo, contrasena, rol } = usuario;
    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const user = {
      personal,
      username,
      correo,
      contrasena: contrasenaHash,
      rol,
    };
    return await UsuariosRepositorio.crear(user);
  }

  async actualizar(usuario) {
    const { id, personal, username, correo, contrasena, rol } = usuario;
    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const user = {
      id,
      personal,
      username,
      correo,
      contrasena: contrasenaHash,
      rol,
    };
    return await UsuariosRepositorio.actualizar(user);
  }

  async eliminar(id) {
    return await UsuariosRepositorio.eliminar(id);
  }
}

export default new UsuariosService();
