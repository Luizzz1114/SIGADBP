import express from 'express';
import UsuariosController from '../controllers/usuariosController.js';
import { loginLimiter } from '../middlewares/rateLimit.js';
import { verificarToken, verificarRolAdmin } from '../middlewares/authMiddleware.js'; 

const UsuariosRouter = express.Router();

UsuariosRouter.post('/login', loginLimiter, UsuariosController.iniciarSesion);
UsuariosRouter.post('/recuperar-contrasena', loginLimiter, UsuariosController.recuperarContrasena);

UsuariosRouter.route('/:id')
  .get(verificarToken, UsuariosController.obtenerPorId)
  .delete(verificarToken, verificarRolAdmin, UsuariosController.eliminar);

UsuariosRouter.use(verificarToken);

UsuariosRouter.post('/username-correo', UsuariosController.validarUsernameCorreo);
UsuariosRouter.put('/cambiar-contrasena', UsuariosController.cambiarContrasena);
UsuariosRouter.put('/perfil', UsuariosController.actualizarPerfil);

UsuariosRouter.use(verificarRolAdmin);

UsuariosRouter.route('/')
  .get(UsuariosController.listar)
  .post(UsuariosController.crear)
  .put(UsuariosController.actualizar);

export default UsuariosRouter;