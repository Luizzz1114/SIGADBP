import DependenciasService from '../services/dependenciasService.js';

class DependenciasController {
  async listar (req, res) {
    try {
      const dependencias = await DependenciasService.listar();
      res.status(200).json(dependencias);
    } catch (error) {
			res.status(500).json({ message: 'Error al listar dependencias.', error: error.message });
		}
  }

  async listarResponsables (req, res) {
    try {
      const dependencias = await DependenciasService.listarResponsables();
      res.status(200).json(dependencias);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar dependencias con responsables.', error: error.message });
    }
  }

  async obtenerPorId (req, res) {
    try {
      const { id } = req.params;
      const dependencia = await DependenciasService.obtenerPorId(id);
      res.status(200).json(dependencia);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener dependencia por ID.', error: error.message });
    }
  }

  async validarNombreUnico (req, res) {
    try {
      const validar = req.body;
      const esUnica = await DependenciasService.validarNombreUnico(validar);
      res.status(200).json({ esUnica });
    } catch (error) {
      res.status(500).json({ message: 'Error al validar nombre de dependencia.', error: error.message });
    }
  }

  async crear (req, res) {
    try {
      const dependencia = req.body;
      const resultado = await DependenciasService.crear(dependencia);
      if (resultado) {
        res.status(200).json({ message: 'Dependencia creada exitosamente.' });
      } else {
        res.status(400).json({ error: 'Error al crear dependencia.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al crear dependencia.', error: error.message });
    }
  }

  async actualizar (req, res) {
    try {
      const dependencia = req.body;
      const resultado = await DependenciasService.actualizar(dependencia);
      if (resultado) {
        res.status(200).json({ message: 'Dependencia actualizada exitosamente.' });
      } else {
        res.status(400).json({ error: 'No se pudo actualizar dependencia.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar dependencia.', error: error.message });
    }
  }

  async eliminar (req, res) {
    try {
      const { id } = req.params;
      const resultado = await DependenciasService.eliminar(id);
      if (resultado) {
        res.status(200).json({ message: 'Dependencia eliminada exitosamente.' });
      } else {
        res.status(404).json({ error: 'Dependencia no encontrada.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar dependencia.', error: error.message });
    }
  }
}

export default new DependenciasController();