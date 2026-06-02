import express from 'express';
import DependenciasController from '../controllers/dependenciasController.js';
import { verificarRolAdmin } from '../middlewares/authMiddleware.js'; 

const DependenciasRouter = express.Router();

DependenciasRouter.get('/responsables', DependenciasController.listarResponsables);

DependenciasRouter.route('/')
  .get(DependenciasController.listar)
  .post(verificarRolAdmin, DependenciasController.crear)
  .put(verificarRolAdmin, DependenciasController.actualizar);

DependenciasRouter.use(verificarRolAdmin);

DependenciasRouter.post('/validar-nombre', DependenciasController.validarNombreUnico);

DependenciasRouter.route('/:id')
  .get(DependenciasController.obtenerPorId)
  .delete(DependenciasController.eliminar);

export default DependenciasRouter;