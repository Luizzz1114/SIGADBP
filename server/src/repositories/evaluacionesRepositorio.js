import pool from "../config/database.js";

class Evaluaciones {
  async encuestaRespondida(encuesta) {
    const { id, semestreActual } = encuesta;
    const sql = `SELECT E.id FROM Evaluaciones E
      JOIN Personal P ON E.idPersonal = P.id
      JOIN Usuarios U ON P.id = U.idPersonal
      WHERE E.semestre = $1 AND U.id = $2
      LIMIT 1;`;
    const resultado = await pool.query(sql, [semestreActual, id]);
    return resultado.rowCount === 1;
  }

  async listarKpiCapacitacionSatisfaccion() {
    const sql = 'SELECT * FROM vistaFormacionCrecimiento;';
    const resultado = await pool.query(sql);
    return resultado.rows[0];
  }

  async crear(client, idPersonal, evaluacion) {
    const { capacitacion, satisfaccion, semestre } = evaluacion;
    const sql = 'INSERT INTO Evaluaciones (capacitacion, satisfaccion, semestre, idPersonal) VALUES ($1, $2, $3, $4)';
    const resultado = await client.query(sql, [capacitacion, satisfaccion, semestre, idPersonal]);
    return resultado.rowCount === 1;
  }  
}

export default new Evaluaciones();