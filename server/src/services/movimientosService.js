import pool from '../config/database.js';
import MovimientosRepositorio from '../repositories/movimientosRepositorio.js';
import BienesRepositorio from '../repositories/bienesRepositorio.js';
import PersonalRepositorio from '../repositories/personalRepositorio.js';

class MovimientosServices {
  async listar() {
    return MovimientosRepositorio.listar();
  }

  async obtenerPorId(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const movimiento = await MovimientosRepositorio.obtenerPorId(client, id);
      const bienes = await BienesRepositorio.obtenerPorIdMovimiento(client, id);

      const resultado = {
        ...movimiento,
        bienes: bienes
      };

      await client.query('COMMIT');
      return resultado;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async crear(movimiento) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const idMovimiento = await MovimientosRepositorio.crear(client, movimiento);
      
      if(movimiento.bienes && movimiento.bienes.length > 0) {
        for(const bien of movimiento.bienes) {
          const movimientos = {
            idMovimiento: idMovimiento,
            idBien: bien.id_bien,
            idDestino: movimiento.destino,
            idReceptor: movimiento.receptor
          };
          await BienesRepositorio.actualizarMovimiento(client, movimientos);
          await MovimientosRepositorio.crearDetalles(client, movimientos);
        }
      }

      await client.query('COMMIT');
      return idMovimiento;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizar(movimiento) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const id = movimiento.id;
      const personalDependencia = await PersonalRepositorio.obtenerJefeMovimiento(client, id);
      await BienesRepositorio.deshacerMovimiento(client, id, personalDependencia);
      await MovimientosRepositorio.eliminarDetalles(client, id);
      await MovimientosRepositorio.actualizar(client, movimiento);

      if(movimiento.bienes && movimiento.bienes.length > 0) {
        for(const bien of movimiento.bienes) {
          const movimientos = {
            idMovimiento: id,
            idBien: bien.id_bien,
            idDestino: movimiento.destino,
            idReceptor: movimiento.receptor
          };
          await BienesRepositorio.actualizarMovimiento(client, movimientos);
          await MovimientosRepositorio.crearDetalles(client, movimientos);
        }
      }

      await client.query('COMMIT');
      return personalDependencia;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async eliminar(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const personalDependencia = await PersonalRepositorio.obtenerJefeMovimiento(client, id);
      await BienesRepositorio.deshacerMovimiento(client, id, personalDependencia);
      await MovimientosRepositorio.eliminar(client, id);

      await client.query('COMMIT');
      return personalDependencia;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }  
}

export default new MovimientosServices();