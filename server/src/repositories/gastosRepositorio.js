import pool from "../config/database.js";

class Gastos {
  async obtenerGastosPorPresupuesto(client, id) {
    const sql = 'SELECT * FROM vistaGastosPorIncorporacion WHERE idIncorporacion = $1';
    const resultado = await client.query(sql, [id]);
    return resultado.rows;
  }

  async crear(client, gasto) {
    const { fecha, monto, presupuesto, bien, mantenimiento } = gasto;
    const sql = "INSERT INTO gastos (fecha, monto, idPresupuesto, idBien, idMantenimiento) VALUES ($1,$2, $3, $4, $5)";
    await client.query(sql, [fecha, monto, presupuesto, bien, mantenimiento]);
  }

  async eliminarGastoPorIncorporacion(client, id) {
    const sql = "DELETE FROM Gastos WHERE idBien IN (SELECT id FROM Bienes WHERE idIncorporacion = $1)";
    await client.query(sql, [id]);
  }

  async eliminarGastoPorMantenimiento(client, idMantenimiento) {
    const sql = "DELETE FROM Gastos WHERE idMantenimiento = $1";
    await client.query(sql, [idMantenimiento]);
  }
}

export default new Gastos();
