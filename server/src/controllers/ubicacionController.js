import UbicacionService from '../services/ubicacionService.js';

class UbicacionController {
    async listarEstados (req, res) {
    try {
      const estados = await UbicacionService.listarEstados();
      res.status(200).json(estados);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar estados.' });
    }
  }

  async listarMunicipios (req, res) {
    try {
      const { idEstado } = req.params;
      const municipios = await UbicacionService.listarMunicipios(idEstado);
      res.status(200).json(municipios);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar municipios.' });
    }
  } 

  async listarParroquias (req, res) {
    try {
      const { idMunicipio } = req.params;
      const parroquias = await UbicacionService.listarParroquias(idMunicipio);
      res.status(200).json(parroquias);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar parroquias.' });
    }
  }
}

export default new UbicacionController();