import IndicadoresRepositorio from '../repositories/indicadoresRepositorio.js';
import BienesRepositorio from '../repositories/bienesRepositorio.js';
import PresupuestoRepositorio from '../repositories/presupuestosRepositorio.js';
import EvaluacionesRepositorio from '../repositories/evaluacionesRepositorio.js';
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
      case 'IIET':
        denominacion = '% Inversión en Equipos Tecnológicos (%IIET)';
        break;
      case 'IIM':
        denominacion = '% Inversión en Muebles (%IIM)';
        break;
      case 'IIMB':
        denominacion = '% Inversión en Mantenimiento de Bienes (%IIMB)';
        break;
      case 'ICP':
        denominacion = '% Capacitación del Personal (%ICP)';
        break;
      case 'IPS':
        denominacion = '% Personal Satisfecho (%IPS)';
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

async procesarKpiIIET() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const IIET = await IndicadoresRepositorio.IIET(client);
      const resultadosIIET = await PresupuestoRepositorio.obtenerResumenMetricas();

      const itemTecnologico = resultadosIIET.find(
        item => item.tipo === "Compra de Equipos Tecnológicos"
      );

      const porcentaje = itemTecnologico ? itemTecnologico.porcentaje_uso : "0.00";

      const metrica = {
        valor: porcentaje,
        idIndicador: IIET.id
      };

      await IndicadoresRepositorio.crearMetricaSemestrales(client, metrica);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

async procesarKpiIIM() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const IIM = await IndicadoresRepositorio.IIM(client);
      const resultadosIIM = await PresupuestoRepositorio.obtenerResumenMetricas();

      const itemMueble = resultadosIIM.find(
        item => item.tipo === "Compra de Muebles"
      );

      const porcentaje = itemMueble ? itemMueble.porcentaje_uso : "0.00";

      const metrica = {
        valor: porcentaje,
        idIndicador: IIM.id
      };

      await IndicadoresRepositorio.crearMetricaSemestrales(client, metrica);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

async procesarKpiIIMB() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const IIMB = await IndicadoresRepositorio.IIMB(client);
      const resultadosIIMB = await PresupuestoRepositorio.obtenerResumenMetricas();

      const itemMantenimiento = resultadosIIMB.find(
        item => item.tipo === "Mantenimiento de Bienes"
      );

      const porcentaje = itemMantenimiento ? itemMantenimiento.porcentaje_uso : "0.00";

      const metrica = {
        valor: porcentaje,
        idIndicador: IIMB.id
      };

      await IndicadoresRepositorio.crearMetricaSemestrales(client, metrica);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async procesarKpiICP() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const ICP = await IndicadoresRepositorio.ICP(client);
      const resultadosICP = await EvaluacionesRepositorio.listarKpiCapacitacionSatisfaccion();

      const metrica = {
        valor: resultadosICP.porcentaje_capacitacion,
        idIndicador: ICP.id
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

  async procesarKpiIPS() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const IPS = await IndicadoresRepositorio.IPS(client);
      const resultadosIPS = await EvaluacionesRepositorio.listarKpiCapacitacionSatisfaccion();

      const metrica = {
        valor: resultadosIPS.porcentaje_satisfaccion,
        idIndicador: IPS.id
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
