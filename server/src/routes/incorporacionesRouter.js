import express from 'express';
import IncorporacionesController from '../controllers/incorporacionesController.js';

const IncorporacionesRouter = express.Router();

IncorporacionesRouter.route('/')
  .get(IncorporacionesController.listar)
  .post(IncorporacionesController.crear)
  .put(IncorporacionesController.actualizar);

IncorporacionesRouter.route('/:id')
  .get(IncorporacionesController.obtenerPorId)
  .delete(IncorporacionesController.eliminar);

export default IncorporacionesRouter;
