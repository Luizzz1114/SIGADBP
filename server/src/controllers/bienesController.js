import BienesServices from '../services/bienesServices.js';

class BienesController {
	async listar (req, res) {
		try {
			const bienes = await BienesServices.listar();
			res.status(200).json(bienes);
		} catch (error) {
			res.status(500).json({ message: 'Error al listar bienes.', error: error.message });
		}
	}

	async listarOperativos(req, res) {
		try {
			const bienes = await BienesServices.listarOperativos();
			res.status(200).json(bienes);
		} catch (error) {
			res.status(500).json({ message: 'Error al listar bienes operativos.', error: error.message });
		}
	}

	async listarNoAsignados (req, res) {
		try {
			const bienes = await BienesServices.listarNoAsignados();
			res.status(200).json(bienes);
		} catch (error) {
			res.status(500).json({ message: 'Error al listar bienes no asignados.', error: error.message });
		}
	}

	async validarNumeroBienUnico(req, res) {
		try {
			const validar = req.body;
			const esUnico = await BienesServices.validarNumeroBienUnico(validar);
			res.status(200).json({ esUnico });
		} catch (error) {
			res.status(500).json({ message: 'Error al validar numero único', error: error.message });
		}
	}

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const bien = await BienesServices.obtenerPorId(id);
      res.status(200).json(bien);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el bien por ID.', error: error.message });
    }
  }
	
	async bienesCategoria(req, res) {
		try {	
			const resultados = await BienesServices.bienesCategoria();
			res.status(200).json(resultados);
		} catch (error) {
			res.status(500).json({ message: 'Error al obtener bienes por categoría.', error: error.message });
		}
	}

	async estadoBienes(req, res) {
		try {
			const resultados = await BienesServices.estadoBienes();
			res.status(200).json(resultados);
		} catch (error) {
			res.status(500).json({ message: 'Error al obtener el estado de los bienes.', error: error.message });
		}
	}

	async paneles(req, res) {
		try {
			const resultados = await BienesServices.paneles();
			res.status(200).json(resultados);
		} catch (error) {
			res.status(500).json({ message: 'Error al obtener el estado de los paneles.', error: error.message });
		}
	}

	async categoriaDependencia(req, res) {
		try {
			const resultados = await BienesServices.categoriaDependencia();
			res.status(200).json(resultados);
		} catch (error) {
			res.status(500).json({ message: 'Error al obtener dependencia por categoria.', error: error.message });
		}
	}

  async crear(req, res) {
    try {
			const bien = req.body;
			const resultado = await BienesServices.crear(bien);
			if(resultado) {
				res.status(201).json({ message: 'Bien creado exitosamente.' });
			} else {
				res.status(400).json({ message: 'Error al crear bien.' });
			}
    } catch (error) {
			res.status(500).json({ message: 'Error al crear bien.', error: error.message });
		}
  }

  async actualizar(req, res) {
    try {
			const bien = req.body;
			const resultado = await BienesServices.actualizar(bien);
			if(resultado) {
				res.status(200).json({ message: 'Bien actualizado exitosamente.' });
			} else {
				res.status(400).json({ message: 'Error al actualizar bien.' });
			}
    } catch (error) {
			res.status(500).json({ message: 'Error al actualizar bien', error: error.message });
		}
  }

	async eliminar(req, res) {
		try {
			const { id } = req.params;
			const resultado = await BienesServices.eliminar(id);
			if(resultado) {
				res.status(200).json({ message: 'Bien eliminado exitosamente.' });
			} else {
				res.status(400).json({ message: 'Error al eliminar bien.' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Error al eliminar bien.', error: error.message })
		}
	}
}

export default new BienesController();