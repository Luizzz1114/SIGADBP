import UbicacionRepositorio from '../repositories/ubicacionRepositorio.js';

class UbicacionService {
  async listarEstados () {
    return await UbicacionRepositorio.listarEstados();
  }

  async listarMunicipios (idEstado) {
    return await UbicacionRepositorio.listarMunicipios(idEstado);
  } 

  async listarParroquias (idMunicipio) {
    return await UbicacionRepositorio.listarParroquias(idMunicipio);
  }
}

export default new UbicacionService();