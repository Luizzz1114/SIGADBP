import path from "path";
import { fileURLToPath } from "url";
import pool from '../config/database.js';
import DesincorporacionesRepositorio from '../repositories/desincorporacionesRepositorio.js';
import BienesRepositorio from '../repositories/bienesRepositorio.js';
import PersonalRepositorio from '../repositories/personalRepositorio.js';
import ExcelJS from "exceljs";

// Configuración de __dirname requerida para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DesincorporacionesServices {
  async listar() {
    return await DesincorporacionesRepositorio.listar();
  }
  
  async desincorporacionMetricas() {
    return await DesincorporacionesRepositorio.desincorporacionMetricas();
  }

  async obtenerPorId(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const desincorporacion = await DesincorporacionesRepositorio.obtenerPorId(client, id);

      const bienes = await BienesRepositorio.obtenerPorIdDesincorporacion(client, id);
      
      const resultado = {
        ...desincorporacion,
        bienes: bienes
      };

      await client.query('COMMIT');
      return resultado;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async crear(desincorporacion) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 🔥 LÓGICA DE LA FOTO 🔥
      // Transformamos el nombre de la foto en la URL estática que irá a la Base de Datos
      if (desincorporacion.comprobante) {
        desincorporacion.url_comprobante = `/uploads/comprobantes/${desincorporacion.comprobante}`;
      }

      // Mandamos al Repositorio para guardar
      const idDesincorporacion = await DesincorporacionesRepositorio.crear(client, desincorporacion);

      // Guardamos los detalles de los bienes
      if (desincorporacion.bienes && desincorporacion.bienes.length > 0) {
        for (const bien of desincorporacion.bienes) {
          const detalles = {
            idDesincorporacion: idDesincorporacion,
            idBien: bien.id_bien,
            tipo: bien.tipo
          };
          
          await BienesRepositorio.desvincularBienDesincorporacion(client, detalles);
          await DesincorporacionesRepositorio.crearDetalles(client, detalles);
        }
      }

      await client.query('COMMIT');
      return idDesincorporacion;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizar(desincorporacion) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const id = desincorporacion.id;
      const personalDependencia = await PersonalRepositorio.obtenerJefeDesincorporacion(client, id);
      await BienesRepositorio.deshacerDesincorporacion(client, id, personalDependencia);
      const idDesincorporacion = await DesincorporacionesRepositorio.actualizar(client, desincorporacion);
      await DesincorporacionesRepositorio.eliminarDetalles(client, idDesincorporacion);

      if (desincorporacion.bienes && desincorporacion.bienes.length > 0) {
        for(const bien of desincorporacion.bienes ) {
          const desincorporaciones = {
            idDesincorporacion: idDesincorporacion,
            idBien: bien.id_bien,
            tipo: bien.tipo
          };
          await BienesRepositorio.desvincularBienDesincorporacion(client, desincorporaciones);
          await DesincorporacionesRepositorio.crearDetalles(client, desincorporaciones);
        }
      }

      await client.query('COMMIT');
      return idDesincorporacion;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }  

  async eliminar(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const personalDependencia = await PersonalRepositorio.obtenerJefeDesincorporacion(client, id);
      await BienesRepositorio.deshacerDesincorporacion(client, id, personalDependencia);
      await DesincorporacionesRepositorio.eliminar(client, id);

      await client.query('COMMIT');
      return personalDependencia;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async generarReporte(idDesincorporacion) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const id = idDesincorporacion;
      const desincorporacion = await DesincorporacionesRepositorio.obtenerPorId(client, id);
      const bienes = await BienesRepositorio.obtenerPorIdDesincorporacion(client, id);
      const jefe = await PersonalRepositorio.obtenerJefe();
      const coordinador = await PersonalRepositorio.obtenerCoordinador();
      const supervisor = await PersonalRepositorio.obtenerSupervisor();
        
      const templatePath = path.join(__dirname, "../templates/formato_desincorporacion.xlsx");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(templatePath);
    
      const worksheet = workbook.getWorksheet(1);

      // =========================================================
      // 3. LÓGICA DE EXPANSIÓN (duplicateRow)
      // =========================================================
      const FILAS_PLANTILLA = 20; // De la 11 a la 30
      const totalBienes = bienes.length;
      const filasExtra = totalBienes > FILAS_PLANTILLA ? totalBienes - FILAS_PLANTILLA : 0;

      if (filasExtra > 0) {
        worksheet.duplicateRow(30, filasExtra, true);
      }

      // =========================================================
      // 4. INYECCIÓN DE LA CABECERA E INFORMACIÓN DE LA DEPENDENCIA
      // =========================================================
      worksheet.getCell("A7").value = desincorporacion.dependencia;
      worksheet.getCell("E7").value = `${jefe.nivel_profesional} ${jefe.empleado}`;

      worksheet.getCell("A9").value = `${desincorporacion.nivel_profesional} ${desincorporacion.responsable}`;
      worksheet.getCell("E9").value = desincorporacion.cedula;
      worksheet.getCell("G9").value = desincorporacion.dependencia;

      const fechaDesinc = new Date(desincorporacion.fecha_salida);
      fechaDesinc.setMinutes(fechaDesinc.getMinutes() + fechaDesinc.getTimezoneOffset());
      const dia = fechaDesinc.getDate().toString().padStart(2, '0');
      const mes = (fechaDesinc.getMonth() + 1).toString().padStart(2, '0');
      const anio = fechaDesinc.getFullYear();
      worksheet.getCell("I3").value = desincorporacion.fecha_salida;

      // =========================================================
      // 5. INYECCIÓN DE LOS BIENES (A partir de la Fila 11)
      // =========================================================
      let filaActual = 11;

      bienes.forEach((bien) => {
        const row = worksheet.getRow(filaActual);
        
        row.getCell("C").value = bien.numero;      // Nº DE BIEN
        row.getCell("D").value = bien.descripcion;      // DESCRIPCIÓN
        row.getCell("E").value = bien.tipo_desincorporacion;             // TIPO DE DESINCORPORACIÓN
        row.getCell("F").value = desincorporacion.responsable; // RESPONSABLE PATRIMONIAL
        row.getCell("G").value = desincorporacion.cargo;       // CARGO
        row.getCell("H").value = desincorporacion.cedula;      // Nº CÉDULA

        filaActual++;
      });

      // =========================================================
      // 6. INYECTAR EL TOTAL Y FIRMAS AL PIE DE PÁGINA
      // =========================================================
      const filaTotal = 31 + filasExtra;
      worksheet.getCell(`A${filaTotal}`).value = `TOTAL: ${totalBienes}`; 
      
      worksheet.getCell(`I${filaTotal}`).border = {
        top: { style: "thin" },
        right: { style: "thin" }, 
        bottom: { style: "thin" },
        left: { style: "thin" }
      };

      const filaFirmas = 33 + filasExtra;
      
      worksheet.getCell(`A${filaFirmas}`).value = `${desincorporacion.nivel_profesional} ${desincorporacion.responsable}`;
      worksheet.getCell(`D${filaFirmas}`).value = `${supervisor.nivel_profesional} ${supervisor.empleado}`;
      worksheet.getCell(`F${filaFirmas}`).value = `${coordinador.nivel_profesional} ${coordinador.empleado}`; 
      worksheet.getCell(`H${filaFirmas}`).value = `${jefe.nivel_profesional} ${jefe.empleado}`;

      for (let f = 1; f <= 3; f++) {
        const filaPie = filaTotal + f;
        const celdaExterna = worksheet.getCell(`I${filaPie}`);
        
        celdaExterna.border = {
          ...celdaExterna.border, 
          right: { style: "thin" }
        };
      }
    
      await client.query('COMMIT');
      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new DesincorporacionesServices();