import pool from '../config/database.js';
import DesincorporacionesRepositorio from '../repositories/desincorporacionesRepositorio.js';
import BienesRepositorio from '../repositories/bienesRepositorio.js';
import PersonalRepositorio from '../repositories/personalRepositorio.js';

class DesincorporacionesServices {
  async listar() {
    return await DesincorporacionesRepositorio.listar();
  }
  
  async obtenerPorId(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const desincorporacion = await DesincorporacionesRepositorio.obtenerPorId(client, id);

      const bienes = await BienesRepositorio.obtenerPorIdDesincorporacion(client, id);
      
      const resultado = {
        ...desincorporacion,
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

  async crear(desincorporacion) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const idDesincorporacion = await DesincorporacionesRepositorio.crear(client, desincorporacion);

      if (desincorporacion.bienes && desincorporacion.bienes.length > 0) {
        for(const bien of desincorporacion.bienes ) {
          const desincorporaciones = {
            idDesincorporacion: idDesincorporacion,
            idBien: bien.id_bien,
            tipo:bien.tipo  
          };
          await BienesRepositorio.desvincularBienDesincorporacion(client, desincorporaciones);
          await DesincorporacionesRepositorio.crearDetalles(client, desincorporaciones);
        }
      }

      await client.query('COMMIT');
      return idDesincorporacion;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizar(desincorporacion) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const id = desincorporacion.id;
      const personalDependencia = await PersonalRepositorio.obtenerJefeDesincorporacion(client, id);
      await BienesRepositorio.deshacerDesincorporacion(client, id, personalDependencia);
      const idDesincorporacion = await DesincorporacionesRepositorio.actualizar(client, desincorporacion);
      await DesincorporacionesRepositorio.eliminarDetalles(client, idDesincorporacion);

      if (desincorporacion.bienes && desincorporacion.bienes.length > 0) {
        for(const bien of desincorporacion.bienes ) {
          const desincorporaciones = {
            idDesincorporacion: idDesincorporacion,
            idBien: bien.id_bien,
            tipo: bien.tipo
          };
          await BienesRepositorio.desvincularBienDesincorporacion(client, desincorporaciones);
          await DesincorporacionesRepositorio.crearDetalles(client, desincorporaciones);
        }
      }

      await client.query('COMMIT');
      return idDesincorporacion;
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

      const personalDependencia = await PersonalRepositorio.obtenerJefeDesincorporacion(client, id);
      await BienesRepositorio.deshacerDesincorporacion(client, id, personalDependencia);
      await DesincorporacionesRepositorio.eliminar(client, id);

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

export default new DesincorporacionesServices();