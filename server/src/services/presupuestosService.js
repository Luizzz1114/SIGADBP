import PresupuestosRepositorio from '../repositories/presupuestosRepositorio.js';

class PresupuestosService {
  async listar() {
    return await PresupuestosRepositorio.listar();
  }

  async listarActivosMantenimientoBienes() {
    return await PresupuestosRepositorio.listarActivosMantenimientoBienes();
  }

  async listarActivos() {
    return await PresupuestosRepositorio.listarActivos();
  }

  async validarCodigoUnico(validar) {
    const resultado = await PresupuestosRepositorio.validarCodigoUnico(validar);
    if (resultado > 0) {
      return true;
    }
    return false;
  }

  async obtenerPorId(id) {
    return await PresupuestosRepositorio.obtenerPorId(id);
  }

  async indicadoresPresupuesto() {
    return await PresupuestosRepositorio.indicadoresPresupuesto();
  }

  async crear(presupuesto) {
    return await PresupuestosRepositorio.crear(presupuesto);
  }
  
  async actualizar(presupuesto) {   
    return await PresupuestosRepositorio.actualizar(presupuesto);
  }

  async eliminar(id) {
    return await PresupuestosRepositorio.eliminar(id);
  }
}

export default new PresupuestosService();