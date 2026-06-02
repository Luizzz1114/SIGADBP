import express from 'express';
import IncorporacionesController from '../controllers/incorporacionesController.js';
import { verificarRolAdmin } from '../middlewares/authMiddleware.js';

const IncorporacionesRouter = express.Router();

IncorporacionesRouter.get('/reporte/:idIncorporacion', IncorporacionesController.generarReporte);  


IncorporacionesRouter.route('/')
  .get(IncorporacionesController.listar)
  .post(IncorporacionesController.crear)
  .put(IncorporacionesController.actualizar);

IncorporacionesRouter.route('/:id')
  .get(IncorporacionesController.obtenerPorId)
  .delete(verificarRolAdmin, IncorporacionesController.eliminar);

export default IncorporacionesRouter;
