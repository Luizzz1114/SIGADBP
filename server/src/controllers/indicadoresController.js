import IndicadoresServices from '../services/indicadoresServices.js';

class IndicadoresController {
  async listar(req, res) {
    try {
      const { siglas, hasta, periodo } = req.query;
      if (hasta && !/^\d{4}-(0[1-9]|1[0-2])$/.test(hasta)) {
        return res.status(400).json({ message: 'El mes debe tener el formato YYYY-MM' });
      }
      if (periodo && !/^(I|II)-\d{4}$/.test(periodo)) {
        return res.status(400).json({ message: 'El semestre debe tener el formato I-YYYY o II-YYYY' });
      }
      const metricas = await IndicadoresServices.listar(siglas, hasta, periodo);
      res.status(200).json(metricas); 
    } catch (error) {
      res.status(500).json({ message: 'Error al listar metricas', error: error.message });
    }
  }
}

export default new IndicadoresController();