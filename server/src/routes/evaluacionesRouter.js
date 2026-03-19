import express from 'express';
import EvaluacionesController from '../controllers/evaluacionesController.js';

const EvaluacionesRouter = express.Router();

EvaluacionesRouter.route('/metricas')
  .get(EvaluacionesController.listarKpiCapacitacionSatisfaccion);  

EvaluacionesRouter.route('/')
  .post(EvaluacionesController.crear);

export default EvaluacionesRouter;