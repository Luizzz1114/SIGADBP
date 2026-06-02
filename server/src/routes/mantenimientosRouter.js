import express from 'express';
import MantenimientosController from '../controllers/mantenimientosController.js';
import { verificarRolAdmin } from '../middlewares/authMiddleware.js'; 

const MantenimientosRouter = express.Router();

MantenimientosRouter.route('/')
  .get(MantenimientosController.listar)
  .post(MantenimientosController.crear)
  .put(MantenimientosController.actualizar);

MantenimientosRouter.route('/conteo-mantenimiento')
  .get(MantenimientosController.conteoMantenimiento);

MantenimientosRouter.route('/promedio-mantenimiento')
  .get(MantenimientosController.promedioMantenimiento);

MantenimientosRouter.route('/:id')
  .get(MantenimientosController.obtenerPorId)
  .delete(verificarRolAdmin, MantenimientosController.eliminar);  

export default MantenimientosRouter;