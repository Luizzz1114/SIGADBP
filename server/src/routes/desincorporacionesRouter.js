import express from 'express';
import DesincorporacionesController from '../controllers/desincorporacionesController.js';
import { verificarRolAdmin, verificarRolAdminSup } from '../middlewares/authMiddleware.js';

const DesincorporacionesRouter = express.Router();

DesincorporacionesRouter.use(verificarRolAdminSup);  

DesincorporacionesRouter.get('/reporte/:idDesincorporacion', DesincorporacionesController.generarReporte);  

DesincorporacionesRouter.route('/')
  .get(DesincorporacionesController.listar)
  .post(DesincorporacionesController.crear)
  .put(DesincorporacionesController.actualizar);

DesincorporacionesRouter.route('/metricas')
  .get(DesincorporacionesController.desincorporacionMetricas);

DesincorporacionesRouter.route('/:id')
  .get(DesincorporacionesController.obtenerPorId)
  .delete(verificarRolAdmin, DesincorporacionesController.eliminar);

export default DesincorporacionesRouter;