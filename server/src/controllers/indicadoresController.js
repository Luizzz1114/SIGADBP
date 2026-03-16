import IndicadoresServices from '../services/indicadoresServices.js';

class IndicadoresController {
  async listar(req, res) {
    try {
      const { siglas } = req.query;
      const metricas = await IndicadoresServices.listar(siglas);
      res.status(200).json(metricas); 
    } catch (error) {
      res.status(500).json({ message: 'Error al listar metricas', error: error.message });
    }
  }
}

export default new IndicadoresController();