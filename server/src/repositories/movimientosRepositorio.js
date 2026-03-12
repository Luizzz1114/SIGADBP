import pool from '../config/database.js';

class Movimientos { 
  async listar() {
    const sql = "SELECT * FROM vistaMovimientos ORDER BY TO_DATE(fecha, 'DD/MM/YYYY') DESC;";
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async obtenerPorId(client, id) {
    const sql = 'SELECT * FROM vistaMovimientos WHERE id = $1;';
    const resultado = await client.query(sql, [id]);
    return resultado.rows[0];
  }

  async crear(client, movimiento) {
    const { tipo, fecha, motivo, cedente, receptor, origen, destino } = movimiento;
    const sql = 'INSERT INTO Movimientos (tipo, motivo, fecha, idCedente, idReceptor, idOrigen, idDestino) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;';
    const resultado = await client.query(sql, [tipo, motivo, fecha, cedente, receptor, origen, destino]);
    return resultado.rows[0].id;
  }

  async crearDetalles(client, mantenimientos) {
    const { idMovimiento, idBien } = mantenimientos;
    const sql = 'INSERT INTO DetallesMovimientos (idMovimiento, idBien) VALUES ($1, $2);';
    await client.query(sql, [idMovimiento, idBien]);
  }

  async actualizar(client, movimiento) {
    const { id, fecha, motivo } = movimiento;
    const sql = 'UPDATE Movimientos SET fecha = $1, motivo = $2 WHERE id = $3;';
    await client.query(sql, [fecha, motivo, id]);
  }

  async eliminar(client, id) {
    const sql = 'DELETE FROM Movimientos WHERE id = $1;';
    await client.query(sql, [id]);
  }

  async eliminarDetalles(client, id) {
    const sql = 'DELETE FROM DetallesMovimientos WHERE idMovimiento = $1;';
    await client.query(sql, [id]);
  }
}

export default new Movimientos();