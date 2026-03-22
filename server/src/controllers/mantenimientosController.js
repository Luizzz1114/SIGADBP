import MantenimientosServices from '../services/mantenimientosService.js';

class MantenimientosController {
  async listar(req, res) {
    try {
      const mantenimientos = await MantenimientosServices.listar();
      res.status(200).json(mantenimientos);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar mantenimientos', error: error.message });
    }
  }
  
  async conteoMantenimiento(req, res) {
     try {
      const conteo = await MantenimientosServices.conteoMantenimiento();
      res.status(200).json(conteo);
     } catch (error) {
      res.status(500).json({ message: 'Error al listar el conteo de mantenimiento', error: error.message });
     }
  }

  async promedioMantenimiento(req, res) {
    try {
      const promedio = await MantenimientosServices.promedioMantenimiento();
      res.status(200).json(promedio);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar el promedio de mantenimientos', error: error.message });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const mantenimiento = await MantenimientosServices.obtenerPorId(id);
      res.status(200).json(mantenimiento);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener mantenimiento por id', error: error.message });
    }
  }

  async crear(req, res) {
    try {
      const mantenimiento = req.body;
      const resultado = await MantenimientosServices.crear(mantenimiento);
      if (resultado) {
        res.status(200).json({ message: 'Mantenimiento creado exitosamente' });
      } else {
        res.status(400).json({ message: 'Error al crear el mantenimiento' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al crear mantenimiento', error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await MantenimientosServices.eliminar(id);
      if (resultado) {
        res.status(200).json({ message: 'Mantenimiento eliminado exitosamente' });
      } else {
        res.status(400).json({ message: 'Error al eliminar el mantenimiento' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar mantenimiento', error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const mantenimiento = req.body;
      const resultado = await MantenimientosServices.actualizar(mantenimiento);
      if (resultado) {
        res.status(200).json({ message: 'Mantenimiento actualizado exitosamente' });
      } else {
        res.status(400).json({ message: 'Error al actualizar el mantenimiento' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar mantenimiento', error: error.message });
    }
  }
}

export default new MantenimientosController();