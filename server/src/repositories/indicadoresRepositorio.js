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

  async ITPMB(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = 'Tiempo Promedio de Mantenimiento de Bienes (ITPMB)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async IDD(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Desincorporaciones por Deterioro (%IDD)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async IDO(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Desincorporaciones por Obsolescencia (%IDO)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async ITDB(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Tasa de Desincorporación de Bienes (%ITDB)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async IBNI(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Bienes No Identificados (%IBNI)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async TDRB(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Tasa de Disponibilidad Real de Bienes (%TDRB)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }
  
  async IAOM(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = 'Índice de Afectación Operativa por Mantenimiento (IAOM)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async listar(denominacion, hasta, periodo) {
    const sql = `
      SELECT I.id AS id_indicador, I.denominacion, I.frecuencia, I.meta, I.peligro,
        COALESCE(
          json_agg(
            json_build_object(
              'valor', M.valor,
              'periodo', M.periodo,
              'fecha', M.fecha,
              'detalles', M.detalles
            ) ORDER BY M.fecha ASC
          ) FILTER (WHERE M.fecha IS NOT NULL),
          '[]'::json
        ) AS historial_metricas
      FROM Indicadores I
      LEFT JOIN LATERAL (
        SELECT valor, periodo, fecha, detalles
        FROM Metricas
        WHERE idIndicador = I.id
          AND ($2::text IS NULL OR fecha < ($2::date + INTERVAL '1 month'))
          AND ($3::text IS NULL OR fecha <= CASE
            WHEN split_part($3, '-', 1) = 'I'
              THEN make_date(split_part($3, '-', 2)::int, 6, 30)
            ELSE make_date(split_part($3, '-', 2)::int, 12, 31)
          END)
        ORDER BY fecha DESC
        LIMIT 6
      ) AS M ON true
      WHERE I.denominacion = $1 OR $1 IS NULL
      GROUP BY I.id, I.denominacion, I.frecuencia, I.meta, I.peligro;`;
    const resultado = await pool.query(sql, [
      denominacion,
      hasta ? `${hasta}-01` : null,
      periodo || null
    ]);
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