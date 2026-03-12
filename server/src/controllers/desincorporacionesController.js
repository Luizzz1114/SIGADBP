import DesincorporacionesServices from '../services/desincorporacionesService.js';

class DesincorporacionesController {
  async listar(req, res) {
    try {
      const desincorporaciones = await DesincorporacionesServices.listar();
      res.status(200).json(desincorporaciones);
    } catch (error) {
      res.status(400).json({ message: 'Error al listar las desincorporaciones', error: error.message });
    }
  }
  
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const desincorporacion = await DesincorporacionesServices.obtenerPorId(id);
      res.status(200).json(desincorporacion);
    } catch (error) {
      res.status(400).json({ message: 'Error al obtener la desincorporacion por ID.', error: error.message })
    }
  }

  async crear(req, res) {
    try {
      const desincorporacion = req.body;
      const resultado = await DesincorporacionesServices.crear(desincorporacion);
      if (resultado) {
        res.status(200).json({ message: 'Desincorporacion creada correctamente.' });
      } else {
        res.status(400).json({ message: 'Error al crear la desincorporacion.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al crear la desincorporacion.', error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const desincorporacion = req.body;
      const resultado = await DesincorporacionesServices.actualizar(desincorporacion);
      if (resultado) {
        res.status(200).json({ message: 'Desincorporacion actualizada correctamente.' });
      } else {
        res.status(400).json({ message: 'Error al actualizar la desincorporacion.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la desincorporacion.', error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await DesincorporacionesServices.eliminar(id);
      if (resultado) {
        res.status(200).json({ message: 'Desincorporacion desecha correctamente.' });
      } else {
        res.status(400).json({ message: 'Error al deshacer la desincorporacion.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al deshacer la desincorporacion.', error: error.message });
    }
  }
}

export default new DesincorporacionesController();