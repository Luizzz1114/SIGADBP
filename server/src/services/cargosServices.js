import CargosRepositorio from '../repositories/cargosRepositorio.js';

class CargosService {
  async listar() {
    return await CargosRepositorio.listar();
  }

  async validarNombreUnico(validar) {
    const resultado = await CargosRepositorio.validarNombreUnico(validar);
    if (resultado > 0) {
      return true;
    }
    return false;
  }

  async obtenerPorId(id) {
    return await CargosRepositorio.obtenerPorId(id);
  }

  async crear(cargo) {
    return await CargosRepositorio.crear(cargo);
  }

  async actualizar(cargo) {
    return await CargosRepositorio.actualizar(cargo);
  }

  async eliminar(id) {
    return await CargosRepositorio.eliminar(id);
  }
}

export default new CargosService();