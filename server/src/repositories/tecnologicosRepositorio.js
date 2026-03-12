class Tecnologicos {
  async crear(idBien, bien, client) {
    const { especificaciones, serial } = bien;
    const sql = 'INSERT INTO tecnologicos (idTecnologico, especificaciones, serial) VALUES ($1, $2, $3)';
    await client.query(sql, [idBien, especificaciones, serial]);
  }

  async actualizar(bien, client) {
    const { id, especificaciones, serial } = bien;
    const sql = 'UPDATE Tecnologicos SET especificaciones = $1, serial = $2 WHERE idTecnologico = $3';
    await client.query(sql, [especificaciones, serial, id]);
  }
}

export default new Tecnologicos();