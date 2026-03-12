import express from 'express';
import CargosController from '../controllers/cargosController.js';

const CargosRouter = express.Router();

CargosRouter.get('/', CargosController.listar);
CargosRouter.post('/validar-nombre', CargosController.validarNombreUnico);
CargosRouter.get('/:id', CargosController.obtenerPorId);
CargosRouter.post('/', CargosController.crear);
CargosRouter.delete('/:id', CargosController.eliminar);
CargosRouter.put('/', CargosController.actualizar);

export default CargosRouter;