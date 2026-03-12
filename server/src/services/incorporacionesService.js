import pool from "../config/database.js";
import IncorporacionesRepositorio from "../repositories/incorporacionesRepositorio.js";
import BienesRepositorio from "../repositories/bienesRepositorio.js";
import GastosRepositorio from "../repositories/gastosRepositorio.js";

class IncorporacionesServices {
  async listar() {
    return await IncorporacionesRepositorio.listar();
  }

  async obtenerPorId(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const incorporacion = await IncorporacionesRepositorio.obtenerPorId(client, id);
      const bienes = await GastosRepositorio.obtenerGastosPorPresupuesto(client, id);
      
      const resultado = {
        ...incorporacion,
        bienes: bienes
      };

      await client.query("COMMIT");
      return resultado;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async crear(payload) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const idIncorporacion = await IncorporacionesRepositorio.crear(client, payload);

      if (payload.bienes && payload.bienes.length > 0) {
        for (const bien of payload.bienes) {
          const incorporacion = {
            idIncorporacion: idIncorporacion,
            idBien: bien.id_bien,
            responsable: payload.responsable,
            dependencia: payload.dependencia
          }
          await BienesRepositorio.vincularIncorporacion(client, incorporacion);

          if (Number(bien.gasto) > 0 && bien.id_presupuesto && payload.fecha_entrada && bien.id_bien) {
            const gasto = {
              fecha: payload.fecha_entrada,
              monto: bien.gasto,
              presupuesto: bien.id_presupuesto,
              bien: bien.id_bien,
              mantenimiento: null
            };
            await GastosRepositorio.crear(client, gasto);
          }
        }
      }

      await client.query("COMMIT");
      return idIncorporacion;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizar(payload) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const idIncorporacion = await IncorporacionesRepositorio.actualizar(client, payload);

      const id = idIncorporacion;

      await GastosRepositorio.eliminarGastoPorIncorporacion(client, id);

      await BienesRepositorio.desvincularBien(client, id);

      if (payload.bienes && payload.bienes.length > 0) {
        for (const bien of payload.bienes) {
            const incorporacion = {
            idIncorporacion: idIncorporacion,
            idBien: bien.id_bien,
            responsable: payload.responsable,
            dependencia: payload.dependencia
          }
          await BienesRepositorio.vincularIncorporacion(client, incorporacion);

          if (Number(bien.gasto) > 0 && bien.id_presupuesto && payload.fecha_entrada && bien.id_bien) {
            const gasto = {
              fecha: payload.fecha_entrada,
              monto: bien.gasto,
              presupuesto: bien.id_presupuesto,
              bien: bien.id_bien,
            };
            await GastosRepositorio.crear(client, gasto);
          }
        }
      }

      await client.query("COMMIT");
      return idIncorporacion;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async eliminar(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await GastosRepositorio.eliminarGastoPorIncorporacion(client, id);

      await BienesRepositorio.desvincularBien(client, id);

      const resultado = await IncorporacionesRepositorio.eliminar(client, id);

      await client.query("COMMIT");
      return resultado;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new IncorporacionesServices();
