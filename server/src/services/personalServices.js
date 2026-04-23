import pool from '../config/database.js';
import PersonalRepositorio from '../repositories/personalRepositorio.js';

class PersonalService {
  async listar() {
    return await PersonalRepositorio.listar();
  }

  async historialCargos() {
    return await PersonalRepositorio.historialCargos();
  }

  async listarSinUsuario() {
    return await PersonalRepositorio.listarSinUsuario();
  }

  async validarCedulaUnica(validar) {
    const resultado = await PersonalRepositorio.validarCedulaUnica(validar);
    if (resultado > 0) {
      return true;
    }
    return false;
  }

  async obtenerPorId(id) {
    return await PersonalRepositorio.obtenerPorId(id);
  }

  async crear(personal) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const idPersonal = await PersonalRepositorio.crear(client, personal);

      const resultado = await PersonalRepositorio.crearCargo(client, idPersonal, personal)

      await client.query('COMMIT');
      return resultado;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;     
    } finally {
      client.release();
    }
  }

  async actualizar(personal) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await PersonalRepositorio.actualizar(client, personal);

      const cargoActual = await PersonalRepositorio.obtenerCargoActivo(client, personal.id);

      if (!cargoActual || cargoActual.idcargo != personal.cargo || cargoActual.iddependencia != personal.dependencia) {
        await PersonalRepositorio.crearCargo(client, personal.id, personal);
      } else {
        await PersonalRepositorio.actualizarCargo(client, personal);
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
    return await PersonalRepositorio.eliminar(id);
  }
}

export default new PersonalService();