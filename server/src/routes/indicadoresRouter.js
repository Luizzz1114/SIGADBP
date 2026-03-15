import express from 'express';
import IndicadoresController from '../controllers/indicadoresController.js';

const IndicadoresRouter = express.Router();

IndicadoresRouter.route('/')
  .get(IndicadoresController.listar);

export default IndicadoresRouter;