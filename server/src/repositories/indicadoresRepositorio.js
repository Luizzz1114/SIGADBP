import pool from "../config/database.js";

class Indicadores {
  async IBEO(client) {
    const sql = "SELECT * FROM Indicadores WHERE denominacion = '% Bienes en Estado Operativo (%IBEO)';";
    const resultado = await client.query(sql);
    return resultado.rows[0];
  }

  async listar() {
    const sql = "SELECT * FROM vistaIndicadores;";
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async crearMetrica(client, metrica) {
    const { valor, idIndicador } = metrica;
    const sql = "INSERT INTO Metricas (periodo, valor, idIndicador) VALUES (TO_CHAR(CURRENT_DATE, 'MM-YYYY'), $1, $2)";
    await client.query(sql, [valor, idIndicador]);
  }
}

export default new Indicadores();