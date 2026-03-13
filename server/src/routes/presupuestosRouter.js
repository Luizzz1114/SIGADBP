import express from 'express';
import PresupuestosController from '../controllers/presupuestosController.js';

const PresupuestosRouter = express.Router();

PresupuestosRouter.get('/metricas/resumen', PresupuestosController.obtenerResumenMetricas);

PresupuestosRouter.get('/activos-mantenimiento', PresupuestosController.listarActivosMantenimiento);
PresupuestosRouter.get('/activos', PresupuestosController.listarActivos);
PresupuestosRouter.post('/validar-codigo', PresupuestosController.validarCodigoUnico);

PresupuestosRouter.route('/')
  .get(PresupuestosController.listar)
  .post(PresupuestosController.crear)
  .put(PresupuestosController.actualizar);

PresupuestosRouter.route('/:id')
	.get(PresupuestosController.obtenerPorId)
  .delete(PresupuestosController.eliminar);

export default PresupuestosRouter;