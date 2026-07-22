import pool from '../config/database.js';

class Bienes {
  async listar() {
    const sql = `SELECT * FROM vistaBienes ORDER BY 
      CASE estatus
        WHEN 'Operativo' THEN 1
        WHEN 'En mantenimiento' THEN 2
        WHEN 'No asignado' THEN 3
        WHEN 'Desincorporado' THEN 4
      END, dependencia, numero;`;
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async listarPorDependencia(idDependencia) { 
    const sql = `SELECT numero, descripcion, serial, estatus
      FROM vistaBienes WHERE idd = $1
      ORDER BY 
      CASE estatus
        WHEN 'Operativo' THEN 1
        WHEN 'En mantenimiento' THEN 2
      END, numero;`;
    const resultado = await pool.query(sql, [idDependencia]);
    return resultado.rows;
  }

  async listarOperativos() {
    const sql = "SELECT * FROM vistaBienes WHERE estatus = 'Operativo' ORDER BY numero;";
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async listarNoAsignados() {
    const sql = "SELECT * FROM vistaBienes WHERE estatus = 'No asignado' ORDER BY numero;";
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async bienesNoIdentificados(hasta) {
    const sql = `
      WITH fecha_corte AS (
        SELECT ($1::date + INTERVAL '1 month' - INTERVAL '1 day')::date AS fecha
      ), bienes_activos AS (
        SELECT B.*
        FROM Bienes B
        LEFT JOIN Incorporaciones I ON I.id = B.idIncorporacion
        CROSS JOIN fecha_corte F
        WHERE (I.fechaEntrada IS NULL OR I.fechaEntrada <= F.fecha)
          AND NOT EXISTS (
            SELECT 1
            FROM DetallesDesincorporacion DD
            INNER JOIN Desincorporaciones D ON D.id = DD.idDesincorporacion
            WHERE DD.idBien = B.id AND D.fechaSalida <= F.fecha
          )
      )
      SELECT COUNT(*) AS total_bienes,
        COUNT(*) FILTER (WHERE numeroBien = 'S/N') AS total_sin_numero,
        ROUND(COALESCE(
          (COUNT(*) FILTER (WHERE numeroBien = 'S/N') * 100.0) / NULLIF(COUNT(*), 0), 0
        ), 2) AS porcentaje_sin_numero
      FROM bienes_activos;`;
    const resultado = await pool.query(sql, [hasta ? `${hasta}-01` : new Date().toISOString().slice(0, 10)]);
    return resultado.rows[0];
  }

  async validarNumeroBienUnico(validar) {
    const { numero, id = null } = validar;
    if (numero === 'S/N') return 0;
    const sql = 'SELECT COUNT(*) FROM Bienes WHERE numeroBien = $1 AND id IS DISTINCT FROM $2';
    const resultado = await pool.query(sql, [numero, id]);
    return parseInt(resultado.rows[0].count);
  }

  async obtenerPorId(id) {
    const sql = 'SELECT * FROM vistaBienes WHERE id = $1;';
    const resultado = await pool.query(sql, [id]);
    return resultado.rows[0];
  }
  
  async obtenerPorIdDesincorporacion(client, id) {
    const sql = 'SELECT * FROM vistaBienesDesincorporados WHERE idDesincorporacion = $1';
    const resultado = await client.query(sql, [id]);
    return resultado.rows;
  }

  async obtenerPorIdMovimiento(client, id) {
    const sql = 'SELECT * FROM vistaBienesPorMovimiento WHERE idMovimiento = $1';
    const resultado = await client.query(sql, [id]);
    return resultado.rows;
  }

  async obtenerMetricasPorCategoria() {
    const sql = 'SELECT * FROM vistaBienesPorCategoria;';
    const resultado = await pool.query(sql);
    return resultado.rows[0];
  }

  async obtenerMetricasPorEstatus() {
    const sql = 'SELECT * FROM vistaBienesPorEstatus;';
    const resultado = await pool.query(sql);
    return resultado.rows[0];
  }

  async obtenerResumenMetricas() {
    const sql = 'SELECT * FROM vistaMetricasBasicas;';
    const resultado = await pool.query(sql);
    return resultado.rows[0];
  }

  async obtenerMetricasPorDependencia() {
    const sql = 'SELECT * FROM vistaBienesPorDependencia ORDER BY p_bienes DESC;';
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async metricaDisponibilidadPorDependencia(hasta) {
    const sql = `
      WITH fecha_corte AS (
        SELECT ($1::date + INTERVAL '1 month' - INTERVAL '1 day')::date AS fecha
      ), mantenimiento_activo AS (
        SELECT M.idBien
        FROM Mantenimientos M
        CROSS JOIN fecha_corte F
        WHERE M.fechaInicio <= F.fecha
          AND (M.fechaFin IS NULL OR M.fechaFin > F.fecha)
        GROUP BY M.idBien
      ), bienes_activos AS (
        SELECT B.*
        FROM Bienes B
        LEFT JOIN Incorporaciones I ON I.id = B.idIncorporacion
        CROSS JOIN fecha_corte F
        WHERE (I.fechaEntrada IS NULL OR I.fechaEntrada <= F.fecha)
          AND NOT EXISTS (
            SELECT 1
            FROM DetallesDesincorporacion DD
            INNER JOIN Desincorporaciones D ON D.id = DD.idDesincorporacion
            WHERE DD.idBien = B.id AND D.fechaSalida <= F.fecha
          )
      ), conteo_bienes AS (
        SELECT D.id AS id_dependencia, D.nombre AS nombre_dependencia,
          COUNT(B.id) AS total_bienes,
          COUNT(M.idBien) AS bienes_mantenimiento,
          COUNT(B.id) - COUNT(M.idBien) AS bienes_operativos
        FROM Dependencias D
        LEFT JOIN bienes_activos B ON D.id = B.idDependencia
        LEFT JOIN mantenimiento_activo M ON B.id = M.idBien
        GROUP BY D.id, D.nombre
      )
      SELECT id_dependencia, nombre_dependencia, total_bienes, bienes_operativos,
        bienes_mantenimiento,
        ROUND(COALESCE((bienes_operativos * 100.0) / NULLIF(total_bienes, 0), 0), 2) AS porcentaje_operativos,
        ROUND(COALESCE((bienes_mantenimiento * 100.0) / NULLIF(total_bienes, 0), 0), 2) AS porcentaje_mantenimiento
      FROM conteo_bienes;`;
    const resultado = await pool.query(sql, [hasta ? `${hasta}-01` : new Date().toISOString().slice(0, 10)]);
    return resultado.rows;
  }

  async crear(bien, client) {
    const { numero, descripcion, marca, modelo, categoria } = bien;
    const sql = 'INSERT INTO Bienes (numeroBien, descripcion, marca, modelo, categoria) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
    const resultado = await client.query(sql, [numero, descripcion, marca, modelo, categoria]);
    return resultado.rows[0].id;
  }

  async vincularIncorporacion(client, incorporacion) {
    const { idBien, idIncorporacion, responsable, dependencia } = incorporacion;
    const sql = "UPDATE Bienes SET idIncorporacion = $1, idPersonal = $2, idDependencia = $3, estatus = CASE WHEN estatus = 'No asignado' THEN 'Operativo' ELSE estatus END WHERE id = $4;";
    await client.query(sql, [idIncorporacion, responsable, dependencia, idBien]);
  }

  async actualizar(bien, client) {
    const { id, numero, descripcion, marca, modelo } = bien;
    const sql = 'UPDATE Bienes SET numeroBien = $1, descripcion = $2, marca = $3, modelo = $4 WHERE id = $5;';
    await client.query(sql, [numero, descripcion, marca, modelo, id]);
  }

  async actualizarMovimiento(client, movimientos) {
    const { idDestino, idReceptor, idBien } = movimientos;
    const sql = 'UPDATE Bienes SET idDependencia = $1, idPersonal = $2 WHERE id = $3';
    await client.query(sql, [ idDestino, idReceptor, idBien ]);
  }

  async desvincularBien(client, id) {
    const sql = "UPDATE Bienes SET idIncorporacion = NULL, idPersonal = NULL, idDependencia = NULL, estatus = CASE WHEN estatus = 'Operativo' THEN 'No asignado' ELSE estatus END WHERE idIncorporacion = $1;";
    await client.query(sql, [id]);
  }

  async desvincularBienDesincorporacion(client, desincorporaciones) {
    const { idBien } = desincorporaciones;
    const sql = "UPDATE Bienes SET idPersonal = NULL, idDependencia = NULL, estatus = 'Desincorporado' WHERE id = $1;";
    await client.query(sql, [idBien]);
  }

  async deshacerDesincorporacion(client, id, personalDependencia) {
    const { dependencia, personal } = personalDependencia;
    const sql = `UPDATE Bienes SET estatus = 'Operativo', idPersonal = $1, idDependencia = $2
      WHERE id IN ( SELECT idBien FROM DetallesDesincorporacion WHERE idDesincorporacion = $3 );`;
    await client.query(sql, [personal, dependencia, id]); 
  }

  async deshacerMovimiento(client, id, personalDependencia) {
    const { dependencia, personal } = personalDependencia;
    const sql = `UPDATE Bienes SET idPersonal = $1, idDependencia = $2
	    WHERE id IN ( SELECT idBien FROM DetallesMovimientos WHERE idMovimiento = $3 );`;
    await client.query(sql, [personal, dependencia, id]);
  }

  async eliminar(id) {
    const sql = 'DELETE FROM Bienes WHERE id = $1;';
    const resultado = await pool.query(sql, [id]);
    return resultado.rowCount === 1;
  }
}

export default new Bienes();
