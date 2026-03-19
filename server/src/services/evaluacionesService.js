import pool from '../config/database.js';
import EvaluacionesRepositorio from "../repositories/evaluacionesRepositorio.js";
import UsuariosRepositorio from '../repositories/usuariosRepositorio.js';

class EvaluacionesServices {
  async listarKpiCapacitacionSatisfaccion() {
    return await EvaluacionesRepositorio.listarKpiCapacitacionSatisfaccion();
  }

  async crear(evaluacion) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const id = evaluacion.id;
      const usuario = await UsuariosRepositorio.obtenerPorId(id);
      const idPersonal = usuario.id_personal;
      const resultado = await EvaluacionesRepositorio.crear(client, idPersonal, evaluacion);

      await client.query('COMMIT');
      return resultado;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new EvaluacionesServices();