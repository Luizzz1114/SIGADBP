import PersonalService from "../services/personalServices.js";

class PersonalController {
  async listar(req, res) {
    try {
      const personal = await PersonalService.listar();
      res.status(200).json(personal);
    } catch (error) {
      res.status(500).json({ message: "Error al listar personal.", error: error.message });
    }
  }

  async listarSinUsuario(req, res) {
    try {
      const personal = await PersonalService.listarSinUsuario();
      res.status(200).json(personal);
    } catch (error) {
      res.status(500).json({ message: "Error al listar personal sin usuario.", error: error.message });
    }
  }

  async validarCedulaUnica(req, res) {
    try {
      const validar = req.body;
      const esUnica = await PersonalService.validarCedulaUnica(validar);
      res.status(200).json({ esUnica });
    } catch (error) {
      res.status(500).json({ message: "Error al validar cédula.", error: error.message });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const personal = await PersonalService.obtenerPorId(id);
      res.status(200).json(personal);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener personal por ID.",
        error: error.message,
      });
    }
  }

  async crear(req, res) {
    try {
      const personal = req.body;
      const resultado = await PersonalService.crear(personal);
      if (resultado) {
        res.status(200).json({ message: "Personal creado exitosamente." });
      } else {
        res.status(400).json({ message: "Error al crear personal." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al crear personal.", error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const personal = req.body;
      const resultado = await PersonalService.actualizar(personal);
      if (resultado) {
        res.status(200).json({ message: "Personal actualizado exitosamente." });
      } else {
        res.status(400).json({ message: "Error al actualizar personal." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar personal.", error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await PersonalService.eliminar(id);
      if (resultado) {
        res.status(200).json({ message: "Personal eliminado correctamente." });
      } else {
        res.status(404).json({ message: "Error al eliminar personal." });
      }
    } catch (error) {
      if (error.code === '23503') {
        return res.status(409).json({ message: "No se puede eliminar el personal porque tiene registros asociados." });
      }
      res.status(500).json({ message: "Error al eliminar personal.", error: error.message });
    }
  }
}

export default new PersonalController();
