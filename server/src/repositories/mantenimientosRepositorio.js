import pool from '../config/database.js';

class Mantenimientos {
  async listar() {
    const sql = "SELECT * FROM vistaMantenimiento ORDER BY (estatus = 'En proceso') DESC, TO_DATE(fecha_inicio, 'DD/MM/YYYY') DESC;";
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async conteoMantenimiento() {
    const sql = 'SELECT * FROM vistaMantenimientoEfectivo;';
    const resultado = await pool.query(sql);
    return resultado.rows[0];
  }

  async promedioMantenimiento() {
    const sql = 'SELECT * FROM vistaPromedioMantenimiento;';
    const resultado = await pool.query(sql);
    return resultado.rows[0];
  }

  async obtenerPorId(id) {
    const sql = 'SELECT * FROM vistaMantenimiento WHERE id = $1;';
    const resultado = await pool.query(sql, [id]);
    return resultado.rows[0];
  }

  async crear(client, mantenimiento) {
    const { bien, tipo, descripcion, fecha_inicio } = mantenimiento;
    const sql = 'INSERT INTO mantenimientos (fechaInicio, tipo, descripcion, idBien) VALUES ($1, $2, $3, $4) RETURNING id;';
    const resultado = await client.query(sql, [fecha_inicio, tipo, descripcion, bien]);
    return resultado.rows[0].id;
  }

  async actualizar(client, mantenimiento) {
    const { fecha_inicio, fecha_fin, estado_posterior, tipo, estatus, descripcion, id } = mantenimiento;
    const sql = 'UPDATE mantenimientos SET fechaInicio = $1, fechaFin = $2, estadoPosterior = $3, tipo = $4, descripcion = $5, estatus = $6 WHERE id = $7 RETURNING id;';
    const resultado = await client.query(sql, [fecha_inicio, fecha_fin, estado_posterior, tipo, descripcion, estatus, id]);
    return resultado.rows[0].id;
  }

  async eliminar(id) {
    const sql = 'DELETE FROM mantenimientos WHERE id = $1;';
    const resultado = await pool.query(sql, [id]);
    return resultado.rowCount === 1;
  }
}

export default new Mantenimientos();