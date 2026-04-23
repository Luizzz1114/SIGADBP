import express from 'express';
import PersonalController from '../controllers/personalController.js';

const PersonalRouter = express.Router();

PersonalRouter.get('/', PersonalController.listar);
PersonalRouter.get('/historial', PersonalController.historialCargos);
PersonalRouter.get('/sin-usuario', PersonalController.listarSinUsuario);
PersonalRouter.post('/validar-cedula', PersonalController.validarCedulaUnica);
PersonalRouter.get('/:id', PersonalController.obtenerPorId);
PersonalRouter.post('/', PersonalController.crear);
PersonalRouter.put('/', PersonalController.actualizar);
PersonalRouter.delete('/:id', PersonalController.eliminar);

export default PersonalRouter;