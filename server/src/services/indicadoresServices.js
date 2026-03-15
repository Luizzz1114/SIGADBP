import IndicadoresRepositorio from '../repositories/indicadoresRepositorio.js';
import BienesRepositorio from '../repositories/bienesRepositorio.js';
import pool from '../config/database.js';

class IndicadoresServices {
  async listar() {
    return await IndicadoresRepositorio.listar();
  }

  async procesarKpiIBEO() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const IBEO = await IndicadoresRepositorio.IBEO(client);
      const resultadosIBEO = await BienesRepositorio.obtenerMetricasPorEstatus();

      const metrica = {
        valor: resultadosIBEO.p_operativos,
        idIndicador: IBEO.id
      };

      await IndicadoresRepositorio.crearMetrica(client, metrica);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new IndicadoresServices();
