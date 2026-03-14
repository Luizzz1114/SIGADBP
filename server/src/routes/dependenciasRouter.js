import express from 'express';
import DependenciasController from '../controllers/dependenciasController.js';

const DependenciasRouter = express.Router();

DependenciasRouter.get('/responsables', DependenciasController.listarResponsables);
DependenciasRouter.post('/validar-nombre', DependenciasController.validarNombreUnico);

DependenciasRouter.route('/')
  .get(DependenciasController.listar)
  .post(DependenciasController.crear)
  .put(DependenciasController.actualizar);

DependenciasRouter.route('/:id')
  .get(DependenciasController.obtenerPorId)
  .delete(DependenciasController.eliminar);

export default DependenciasRouter;