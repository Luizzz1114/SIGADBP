class Muebles {
  async crear(idBien, bien, client) {
    const { tipomueble, material } = bien;
    const sql = 'INSERT INTO Muebles (idMueble, tipoMueble, material) VALUES ($1, $2, $3);';
    await client.query(sql, [idBien, tipomueble, material]);
  }

  async actualizar(bien, client) {
    const { id, tipomueble, material} = bien;
    const sql = 'UPDATE Muebles SET tipoMueble = $1, material = $2 WHERE idMueble = $3;';
    await client.query(sql, [tipomueble, material, id]); 
  }
}

export default new Muebles();