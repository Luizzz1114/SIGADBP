import pool from '../config/database.js';

class usuarios {
  async listar() {
		const sql = 'SELECT * FROM vistaUsuarios ORDER BY rol, username;';
    const resultado = await pool.query(sql);
    return resultado.rows;
	}

  async validarUsernameCorreo (validar) {
    const { username, correo, id = null } = validar;
    const sql = `SELECT 
      EXISTS (SELECT 1 FROM usuarios WHERE username = $1 AND id IS DISTINCT FROM $3) AS username_exists,
      EXISTS (SELECT 1 FROM usuarios WHERE correo = $2 AND id IS DISTINCT FROM $3) AS correo_exists;`;
    const resultado = await pool.query(sql, [username, correo, id]);
    return resultado.rows[0];
  }

  async iniciarSesion (user) {
    const { username } = user; 
    const sql = 'SELECT id, username, contrasena, rol, correo FROM Usuarios WHERE username = $1;';
    const resultado = await pool.query(sql, [username]);
    return resultado.rows[0];
  }

  async obtenerPorId (id) {
    const sql = `SELECT U.*, P.id AS id_personal, P.genero, P.fechaNacimiento,
      P.edad, P.telefono, P.nivelProfesional, P.estatus, P.cargo, P.dependencia,
      P.fechaIngreso, P.fechaSalida, P.antiguedad
      FROM vistaUsuarios U
      INNER JOIN vistaPersonal P ON P.id = U.idp
      WHERE U.id = $1;`;
    const resultado = await pool.query(sql, [id]);
    return resultado.rows[0];
  }

  async crear (user) {
    const { personal, username, correo, contrasena, rol, pregunta, respuesta} = user;
    const sql = 'INSERT INTO Usuarios (idPersonal, username, correo, contrasena, rol, pregunta, respuesta) VALUES ($1, $2, $3, $4, $5, $6, $7);';
    const resultado = await pool.query(sql, [personal, username, correo, contrasena, rol, pregunta, respuesta]);
    return resultado.rowCount === 1;
  }

  async actualizar (user) {
    const { id, username, correo, contrasena, rol } = user;
    const params = [];
    let sql = 'UPDATE Usuarios SET fechaActualizacion = CURRENT_TIMESTAMP';
    if(!contrasena && !rol) {
      sql += ', username = $1, correo = $2 WHERE id = $3;';
      params.push(username, correo, id);
    } else if (!rol) {
      sql += ', username = $1, correo = $2, contrasena = $3 WHERE id = $4;';
      params.push(username, correo, contrasena, id);
    } else {
      sql += ', username = $1, correo = $2, contrasena = $3, rol = $4 WHERE id = $5;';
      params.push(username, correo, contrasena, rol, id);
    }
    //const sql = 'UPDATE Usuarios SET username = $1, correo = $2, contrasena = $3, fechaActualizacion = CURRENT_TIMESTAMP, rol = $4 WHERE id = $5;';
    const resultado = await pool.query(sql, params);
    return resultado.rowCount === 1;
  }

  async eliminar (id) {
    const sql = 'DELETE FROM Usuarios WHERE id = $1;';
    const resultado = await pool.query(sql, [id]);
    return resultado.rowCount === 1;
  }
}

export default new usuarios();
