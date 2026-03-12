import IncorporacionesServices from '../services/incorporacionesService.js';

class IncorporacionesController {
  async listar(req, res) {
    try {
      const incorporaciones = await IncorporacionesServices.listar();
      res.status(200).json(incorporaciones);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar las incorporaciones', error: error.message });
    }
  }
  
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const incorporacion = await IncorporacionesServices.obtenerPorId(id);
      res.status(200).json(incorporacion);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la incorporación', error: error.message });
    }
  }

  async crear(req, res) {
    try {
      const payload = req.body;
      const resultado = await IncorporacionesServices.crear(payload);
      if ( resultado ) {
        res.status(200).json({ message: 'Incorporación creada correctamente' });
      } else {
        res.status(400).json({ message: 'Error al crear la incorporación' });
      } 
    } catch (error) {
      res.status(500).json({ message: 'Error al crear la incorporación', error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const payload = req.body;
      const resultado = await IncorporacionesServices.actualizar(payload);
      if (resultado) {
        res.status(200).json({ message: 'Incorporación actualizada correctamente' });
      } else {
        res.status(400).json({ message: 'Error al actualizar la incorporación' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la incorporación', error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await IncorporacionesServices.eliminar(id);
      if (resultado) {
        res.status(200).json({ message: 'Incorporación eliminada correctamente' });
      } else {
        res.status(404).json({ message: 'Incorporación no encontrada' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la incorporación', error: error.message });
    }
  }
}

export default new IncorporacionesController();