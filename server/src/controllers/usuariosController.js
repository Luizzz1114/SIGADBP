import UsuariosService from '../services/usuariosService.js';

class UsuariosController {
  async listar(req, res) {
    try {
      const usuarios = await UsuariosService.listar();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar usuarios.', error: error.message });
    }
  }

  async validarUsernameCorreo(req, res) {
    try {
      const validar = req.body;
      const sonUnicos = await UsuariosService.validarUsernameCorreo(validar);
      res.status(200).json(sonUnicos);
    } catch (error) {
      res.status(500).json({ error: 'Error al validar username y correo.', error: error.message });
    } 
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuariosService.obtenerPorId(id);
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuario por ID.', error: error.message });
    }
  }

  async iniciarSesion(req, res) {
    try {
      const usuario = req.body;
      const resultado = await UsuariosService.iniciarSesion(usuario);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: 'Error al iniciar sesión.', error: error.message });
    }
  }

  async recuperarContrasena(req, res) {
    try {
      const user = req.body;
      const resultado = await UsuariosService.recuperarContrasena(user);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: 'Error al recuperar contraseña.', error: error.message });
    }
  }

  async crear(req, res) {
    try {
      const usuario = req.body;
      const resultado = await UsuariosService.crear(usuario);
      if (resultado) {
        res.status(201).json({ message: 'Usuario creado exitosamente.' });
      } else {
        res.status(400).json({ error: 'Error al crear usuario.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al crear usuario.', error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const usuario = req.body;
      const resultado = await UsuariosService.actualizar(usuario);
      if (resultado) {
        res.status(200).json({ message: 'Usuario actualizado exitosamente.' });
      } else {
        res.status(400).json({ error: 'Error al actualizar usuario.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar usuario.', error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const idLogeado = req.user.id;
      const { id } = req.params;
      const idEliminar = parseInt(id);
      if (idEliminar === idLogeado) {
        return res.status(400).json({ error: 'No puedes eliminar tu propio usuario.' });
      }
      const resultado = await UsuariosService.eliminar(id);
      if (resultado) {
        const io = req.app.get('socketio');
        io.to(`sala_usuario_${id}`).emit('sesion_forzada', 'Tu cuenta ha sido eliminada por un administrador.');
        io.in(`sala_usuario_${id}`).disconnectSockets(true);
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
      } else {
        res.status(400).json({ error: 'Error al eliminar usuario.' });
      }
    } catch (error) {
      if (error.message === 'ULTIMO_ADMIN') {
        return res.status(400).json({ error: 'No puedes eliminar el ultimo usuario Administrador.' });
      }

      res.status(500).json({ error: 'Error al eliminar usuario.', error: error.message });
    }
  }
}

export default new UsuariosController();
