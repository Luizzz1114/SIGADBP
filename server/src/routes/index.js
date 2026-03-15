import { Router } from 'express';
import CargosRouter from './cargosRouter.js';
import PersonalRouter from './personalRouter.js';
import DependenciasRouter from './dependenciasRouter.js';
import UbicacionRouter from './ubicacionRouter.js';
import UsuariosRouter from './usuariosRouter.js';
import BienesRouter from './bienesRouter.js';
import PresupuestosRouter from './presupuestosRouter.js';
import IncorporacionesRouter from './incorporacionesRouter.js';
import DesincorporacionesRouter from './desincorporacionesRouter.js';
import MantenimientosRouter from './mantenimientosRouter.js';
import MovimientoRouter from './movimientosRouter.js';
import EvaluacionesRouter from './evaluacionesRouter.js';
import IndicadoresRouter from './indicadoresRouter.js'

const router = Router();

router.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

router.use('/cargos', CargosRouter);
router.use('/personal', PersonalRouter);
router.use('/dependencias', DependenciasRouter);
router.use('/ubicacion', UbicacionRouter);
router.use('/usuarios', UsuariosRouter);
router.use('/bienes', BienesRouter);
router.use('/presupuestos', PresupuestosRouter);
router.use('/incorporaciones', IncorporacionesRouter);
router.use('/desincorporaciones', DesincorporacionesRouter);
router.use('/mantenimientos', MantenimientosRouter);
router.use('/movimientos', MovimientoRouter);
router.use('/evaluaciones', EvaluacionesRouter);
router.use('/metricas', IndicadoresRouter);

export default router;