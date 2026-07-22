import IndicadoresServices from '../services/indicadoresServices.js';

class IndicadoresController {
  async listar(req, res) {
    try {
      const { siglas, hasta } = req.query;
      if (hasta && !/^\d{4}-(0[1-9]|1[0-2])$/.test(hasta)) {
        return res.status(400).json({ message: 'El mes debe tener el formato YYYY-MM' });
      }
      const metricas = await IndicadoresServices.listar(siglas, hasta);
      res.status(200).json(metricas); 
    } catch (error) {
      res.status(500).json({ message: 'Error al listar metricas', error: error.message });
    }
  }
}

export default new IndicadoresController();