import pool from '../config/database.js';

class Presupuestos {
	async listar() {
		const sql = "SELECT * FROM vistaPresupuestos ORDER BY (estatus = 'Activo') DESC, anio, semestre;";
		const resultado = await pool.query(sql);
		return resultado.rows;
	}

	async listarActivosMantenimientoBienes() {
		const sql = "SELECT * FROM vistaPresupuestos WHERE estatus = 'Activo' AND tipo = 'Mantenimiento de Bienes';";
		const resultado = await pool.query(sql);
		return resultado.rows;
	}

	async listarActivos() {
		const sql = "SELECT * FROM vistaPresupuestos WHERE estatus = 'Activo' AND tipo IS DISTINCT FROM 'Mantenimiento de Bienes';";
		const resultado = await pool.query(sql);
		return resultado.rows;
	}

	async obtenerPorId(id) {
		const sql = 'SELECT * FROM vistaPresupuestos WHERE id = $1;';
		const resultado = await pool.query(sql, [id]);
		return resultado.rows[0];
	}

	async validarCodigoUnico(validar) {
		const { codigo, id = 0 } = validar;
		const sql = 'SELECT COUNT(*) FROM Presupuestos WHERE codigoPartida = $1 AND id IS DISTINCT FROM $2;';
		const resultado = await pool.query(sql, [codigo, id || 0]);
		return parseInt(resultado.rows[0].count);
	}

	async indicadoresPresupuesto() {
		const sql = 'SELECT * FROM kpiPresupuestos';
		const resultado = await pool.query(sql);
		return resultado.rows;
	}

	async crear(presupuesto) {
		const { codigo, anio, semestre, tipo, montousd, montobs, tasacambio, descripcion } = presupuesto;
		const sql = 'INSERT INTO presupuestos (codigoPartida, anioFiscal, semestre, tipo, montoUsd, montoBs, tasaCambio, descripcion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);';
		const resultado = await pool.query(sql, [codigo, anio, semestre, tipo, montousd, montobs, tasacambio, descripcion]);
		return resultado.rowCount === 1;
	}

	async actualizar(presupuesto) {
		const { id, codigo, montousd, montobs, tasacambio, descripcion, estatus } = presupuesto;
		const sql = 'UPDATE presupuestos SET codigoPartida = $1, montoUsd = $2, montoBs = $3, tasaCambio = $4, descripcion = $5, estatus = $6 WHERE id = $7;';
		const resultado = await pool.query(sql, [codigo, montousd, montobs, tasacambio, descripcion, estatus, id]);
		return resultado.rowCount === 1;
	}

	async eliminar(id) {
		const sql = 'DELETE FROM presupuestos WHERE id = $1;';
		const resultado = await pool.query(sql, [id]);
		return resultado.rowCount === 1;
	}
}

export default new Presupuestos();