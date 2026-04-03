import pool from '../config/database.js';

class usuarios {
  async listar() {
		const sql = 'SELECT id, username, correo, rol, cedula, empleado FROM vistaUsuarios ORDER BY rol, username;';
    const resultado = await pool.query(sql);
    return resultado.rows;
	}

  async contarAdministradores(client, id) {
    const sql = "SELECT U.rol, (SELECT COUNT(*) FROM Usuarios WHERE rol = 'Administrador') AS total_admin FROM Usuarios U WHERE U.id = $1;";
    const resultado = await client.query(sql, [id]);
    return resultado.rows[0];
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

  async recuperarContrasena (identificador) {
    const sql = 'SELECT id, correo, username, pregunta, respuesta FROM Usuarios WHERE username = $1 OR correo = $1 ;';
    const resultado = await pool.query(sql, [identificador]);
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
    const { id, username, correo, contrasena, rol, pregunta, respuesta } = user;

    let sql = 'UPDATE Usuarios SET fechaActualizacion = CURRENT_TIMESTAMP';
    const params = [];
    let paramIndex = 1;

    const camposOpcionales = { username, correo, contrasena, rol, pregunta, respuesta };

    for (const [columna, valor] of Object.entries(camposOpcionales)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        sql += `, ${columna} = $${paramIndex}`;
        params.push(valor);
        paramIndex++;
      }
    }

    sql += ` WHERE id = $${paramIndex};`;
    params.push(id);
    
    const resultado = await pool.query(sql, params);
    return resultado.rowCount === 1;
  }

  async cambiarContrasena (user) {
    const { id, contrasena } = user;
    const sql = 'UPDATE Usuarios SET contrasena = $1, fechaActualizacion = CURRENT_TIMESTAMP WHERE id = $2;';
    const resultado = await pool.query(sql, [contrasena, id]);
    return resultado.rowCount === 1;
  }

  async eliminar (client,id) {
    const sql = 'DELETE FROM Usuarios WHERE id = $1;';
    const resultado = await client.query(sql, [id]);
    return resultado.rowCount === 1;
  }
}

export default new usuarios();
