import EvaluacionesService from "../services/evaluacionesService.js";

class EvaluacionesController {
  async listarKpiCapacitacionSatisfaccion(req, res) {
    try {
      const resultado = await EvaluacionesService.listarKpiCapacitacionSatisfaccion();
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar kpi: capacitacion y satisfaccion', error: error.message });
    }
  }

  async crear(req, res) {
    try {
      const evaluacion = req.body;
      const resultado = await EvaluacionesService.crear(evaluacion);
      if (resultado) {
        res.status(200).json({ message: "Evaluación registrada exitosamente." });
      } else {
        res.status(400).json({ message: "Error al registrar la evaluacion." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al registrar la evaluacion.", error: error.message });
    }
  }
}

export default new EvaluacionesController();
