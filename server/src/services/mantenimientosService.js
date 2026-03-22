import pool from '../config/database.js';
import MantenimientosRepositorio from '../repositories/mantenimientosRepositorio.js';
import GastosRepositorio from '../repositories/gastosRepositorio.js';

class MantenimientosServices {
  async listar() {
    return await MantenimientosRepositorio.listar();
  }
  
  async conteoMantenimiento() {
    return await MantenimientosRepositorio.conteoMantenimiento();
  }

  async promedioMantenimiento() {
    return await MantenimientosRepositorio.promedioMantenimiento();
  }

  async obtenerPorId(id) {
    return await MantenimientosRepositorio.obtenerPorId(id);
  }

  async crear(mantenimiento) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const idMantenimiento = await MantenimientosRepositorio.crear(client, mantenimiento);

      if (Number(mantenimiento.gasto) > 0 && mantenimiento.presupuesto && mantenimiento.fecha_inicio && idMantenimiento) {
        const gasto = {
          fecha: mantenimiento.fecha_inicio,
          monto: mantenimiento.gasto,
          presupuesto: mantenimiento.presupuesto,
          bien: null,
          mantenimiento: idMantenimiento
        };
        await GastosRepositorio.crear(client, gasto); 
      }

      await client.query('COMMIT');
      return idMantenimiento;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizar(mantenimiento) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const idMantenimiento = await MantenimientosRepositorio.actualizar(client, mantenimiento);
      
      await GastosRepositorio.eliminarGastoPorMantenimiento(client, idMantenimiento);

      if (Number(mantenimiento.gasto) > 0 && mantenimiento.presupuesto && mantenimiento.fecha_inicio && idMantenimiento) {
        const gasto = {
          fecha: mantenimiento.fecha_inicio,
          monto: mantenimiento.gasto,
          presupuesto: mantenimiento.presupuesto,
          bien: null,
          mantenimiento: idMantenimiento
        };
        await GastosRepositorio.crear(client, gasto);
      }

      await client.query('COMMIT');
      return idMantenimiento;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async eliminar(id) {
    return await MantenimientosRepositorio.eliminar(id);
  }
}

export default new MantenimientosServices();