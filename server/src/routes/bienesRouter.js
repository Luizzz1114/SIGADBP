import express from 'express';
import BienesController from '../controllers/bienesController.js';

const BienesRouter = express.Router();

BienesRouter.route('/')
	.get(BienesController.listar)
  .post(BienesController.crear)
  .put(BienesController.actualizar);
 
BienesRouter.route('/paneles')
  .get(BienesController.paneles);
  
BienesRouter.route('/bienes-categoria')
  .get(BienesController.bienesCategoria);  

BienesRouter.route('/resumen-estatus')
  .get(BienesController.estadoBienes);

BienesRouter.route('/dependencia-categoria')
  .get(BienesController.categoriaDependencia);

BienesRouter.route('/operativos')
  .get(BienesController.listarOperativos);

BienesRouter.route('/no-asignados')
  .get(BienesController.listarNoAsignados);

BienesRouter.route('/:id')
  .get(BienesController.obtenerPorId)
  .delete(BienesController.eliminar);
 
BienesRouter.route('/validar-numero')
  .post(BienesController.validarNumeroBienUnico);

export default BienesRouter;