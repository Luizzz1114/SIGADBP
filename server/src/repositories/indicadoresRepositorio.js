import pool from "../config/database.js";

class Indicadores {
  async IBEO(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Bienes en Estado Operativo (%IBEO)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async ICMI(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = 'Índice de Crecimiento Mensual de Inventario (ICMI)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async IIET(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Inversión en Equipos Tecnológicos (%IIET)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async IIM(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Inversión en Muebles (%IIM)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async IIMB(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Inversión en Mantenimiento de Bienes (%IIMB)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async ICP(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Capacitación del Personal (%ICP)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async IPS(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Personal Satisfecho (%IPS)';";
    const resultado = await client.query(sql); 
    return resultado.rows[0];
  }

  async IBODP(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Bienes Operativos Después del Mantenimiento (%IBODP)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async listar(denominacion) {
    const sql = "SELECT * FROM vistaIndicadores WHERE denominacion = $1 OR $1 IS NULL;";
    const resultado = await pool.query(sql, [denominacion]);
    return resultado.rows;
  }

  async crearMetrica(client, metrica) {
    const { valor, detalles, idIndicador } = metrica;
    const sql = "INSERT INTO Metricas (periodo, valor, detalles, idIndicador) VALUES (TO_CHAR(CURRENT_DATE, 'MM-YYYY'), $1, $2, $3)";
    await client.query(sql, [valor, detalles, idIndicador]);
  }

  async crearMetricaSemestrales(client, metrica) {
    const { valor, detalles, idIndicador } = metrica;
    const sql = `INSERT INTO Metricas (periodo, valor, detalles, idIndicador) 
    VALUES (
      CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) <= 6 THEN 'I-' || TO_CHAR(CURRENT_DATE, 'YYYY')
        ELSE 'II-' || TO_CHAR(CURRENT_DATE, 'YYYY')
      END, $1, $2, $3)`;
    await client.query(sql, [valor, detalles, idIndicador]);
  }
}

export default new Indicadores();