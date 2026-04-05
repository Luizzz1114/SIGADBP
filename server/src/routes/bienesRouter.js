import express from 'express';
import BienesController from '../controllers/bienesController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const BienesRouter = express.Router();

BienesRouter.get('/metricas/resumen', verificarToken, BienesController.obtenerResumenMetricas);
BienesRouter.get('/metricas/categorias', verificarToken, BienesController.obtenerMetricasPorCategoria);
BienesRouter.get('/metricas/estatus', verificarToken, BienesController.obtenerMetricasPorEstatus);
BienesRouter.get('/metricas/dependencias', verificarToken, BienesController.obtenerMetricasPorDependencia);
BienesRouter.get('/metricas/no-identificados', verificarToken, BienesController.bienesNoIdentificados);
BienesRouter.get('/metricas/disponibilidad-dependencia', verificarToken, BienesController.metricaDisponibilidadPorDependencia);

BienesRouter.get('/operativos', verificarToken, BienesController.listarOperativos);
BienesRouter.get('/no-asignados', verificarToken, BienesController.listarNoAsignados);
BienesRouter.post('/validar-numero', verificarToken, BienesController.validarNumeroBienUnico);

BienesRouter.route('/')
	.get(verificarToken, BienesController.listar)
  .post(verificarToken, BienesController.crear)
  .put(verificarToken, BienesController.actualizar);

BienesRouter.route('/:id')
  .get(verificarToken, BienesController.obtenerPorId)
  .delete(verificarToken, BienesController.eliminar);

export default BienesRouter;
