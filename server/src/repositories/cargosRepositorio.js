import pool from '../config/database.js';

class Cargos {
  async listar() {
    const sql = 'SELECT id, nombre, tipo FROM Cargos ORDER BY nombre;';
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async validarNombreUnico(validar) {
    const { nombre, id = null } = validar;
    const sql = 'SELECT COUNT(*) FROM Cargos WHERE nombre = $1 AND id IS DISTINCT FROM $2;';
    const resultado = await pool.query(sql, [nombre, id]);
    return parseInt(resultado.rows[0].count);
  }

  async obtenerPorId(id) {
    const sql = 'SELECT id, nombre, tipo FROM Cargos WHERE id = $1;';
    const resultado = await pool.query(sql, [id]);
    return resultado.rows[0];
  }

  async crear(cargo) {
    const { nombre, tipo } = cargo;
    const sql = 'INSERT INTO Cargos (nombre, tipo) VALUES ($1, $2);';
    const resultado = await pool.query(sql,[nombre, tipo]);
    return resultado.rowCount === 1;
  }

  async actualizar(cargo) {
    const { id, nombre, tipo } = cargo;
    const sql = 'UPDATE Cargos SET nombre = $1, tipo = $2 WHERE id = $3;';
    const resultado = await pool.query(sql, [nombre, tipo, id]);
    return resultado.rowCount === 1;
  }

  async eliminar(id) {
    const sql = 'DELETE FROM Cargos WHERE id = $1;';
    const resultado = await pool.query(sql, [id]);
    return resultado.rowCount === 1;
  }
}

export default new Cargos();