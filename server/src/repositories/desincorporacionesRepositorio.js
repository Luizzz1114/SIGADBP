import pool from '../config/database.js';

class Desincorporaciones {
  async listar() {
    const sql = "SELECT * FROM vistaDesincorporaciones ORDER BY TO_DATE(fecha_salida, 'DD/MM/YYYY') DESC;";
    const resultado = await pool.query(sql);
    return resultado.rows;
  }
  
  async obtenerPorId(client, id) {
    const sql = 'SELECT * FROM vistaDesincorporaciones WHERE id = $1;';
    const resultado = await client.query(sql, [id]);
    return resultado.rows[0];
  }

  async crear(client, desincorporacion) {
    const { dependencia, descripcion, fecha_salida, responsable } = desincorporacion;
    const sql = 'INSERT INTO Desincorporaciones (fechaSalida, descripcion, idDependencia, idPersonal) VALUES ($1, $2, $3, $4) RETURNING id;';
    const resultado = await client.query(sql, [fecha_salida, descripcion, dependencia, responsable]);
    return resultado.rows[0].id;
  }

  async crearDetalles(client, desincorporacion) {
    const { idDesincorporacion, idBien, tipo } = desincorporacion;
    const sql = 'INSERT INTO DetallesDesincorporacion (tipo, idDesincorporacion, idBien) VALUES ($1, $2, $3);';
    await client.query(sql, [tipo, idDesincorporacion, idBien]);
  }

  async actualizar(client, desincorporacion) {
    const { id, descripcion, fecha_salida } = desincorporacion;
    const sql = 'UPDATE Desincorporaciones SET fechaSalida = $1, descripcion = $2 WHERE id = $3 RETURNING id;';
    const resultado = await client.query(sql, [fecha_salida, descripcion, id]);
    return resultado.rows[0].id;
  }

  async eliminar(client, id) {
    const sql = 'DELETE FROM Desincorporaciones WHERE id = $1;';
    await client.query(sql, [id]);
  }

  async eliminarDetalles(client, idDesincorporacion) {
    const sql = 'DELETE FROM DetallesDesincorporacion WHERE idDesincorporacion = $1;';
    await client.query(sql, [idDesincorporacion]);
  }
}

export default new Desincorporaciones();