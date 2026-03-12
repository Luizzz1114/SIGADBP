import express from 'express';
import UsuariosController from '../controllers/usuariosController.js';
import { verificarToken } from '../middlewares/authMiddleware.js'; 

const UsuariosRouter = express.Router();

UsuariosRouter.route('/')
  .get(verificarToken, UsuariosController.listar)
  .post(verificarToken, UsuariosController.crear)
  .put(verificarToken, UsuariosController.actualizar);

UsuariosRouter.route('/:id')
  .get(verificarToken, UsuariosController.obtenerPorId)
  .delete(verificarToken, UsuariosController.eliminar);

UsuariosRouter.post('/username-correo', verificarToken, UsuariosController.validarUsernameCorreo);
UsuariosRouter.post('/login', UsuariosController.iniciarSesion);

export default UsuariosRouter;