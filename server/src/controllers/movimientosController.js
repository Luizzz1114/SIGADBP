import MovimientosServices from '../services/movimientosService.js';

class MovimientosControllers {
  async listar(req, res) {
    try {
      const movimientos = await MovimientosServices.listar();
      res.status(200).json(movimientos);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar movimientos', error: error.message });
    }
  }
  
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const movimiento = await MovimientosServices.obtenerPorId(id);
      res.status(200).json(movimiento);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el movimiento por ID', error: error.message });
    }
  }
  
  async crear(req, res) {
    try {
      const movimiento = req.body;
      const resultado = await MovimientosServices.crear(movimiento);
      if (resultado) {
        res.status(200).json({ message: 'Movimiento creado exitosamente.' });
      } else {
        res.status(400).json({ message: 'Error al crear el movimiento' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el movimiento', error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const movimiento = req.body;
      const resultado = await MovimientosServices.actualizar(movimiento);
      if (resultado) {
        res.status(200).json({ message: 'Movimiento actualizado exitosamente.' });
      } else {
        res.status(400).json({ message: 'Error al actualizar el movimiento' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el movimiento', error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await MovimientosServices.eliminar(id);
      if (resultado) {
        res.status(200).json({ message: 'Movimiento eliminado exitosamente.' });
      } else {
        res.status(400).json({ message: 'Error al eliminar el movimiento' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el movimiento', error: error.message });
    }
  }
}

export default new MovimientosControllers();