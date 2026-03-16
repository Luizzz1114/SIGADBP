import IndicadoresRepositorio from '../repositories/indicadoresRepositorio.js';
import BienesRepositorio from '../repositories/bienesRepositorio.js';
import pool from '../config/database.js';

class IndicadoresServices {
  async listar(siglas) {
    let denominacion = null;
    switch (siglas) {
      case 'IBEO':
        denominacion = '% Bienes en Estado Operativo (%IBEO)';
        break;
      case 'ICMI':
        denominacion = 'Índice de Crecimiento Mensual de Inventario (ICMI)';
        break;
      default:
        denominacion = null;
        break;  
    }
    return await IndicadoresRepositorio.listar(denominacion);
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

    async procesarICMI() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const ICMI = await IndicadoresRepositorio.ICMI(client);
      const resultadosICMI = await BienesRepositorio.obtenerResumenMetricas();

      const metrica = {
        valor: resultadosICMI.total_bienes,
        idIndicador: ICMI.id
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
