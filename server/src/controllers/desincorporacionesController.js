import DesincorporacionesServices from '../services/desincorporacionesService.js';
import { uploadMiddleware } from '../middlewares/multerMiddleware.js';

class DesincorporacionesController {
  async listar(req, res) {
    try {
      const desincorporaciones = await DesincorporacionesServices.listar();
      res.status(200).json(desincorporaciones);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar las desincorporaciones', error: error.message });
    }
  }
  
  async desincorporacionMetricas(req, res) {
    try {
      const desincorporacionesMetricas = await DesincorporacionesServices.desincorporacionMetricas();
      res.status(200).json(desincorporacionesMetricas);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar las desincorporaciones por deterioro', error: error.message });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const desincorporacion = await DesincorporacionesServices.obtenerPorId(id);
      res.status(200).json(desincorporacion);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la desincorporacion por ID.', error: error.message })
    }
  }

  async crear(req, res) {
    // Le decimos a Multer que intercepte el campo llamado 'comprobante'
    const procesarSubida = uploadMiddleware.single('comprobante');

    procesarSubida(req, res, async (errorSubida) => {
      if (errorSubida) {
        return res.status(400).json({ message: 'Error al subir el archivo.', error: errorSubida.message });
      }

      try {
        // 1. Tomamos los datos de texto que llegaron
        const desincorporacion = { ...req.body };
        
        // 2. Parseamos el array de bienes (FormData los envía como texto)
        if (typeof desincorporacion.bienes === 'string') {
          desincorporacion.bienes = JSON.parse(desincorporacion.bienes);
        }

        // 3. ¡La clave! Inyectamos el nombre de la foto de vuelta al JSON
        if (req.file) {
          desincorporacion.comprobante = req.file.filename;
        }

        // 4. Mandamos el JSON completo a tu capa lógica
        const resultado = await DesincorporacionesServices.crear(desincorporacion);

        if (resultado) {
          res.status(200).json({ message: 'Desincorporación creada correctamente.'});
        } else {
          res.status(400).json({ message: 'Error al crear la desincorporación.' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error al crear la desincorporación.', error: error.message });
      }
    });
  }

  async actualizar(req, res) {
    const procesarSubida = uploadMiddleware.single('comprobante');

    procesarSubida(req, res, async (errorSubida) => {
      if (errorSubida) {
        return res.status(400).json({ message: 'Error al subir la imagen.', error: errorSubida.message });
      }

      try {
        const desincorporacion = { ...req.body };

        if (typeof desincorporacion.bienes === 'string') {
          desincorporacion.bienes = JSON.parse(desincorporacion.bienes);
        }

        // Si el usuario subió una FOTO NUEVA, la agregamos al JSON
        if (req.file) {
          desincorporacion.comprobante = req.file.filename;
        }
        // Si no subió foto, "desincorporacion.comprobante" simplemente no existirá,
        // y nuestro Servicio sabrá qué hacer.

        const resultado = await DesincorporacionesServices.actualizar(desincorporacion);

        if (resultado) {
          res.status(200).json({ message: 'Desincorporación actualizada correctamente.', id: resultado });
        } else {
          res.status(400).json({ message: 'Error al actualizar.' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error en la actualización.', error: error.message });
      }
    });
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

  async generarReporte(req, res) {
    try {
      const { idDesincorporacion } = req.params;
      const buffer = await DesincorporacionesServices.generarReporte(idDesincorporacion);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=reporte_desincorporacion.xlsx",
      );
      res.send(buffer);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al generar reporte.", error: error.message });
    }
  }
}

export default new DesincorporacionesController();