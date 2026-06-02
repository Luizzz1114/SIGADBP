import express from 'express';
import MovimientosController from '../controllers/movimientosController.js';
import { verificarRolAdmin, verificarRolAdminSup } from '../middlewares/authMiddleware.js'; 

const MovimientoRouter = express.Router();

MovimientoRouter.use(verificarRolAdminSup);

MovimientoRouter.get('/reporte/:idMovimiento', MovimientosController.generarReporte);  

MovimientoRouter.route('/')
  .get(MovimientosController.listar)
  .post(MovimientosController.crear)
  .put(MovimientosController.actualizar);

MovimientoRouter.route('/:id')
  .get(MovimientosController.obtenerPorId)
  .delete(verificarRolAdmin, MovimientosController.eliminar);
    

export default MovimientoRouter;