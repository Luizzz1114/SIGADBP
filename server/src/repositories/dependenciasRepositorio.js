import pool from "../config/database.js";

class Dependencias {
  async listar() {
    const sql = "SELECT id, nombre, tipo, direccion FROM vistaDependencias ORDER BY tipo, nombre;";
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async listarResponsables() {
    const sql = "SELECT * FROM vistaResponsables";
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async obtenerPorId(id) {
    const sql = "SELECT * FROM vistaDependencias WHERE id = $1;";
    const resultado = await pool.query(sql, [id]);
    return resultado.rows[0];
  }

  async validarNombreUnico(validar) {
    const { nombre, id = null } = validar;
    const sql = 'SELECT COUNT(*) FROM Dependencias WHERE nombre = $1 AND id IS DISTINCT FROM $2';
    const resultado = await pool.query(sql, [nombre, id]);
    return parseInt(resultado.rows[0].count);
  }

  async crear(dependencia) {
    const { nombre, tipo, direccion, parroquia } = dependencia;
    const sql = "INSERT INTO Dependencias (nombre, tipo, direccion, idParroquia) VALUES ($1, $2, $3, $4);";
    const resultado = await pool.query(sql, [nombre, tipo, direccion, parroquia]);
    return resultado.rowCount === 1;
  }

  async actualizar(dependencia) {
    const { nombre, tipo, direccion, parroquia, id } = dependencia;
    const sql = "UPDATE Dependencias SET nombre = $1, tipo = $2, direccion = $3, idParroquia = $4 WHERE id = $5;";
    const resultado = await pool.query(sql, [nombre, tipo, direccion, parroquia, id]);
    return resultado.rowCount === 1;
  }

  async eliminar(id) {
    const sql = "DELETE FROM Dependencias WHERE id = $1";
    const resultado = await pool.query(sql, [id]);
    return resultado.rowCount === 1;
  }
}

export default new Dependencias();
