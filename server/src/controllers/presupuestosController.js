import PresupuestosService from '../services/presupuestosService.js';

class PresupuestosController {
  async listar(req, res) {
    try {
      const presupuestos = await PresupuestosService.listar();
      res.status(200).json(presupuestos);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar los presupuestos', error: error.message });
    }
  }

  async listarActivosMantenimiento(req, res) {
    try {
      const presupuestos = await PresupuestosService.listarActivosMantenimiento();
      res.status(200).json(presupuestos);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar los presupuestos activos para mantenimiento de bienes', error: error.message });
    }
  }

  async listarActivos(req, res) {
    try {
      const presupuestos = await PresupuestosService.listarActivos();
      res.status(200).json(presupuestos);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar los presupuestos activos', error: error.message });
    }
  }

  async validarCodigoUnico(req, res) {
    try {
      const validar = req.body;
      const existe = await PresupuestosService.validarCodigoUnico(validar);
      res.status(200).json({ existe });
    } catch (error) {
      res.status(500).json({ message: 'Error al validar el código único', error: error.message });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const presupuesto = await PresupuestosService.obtenerPorId(id);
      res.status(200).json(presupuesto);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el presupuesto por ID', error: error.message });
    }
  }

  async obtenerResumenMetricas(req, res) {
    try {
      const resultado = await PresupuestosService.obtenerResumenMetricas();
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener métricas de presupuesto', error: error.message });
    }
  }

  async crear(req, res) {
    try {
      const presupuesto = req.body;
      const resultado = await PresupuestosService.crear(presupuesto);
      if (resultado) {
        res.status(200).json({ message: 'Presupuesto creado exitosamente.' });
      } else {
        res.status(400).json({ error: 'Error al crear el presupuesto.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el presupuesto.', error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const presupuesto = req.body;
      const resultado = await PresupuestosService.actualizar(presupuesto);
      if (resultado) {
        res.status(200).json({ message: 'Presupuesto actualizado exitosamente.' });
      } else {
        res.status(400).json({ error: 'Error al actualizar el presupuesto.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el presupuesto.', error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params; 
      const resultado = await PresupuestosService.eliminar(id);
      if (resultado) {
        res.status(200).json({ message: 'Presupuesto eliminado exitosamente.' });
      } else {
        res.status(400).json({ error: 'Error al eliminar el presupuesto.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el presupuesto.', error: error.message });
    }
  }
}

export default new PresupuestosController();