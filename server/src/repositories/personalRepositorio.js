import pool from '../config/database.js';

class Personal {
  async listar() {
    const sql = "SELECT id, cedula, nombres, apellidos, empleado, cargo, dependencia, telefono, estatus FROM vistaPersonal ORDER BY (estatus = 'Activo') DESC, cedula;";
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async listarSinUsuario() {
    const sql = `SELECT id, cedula, nombres, apellidos FROM vistaPersonal
      WHERE tipo_cargo = 'Personal de la Unidad de Administración'
      AND id NOT IN (SELECT idPersonal FROM Usuarios)
      AND estatus = 'Activo';`;
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async validarCedulaUnica(validar) {
    const { cedula, id = null } = validar;
    const sql = 'SELECT COUNT(*) FROM Personal WHERE cedula = $1 AND id IS DISTINCT FROM $2;';
    const resultado = await pool.query(sql, [cedula, id]);
    return parseInt(resultado.rows[0].count);
  }

  async obtenerPorId(id) {
    const sql = 'SELECT * FROM vistaPersonal WHERE id = $1;';
    const resultado = await pool.query(sql, [id]);
    return resultado.rows[0];
  }

  async obtenerJefeDesincorporacion(client, id) {
    const sql = `SELECT V.idd AS dependencia, V.id AS personal
      FROM Desincorporaciones D
      INNER JOIN vistaPersonal V ON D.idDependencia = V.idd
      WHERE D.id = $1
        AND V.estatus = 'Activo'
        AND V.cargo != 'Personal de la Unidad de Administración'
      ORDER BY V.fechaIngreso DESC
      LIMIT 1;`;
    const resultado = await client.query(sql, [id]);
    return resultado.rows[0];
  }

  async obtenerJefeMovimiento(client, id) {
    const sql = `SELECT V.idd AS dependencia, V.id AS personal
    FROM Movimientos M
    INNER JOIN vistaPersonal V ON M.idOrigen = V.idd
    WHERE M.id = $1
      AND V.estatus = 'Activo'
      AND V.cargo != 'Personal de la Unidad de Administración'
    ORDER BY V.fechaIngreso DESC
    LIMIT 1;`;
    const resultado = await client.query(sql, [id]);
    return resultado.rows[0];
  }

  async crear(client, personal) {
    const { cedula, nombres, apellidos, fechanacimiento, genero, telefono, nivelprofesional } = personal;
    const sql = 'INSERT INTO Personal (cedula, nombres, apellidos, fechaNacimiento, genero, telefono, nivelProfesional) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;';
    const resultado = await client.query(sql, [cedula, nombres, apellidos, fechanacimiento, genero, telefono, nivelprofesional]);
    return resultado.rows[0].id;
  }

  async actualizar(client, personal) {
    const { id, cedula, nombres, apellidos, fechanacimiento, genero, telefono, nivelprofesional, estatus } = personal;
    const sql = 'UPDATE Personal SET cedula = $1, nombres = $2, apellidos = $3, fechaNacimiento = $4, genero = $5, telefono = $6, nivelProfesional = $7, estatus = $8 WHERE id = $9;';
    await client.query(sql, [cedula, nombres, apellidos, fechanacimiento, genero, telefono, nivelprofesional, estatus, id]);
  }

  async eliminar(id) {
    const sql = 'DELETE FROM Personal WHERE id = $1;';
    const resultado = await pool.query(sql, [id]);
    return resultado.rowCount === 1;
  }

  async crearCargo(client, idPersonal, personal) {
    const { cargo, dependencia, fechaingreso } = personal;
    const sql = 'INSERT INTO HistorialCargos (idPersonal, idCargo, idDependencia, fechaIngreso) VALUES ($1, $2, $3, $4);';
    const resultado = await client.query(sql, [idPersonal, cargo, dependencia, fechaingreso]);
    return resultado.rowCount === 1;
  }

  async actualizarCargo(client, personal) {
    const { idhc, cargo, dependencia, fechaingreso, fechasalida } = personal;
    const sql = 'UPDATE HistorialCargos SET idCargo = $1, idDependencia = $2, fechaIngreso = $3, fechaSalida = $4 WHERE id = $5;';
    const resultado = await client.query(sql, [cargo, dependencia, fechaingreso, fechasalida, idhc]);
    return resultado.rowCount === 1;
  }

  async eliminarCargo(id) {
    const sql = 'DELETE FROM HistorialCargos WHERE idPersonal = $1;';
    const resultado = await pool.query(sql, [id]);
    return resultado.rowCount === 1;
  }

}

export default new Personal();