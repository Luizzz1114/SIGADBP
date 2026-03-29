import UsuariosService from '../services/usuariosService.js';

class UsuariosController {
  async listar(req, res) {
    try {
      const usuarios = await UsuariosService.listar();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar usuarios.' });
    }
  }

  async validarUsernameCorreo(req, res) {
    try {
      const validar = req.body;
      const sonUnicos = await UsuariosService.validarUsernameCorreo(validar);
      res.status(200).json(sonUnicos);
    } catch (error) {
      res.status(500).json({ error: 'Error al validar username y correo.' });
    } 
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuariosService.obtenerPorId(id);
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuario por ID.' });
    }
  }

  async iniciarSesion(req, res) {
    try {
      const usuario = req.body;
      const resultado = await UsuariosService.iniciarSesion(usuario);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: 'Error al iniciar sesión.' });
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
      res.status(500).json({ error: 'Error al crear usuario.' });
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
      const { id } = req.params; 
      const resultado = await UsuariosService.eliminar(id);
      if (resultado) {
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
      } else {
        res.status(400).json({ error: 'Error al eliminar usuario.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar usuario.' });
    }
  }
}

export default new UsuariosController();
