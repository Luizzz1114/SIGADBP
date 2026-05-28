import pool from '../config/database.js';

class Incorporaciones {
  async listar() {
    const sql = "SELECT * FROM vistaIncorporaciones ORDER BY TO_DATE(fecha_entrada, 'DD/MM/YYYY') DESC;";
    const resultado = await pool.query(sql);
    return resultado.rows;
  }

  async obtenerPorId(client, id) {
    const sql = 'SELECT * FROM vistaIncorporaciones WHERE id = $1';
    const resultado = await client.query(sql, [id]);
    return resultado.rows[0];
  }

  async crear(client, payload) {
    const { dependencia, factura, fecha_entrada, motivo, orden_compra, proveedor, nota_entrega, responsable } = payload;
    const sql = 'INSERT INTO incorporaciones (fechaEntrada, ordenCompra, factura, proveedor, motivo, notaEntrega, idDependencia, idPersonal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id';
    const resultado = await client.query(sql, [fecha_entrada, orden_compra, factura, proveedor, motivo, nota_entrega, dependencia, responsable]);
    return resultado.rows[0].id;
  }

  async actualizar(client, payload) {
    const { id, factura, fecha_entrada, motivo, orden_compra, proveedor, nota_entrega } = payload;
    const sql = 'UPDATE Incorporaciones SET fechaEntrada = $1, ordenCompra = $2, factura = $3, proveedor = $4, motivo = $5, notaEntrega = $6 WHERE id = $7 RETURNING id';
    const resultado = await client.query(sql, [fecha_entrada, orden_compra, factura, proveedor, motivo, nota_entrega, id]);
    return resultado.rows[0].id;
  }

  async eliminar(client, id) {
    const sql = 'DELETE FROM incorporaciones WHERE id = $1';
    const resultado = await client.query(sql, [id]);
    return resultado.rowCount === 1;
  }
}

export default new Incorporaciones();