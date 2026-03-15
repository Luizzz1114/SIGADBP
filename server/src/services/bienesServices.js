import pool from '../config/database.js';
import BienesRepositorio from '../repositories/bienesRepositorio.js';
import MueblesRepositorio from '../repositories/mueblesRepositorio.js';
import TecnologicosRepositorio from '../repositories/tecnologicosRepositorio.js';
import VehiculosRepositorio from '../repositories/vehiculosRepositorio.js';

class BienesServices {
  async listar() {
    return await BienesRepositorio.listar();
  }

  async listarOperativos() {
    return await BienesRepositorio.listarOperativos();
  }

  async listarNoAsignados() {
    return await BienesRepositorio.listarNoAsignados();
  }

  async validarNumeroBienUnico(validar) {
    const resultado = await BienesRepositorio.validarNumeroBienUnico(validar);
    if (resultado > 0) {
      return true;
    }
    return false;
  }
  
  async obtenerPorId(id) {
    return await BienesRepositorio.obtenerPorId(id);
  }

  async obtenerMetricasPorCategoria() {
    return await BienesRepositorio.obtenerMetricasPorCategoria();
  }
  
  async obtenerMetricasPorEstatus() {
    return await BienesRepositorio.obtenerMetricasPorEstatus();
  }

  async obtenerResumenMetricas() {
    return await BienesRepositorio.obtenerResumenMetricas();
  }

  async obtenerMetricasPorDependencia() {
    return await BienesRepositorio.obtenerMetricasPorDependencia();
  }

  async crear(bien) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const idBien = await BienesRepositorio.crear(bien, client);

      switch (bien.categoria) {
        case 'Mueble':
          await MueblesRepositorio.crear(idBien, bien, client);
          break;
        case 'Tecnológico':
          await TecnologicosRepositorio.crear(idBien, bien, client);
          break;          
        case 'Vehículo o Equipo de Elevación':
          await VehiculosRepositorio.crear(idBien, bien, client);
          break;
        default:
          throw new Error('Categoría de bien no válida');
      }

      await client.query('COMMIT');
      return idBien;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizar (bien) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await BienesRepositorio.actualizar(bien, client);

      switch (bien.categoria) {
        case 'Mueble':
          await MueblesRepositorio.actualizar(bien, client);
          break;
        case 'Tecnológico':
          await TecnologicosRepositorio.actualizar(bien, client);
          break;          
        case 'Vehículo o Equipo de Elevación':
          await VehiculosRepositorio.actualizar(bien, client);
          break;
        default:
          throw new Error('Categoría de bien no válida');
      }

      await client.query('COMMIT');
      return true;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async eliminar(id) {
    return await BienesRepositorio.eliminar(id);
  }
}

export default new BienesServices();