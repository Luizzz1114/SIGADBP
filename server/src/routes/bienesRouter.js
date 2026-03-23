import express from 'express';
import BienesController from '../controllers/bienesController.js';

const BienesRouter = express.Router();

BienesRouter.get('/metricas/resumen', BienesController.obtenerResumenMetricas);
BienesRouter.get('/metricas/categorias', BienesController.obtenerMetricasPorCategoria);
BienesRouter.get('/metricas/estatus', BienesController.obtenerMetricasPorEstatus);
BienesRouter.get('/metricas/dependencias', BienesController.obtenerMetricasPorDependencia);
BienesRouter.get('/metricas/no-identificados', BienesController.bienesNoIdentificados);

BienesRouter.get('/operativos', BienesController.listarOperativos);
BienesRouter.get('/no-asignados', BienesController.listarNoAsignados);
BienesRouter.post('/validar-numero', BienesController.validarNumeroBienUnico);

BienesRouter.route('/')
	.get(BienesController.listar)
  .post(BienesController.crear)
  .put(BienesController.actualizar);

BienesRouter.route('/:id')
  .get(BienesController.obtenerPorId)
  .delete(BienesController.eliminar);

export default BienesRouter;