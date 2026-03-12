import express from 'express';
import PresupuestosController from '../controllers/presupuestosController.js';

const PresupuestosRouter = express.Router();

PresupuestosRouter.route('/')
  .get(PresupuestosController.listar)
  .post(PresupuestosController.crear)
  .put(PresupuestosController.actualizar);

 PresupuestosRouter.route('/kpi-presupuesto')
  .get(PresupuestosController.indicadoresPresupuesto); 

PresupuestosRouter.route('/activos-mantenimiento')
  .get(PresupuestosController.listarActivosMantenimientoBienes);

PresupuestosRouter.route('/activos')
  .get(PresupuestosController.listarActivos);

PresupuestosRouter.route('/:id')
	.get(PresupuestosController.obtenerPorId)
  .delete(PresupuestosController.eliminar);

PresupuestosRouter.route('/validar-codigo')
  .post(PresupuestosController.validarCodigoUnico);

export default PresupuestosRouter;
