import express from 'express';
import DesincorporacionesController from '../controllers/desincorporacionesController.js';

const DesincorporacionesRouter = express.Router();

DesincorporacionesRouter.route('/')
  .get(DesincorporacionesController.listar)
  .post(DesincorporacionesController.crear)
  .put(DesincorporacionesController.actualizar);

DesincorporacionesRouter.route('/metricas')
  .get(DesincorporacionesController.desincorporacionMetricas);

DesincorporacionesRouter.route('/:id')
  .get(DesincorporacionesController.obtenerPorId)
  .delete(DesincorporacionesController.eliminar);

export default DesincorporacionesRouter;