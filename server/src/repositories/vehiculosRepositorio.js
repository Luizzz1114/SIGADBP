class Vehiculos {
  async crear(idBien, bien, client) {
    const { color, placa, serialcarroceria } = bien;
    const sql = 'INSERT INTO Vehiculos (idVehiculo, color, placa, serialCarroceria) VALUES ($1, $2, $3, $4);';
    await client.query(sql, [idBien, color, placa, serialcarroceria]);
  }

  async actualizar(bien, client) {
    const { id, color, placa, serialcarroceria } = bien;
    const sql = 'UPDATE Vehiculos SET color = $1, placa = $2, serialCarroceria = $3 WHERE idVehiculo = $4;';
    await client.query(sql, [color, placa, serialcarroceria, id]);
  }
}

export default new Vehiculos();