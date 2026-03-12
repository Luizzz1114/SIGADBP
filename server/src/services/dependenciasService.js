import DependenciasRepositorio from '../repositories/dependenciasRepositorio.js';

class DependenciasService {
  async listar () {
    return await DependenciasRepositorio.listar();
  }

  async listarResponsables() {
    return await DependenciasRepositorio.listarResponsables();
  }

  async obtenerPorId (id) {
    return await DependenciasRepositorio.obtenerPorId(id);
  }

  async validarNombreUnico (validar) {
    const resultado = await DependenciasRepositorio.validarNombreUnico(validar);
    if (resultado > 0) {
      return true;
    }
    return false;
  }  

  async crear (dependencia) {
    return await DependenciasRepositorio.crear(dependencia);
  }

  async actualizar (dependencia) {
    return await DependenciasRepositorio.actualizar(dependencia);
  }
  
  async eliminar (id) {
    return await DependenciasRepositorio.eliminar(id);
  }
}

export default new DependenciasService();