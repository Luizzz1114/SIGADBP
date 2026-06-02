import express from 'express';
import EvaluacionesController from '../controllers/evaluacionesController.js';
import { verificarRolAdmin } from '../middlewares/authMiddleware.js'; 

const EvaluacionesRouter = express.Router();

EvaluacionesRouter.route('/')
  .post(EvaluacionesController.crear);

EvaluacionesRouter.use(verificarRolAdmin);

EvaluacionesRouter.route('/metricas')
  .get(EvaluacionesController.listarKpiCapacitacionSatisfaccion);  

export default EvaluacionesRouter;