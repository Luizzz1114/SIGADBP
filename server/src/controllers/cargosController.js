import CargosService from '../services/cargosService.js';

class CargosController {
  async listar (req, res) {
    try {
      const cargos = await CargosService.listar();
      res.status(200).json(cargos);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar cargos.', error: error.message });  
    }
  }

  async validarNombreUnico (req, res) {
    try {
      const validar = req.body;
      const esUnico = await CargosService.validarNombreUnico(validar);
      res.status(200).json({ esUnico });
    } catch (error) {
      res.status(500).json({ message: 'Error al validar nombre único.', error: error.message });
    }
  }

  async obtenerPorId (req, res) {
    try {
      const { id } = req.params;
      const cargo = await CargosService.obtenerPorId(id);
      res.status(200).json(cargo);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener cargo por ID.', error: error.message });
    }
  }

  async crear (req, res) {
    try {
      const cargo = req.body;
      const resultado = await CargosService.crear(cargo);
      if(resultado) {
        res.status(201).json({ message: 'Cargo creado exitosamente.' });
      } else {
        res.status(400).json({ message: 'Error al crear cargo.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al crear cargo.', error: error.message });
    }
  }

  async actualizar (req, res) {
    try {
      const cargo = req.body;
      const resultado = await CargosService.actualizar(cargo);
      if(resultado) {
        res.status(200).json({ message: 'Cargo actualizado exitosamente.' });
      } else {
        res.status(400).json({ message: 'Error al actualizar cargo.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar cargo.', error: error.message });
    }
  }

  async eliminar (req, res) {
    try {
      const { id } = req.params;
      const resultado = await CargosService.eliminar(id);
      if(resultado) {
        res.status(200).json({ message: 'Cargo eliminado exitosamente.' });
      } else {
        res.status(400).json({ message: 'Error al eliminar cargo.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar cargo.', error: error.message });
    }
  }
}

export default new CargosController();