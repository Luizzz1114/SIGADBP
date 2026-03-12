import express from 'express';
import MovimientosController from '../controllers/movimientosController.js';

const MovimientoRouter = express.Router();

MovimientoRouter.route('/')
  .get(MovimientosController.listar)
  .post(MovimientosController.crear)
  .put(MovimientosController.actualizar);

MovimientoRouter.route('/:id')
  .get(MovimientosController.obtenerPorId)
  .delete(MovimientosController.eliminar);  

export default MovimientoRouter;