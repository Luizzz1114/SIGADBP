import pool from "../config/database.js";
import path from "path";
import { fileURLToPath } from "url";
import IncorporacionesRepositorio from "../repositories/incorporacionesRepositorio.js";
import BienesRepositorio from "../repositories/bienesRepositorio.js";
import GastosRepositorio from "../repositories/gastosRepositorio.js";
import PersonalRepositorio from '../repositories/personalRepositorio.js';
import ExcelJS from "exceljs";

// Configuración de __dirname requerida para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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


  async generarReporte(idIncorporacion) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const id = idIncorporacion;
      const incorporacion = await IncorporacionesRepositorio.obtenerPorId(client, id);
      const bienes = await GastosRepositorio.obtenerGastosPorPresupuesto(client, id);
      const jefe = await PersonalRepositorio.obtenerJefe();
      const coordinador = await PersonalRepositorio.obtenerCoordinador();
      const supervisor = await PersonalRepositorio.obtenerSupervisor();

      const templatePath = path.join(__dirname, "../templates/formato_incorporacion.xlsx");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(templatePath);
      
      const worksheet = workbook.getWorksheet(1);

      // =========================================================
      // 3. LÓGICA DE EXPANSIÓN (duplicateRow)
      // =========================================================
      const FILAS_PLANTILLA = 20; // Filas de la 9 a la 28
      const totalBienes = bienes.length;
      const filasExtra = totalBienes > FILAS_PLANTILLA ? totalBienes - FILAS_PLANTILLA : 0;

      if (filasExtra > 0) {
        worksheet.duplicateRow(28, filasExtra, true);
      }

      // =========================================================
      // 4. INYECCIÓN DE LA CABECERA (Filas 2, 5, 6 y 7)
      // =========================================================
      // Fecha de elaboración en la esquina superior derecha (G3 o G2 según tu Excel)
      const fechaActual = new Date();
      const dia = fechaActual.getDate().toString().padStart(2, '0');
      const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
      const anio = fechaActual.getFullYear();
      worksheet.getCell("G3").value = `${dia} / ${mes} / ${anio}`;

      // Fila 5
      worksheet.getCell("E5").value = `ORDEN DE COMPRA: ${incorporacion.orden_compra}`;

      // Fila 6
      worksheet.getCell("A6").value = `DEPENDENCIA DE UBICACIÓN DEL BIEN: ${incorporacion.dependencia}`;
      worksheet.getCell("E6").value = `RESPONSABLE DE LA DEPENDENCIA: ${incorporacion.nivel_profesional} ${incorporacion.responsable}`;

      // Fila 7
      worksheet.getCell("A7").value = `PROVEEDOR: ${incorporacion.proveedor}`;
      worksheet.getCell("C7").value = `NOTA DE ENTREGA: ${incorporacion.nota_entrega}`;
      worksheet.getCell("E7").value = `FACTURA: ${incorporacion.factura}`;
      worksheet.getCell("G7").value = `FECHA: ${incorporacion.fecha_entrada}`;

      // =========================================================
      // 5. INYECCIÓN DE LOS BIENES (A partir de la Fila 9)
      // =========================================================
      let filaActual = 9;

      bienes.forEach((bien, index) => {
        const row = worksheet.getRow(filaActual);
        
        row.getCell("A").value = index + 1;           // N°
        row.getCell("B").value = bien.descripcion;    // DESCRIPCIÓN
        row.getCell("C").value = bien.marca;          // MARCA
        row.getCell("D").value = bien.modelo;         // MODELO
        row.getCell("E").value = bien.serial || 'S/S';// SERIAL
        row.getCell("F").value = bien.numero;         // N° DE BIEN
        row.getCell("G").value = incorporacion.dependencia;        // DESTINO

        filaActual++;
      });

      // =========================================================
      // 6. INYECTAR EL TOTAL Y FIRMAS AL PIE DE PÁGINA
      // =========================================================
      const filaTotal = 29 + filasExtra;
      worksheet.getCell(`A${filaTotal}`).value = `TOTAL: ${totalBienes}`; 
      
      // Asegurar el borde continuo de la fila TOTAL desde la A (1) hasta la G (7)
      for (let i = 1; i <= 7; i++) {
        worksheet.getCell(filaTotal, i).border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: i === 1 ? { style: "thin" } : undefined,  // Borde izquierdo en A
          right: i === 7 ? { style: "thin" } : undefined  // Borde derecho en G
        };
      }

      // Firmas al pie de página (La caja de firmas está en la fila 31)
      const filaFirmas = 31 + filasExtra;
      
      // Inyectamos los nombres en sus respectivas columnas
      worksheet.getCell(`A${filaFirmas}`).value = `${incorporacion.nivel_profesional} ${incorporacion.responsable}`;
      worksheet.getCell(`C${filaFirmas}`).value = `${supervisor.nivel_profesional} ${supervisor.empleado}`;
      worksheet.getCell(`E${filaFirmas}`).value = `${coordinador.nivel_profesional} ${coordinador.empleado}`; 
      worksheet.getCell(`G${filaFirmas}`).value = `${jefe.nivel_profesional} ${jefe.empleado}`;

      // Centramos el texto en el fondo de la caja de firmas
      ['A', 'C', 'E', 'G'].forEach(col => {
        worksheet.getCell(`${col}${filaFirmas}`).alignment = { vertical: 'bottom', horizontal: 'center' };
      });

      // Reparar el borde derecho (Columna G) para los encabezados y la caja de firmas
      for (let f = 1; f <= 2; f++) {
        const filaPie = filaTotal + f;
        const celdaExterna = worksheet.getCell(`G${filaPie}`); // Termina en la G
        
        celdaExterna.border = {
          ...celdaExterna.border, 
          right: { style: "thin" }
        };
      }

      await client.query("COMMIT");
      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new IncorporacionesServices();
