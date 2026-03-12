import pool from '../config/database.js'

class Ubicacion {
	async listarEstados () {
    const sql = 'SELECT id, nombre FROM Estados ORDER BY nombre;';
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async listarMunicipios (idEstado) {
    const sql = 'SELECT id, nombre FROM Municipios WHERE idEstado = $1 ORDER BY nombre;';
    const resultado = await pool.query(sql, [idEstado]);
    return resultado.rows;
  } 

  async listarParroquias (idMunicipio) {
    const sql = 'SELECT id, nombre FROM Parroquias WHERE idMunicipio = $1 ORDER BY nombre;';
    const resultado = await pool.query(sql, [idMunicipio]);
    return resultado.rows;
  }
}

export default new Ubicacion();