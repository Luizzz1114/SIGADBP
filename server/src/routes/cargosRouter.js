import express from 'express';
import CargosController from '../controllers/cargosController.js';
import { verificarRolAdmin } from '../middlewares/authMiddleware.js'; 

const CargosRouter = express.Router();

CargosRouter.use(verificarRolAdmin);

CargosRouter.get('/', CargosController.listar);
CargosRouter.post('/validar-nombre', CargosController.validarNombreUnico);
CargosRouter.get('/:id', CargosController.obtenerPorId);
CargosRouter.post('/', CargosController.crear);
CargosRouter.delete('/:id', CargosController.eliminar);
CargosRouter.put('/', CargosController.actualizar);

export default CargosRouter;