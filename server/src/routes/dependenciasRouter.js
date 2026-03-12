import express from 'express';
import DependenciasController from '../controllers/dependenciasController.js';

const DependenciasRouter = express.Router();

DependenciasRouter.get('/', DependenciasController.listar);

DependenciasRouter.route('/responsables')
  .get(DependenciasController.listarResponsables);

DependenciasRouter.get('/:id', DependenciasController.obtenerPorId);
DependenciasRouter.post('/', DependenciasController.crear);
DependenciasRouter.post('/validar-nombre', DependenciasController.validarNombreUnico);
DependenciasRouter.put('/', DependenciasController.actualizar);
DependenciasRouter.delete('/:id', DependenciasController.eliminar);

export default DependenciasRouter;