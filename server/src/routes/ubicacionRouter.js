import express from 'express';
import UbicacionController from '../controllers/ubicacionController.js';

const UbicacionRouter = express.Router();

UbicacionRouter.get('/estados', UbicacionController.listarEstados);
UbicacionRouter.get('/estados/:idEstado/municipios', UbicacionController.listarMunicipios);
UbicacionRouter.get('/municipios/:idMunicipio/parroquias', UbicacionController.listarParroquias);

export default UbicacionRouter;