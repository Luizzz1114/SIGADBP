import path from "path";
import { fileURLToPath } from "url";
import pool from '../config/database.js';
import MovimientosRepositorio from '../repositories/movimientosRepositorio.js';
import BienesRepositorio from '../repositories/bienesRepositorio.js';
import PersonalRepositorio from '../repositories/personalRepositorio.js';
import ExcelJS from "exceljs";

// Configuración de __dirname requerida para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class MovimientosServices {
  async listar() {
    return MovimientosRepositorio.listar();
  }

  async obtenerPorId(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const movimiento = await MovimientosRepositorio.obtenerPorId(client, id);
      const bienes = await BienesRepositorio.obtenerPorIdMovimiento(client, id);

      const resultado = {
        ...movimiento,
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

  async crear(movimiento) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const idMovimiento = await MovimientosRepositorio.crear(client, movimiento);
      
      if(movimiento.bienes && movimiento.bienes.length > 0) {
        for(const bien of movimiento.bienes) {
          const movimientos = {
            idMovimiento: idMovimiento,
            idBien: bien.id_bien,
            idDestino: movimiento.destino,
            idReceptor: movimiento.receptor
          };
          await BienesRepositorio.actualizarMovimiento(client, movimientos);
          await MovimientosRepositorio.crearDetalles(client, movimientos);
        }
      }

      await client.query('COMMIT');
      return idMovimiento;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizar(movimiento) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const id = movimiento.id;
      const personalDependencia = await PersonalRepositorio.obtenerJefeMovimiento(client, id);
      await BienesRepositorio.deshacerMovimiento(client, id, personalDependencia);
      await MovimientosRepositorio.eliminarDetalles(client, id);
      await MovimientosRepositorio.actualizar(client, movimiento);

      if(movimiento.bienes && movimiento.bienes.length > 0) {
        for(const bien of movimiento.bienes) {
          const movimientos = {
            idMovimiento: id,
            idBien: bien.id_bien,
            idDestino: movimiento.destino,
            idReceptor: movimiento.receptor
          };
          await BienesRepositorio.actualizarMovimiento(client, movimientos);
          await MovimientosRepositorio.crearDetalles(client, movimientos);
        }
      }

      await client.query('COMMIT');
      return personalDependencia;
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

      const personalDependencia = await PersonalRepositorio.obtenerJefeMovimiento(client, id);
      await BienesRepositorio.deshacerMovimiento(client, id, personalDependencia);
      await MovimientosRepositorio.eliminar(client, id);

      await client.query('COMMIT');
      return personalDependencia;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async generarReporte(idMovimiento) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const id = idMovimiento;

      // 1. OBTENER DATOS DE LA BD
      const movimiento = await MovimientosRepositorio.obtenerPorId(client, id);
      const bienes = await BienesRepositorio.obtenerPorIdMovimiento(client, id);
      
      const jefe = await PersonalRepositorio.obtenerJefe();
      const coordinador = await PersonalRepositorio.obtenerCoordinador();
      const supervisor = await PersonalRepositorio.obtenerSupervisor();

      // 2. INICIALIZAR EXCELJS Y PLANTILLA
      const templatePath = path.join(__dirname, "../templates/formato_movimiento.xlsx");
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
      // 4. INYECCIÓN DE LA CABECERA (Origen y Destino)
      // =========================================================
      // Fila 7: Dependencias (Destino en la columna F según tu formato)
      worksheet.getCell("A7").value = movimiento.dependencia_origen;
      worksheet.getCell("F7").value = movimiento.dependencia_destino;

      // Fila 9: Responsables (Cedente y Receptor con su nivel profesional)
      worksheet.getCell("A9").value = `${movimiento.nivel_profesional_cedente} ${movimiento.cedente} (${movimiento.cedula_cedente})`;
      worksheet.getCell("F9").value = `${movimiento.nivel_profesional_receptor} ${movimiento.receptor} (${movimiento.cedula_receptor})`;

      // Fecha en I3 (Tu vista SQL ya la trae formateada en DD/MM/YYYY, la separamos para la estética del Excel)
      if (movimiento.fecha) {
        const [dia, mes, anio] = movimiento.fecha.split('/');
        worksheet.getCell("I3").value = `${dia}/${mes}/${anio}`;
      }

      // =========================================================
      // 5. INYECCIÓN DE LOS BIENES (A partir de la Fila 11)
      // =========================================================
      let filaActual = 11;

      bienes.forEach((bien) => {
        const row = worksheet.getRow(filaActual);

        // A y B se dejan vacías (Grupo y Sub Grupo)
        row.getCell("C").value = bien.numero;      
        row.getCell("D").value = bien.descripcion;      
        
        // Columna E: TIPO DE INCORPORACIÓN recibe el TIPO DE MOVIMIENTO
        row.getCell("E").value = movimiento.tipo;             
        
        // Quien recibe y custodia es el RECEPTOR
        row.getCell("F").value = `${movimiento.nivel_profesional_receptor} ${movimiento.receptor}`; 
        row.getCell("G").value = movimiento.cargo_receptor;       
        row.getCell("H").value = movimiento.cedula_receptor;      
        
        // La I (Firma) queda vacía para firma manual
        filaActual++;
      });

      // =========================================================
      // 6. INYECTAR EL TOTAL Y FIRMAS AL PIE DE PÁGINA
      // =========================================================
      const filaTotal = 31 + filasExtra;
      worksheet.getCell(`A${filaTotal}`).value = `TOTAL: ${totalBienes}`; 
      
      // Aseguramos el borde continuo de la fila TOTAL desde la A (1) hasta la I (9)
      for (let i = 1; i <= 9; i++) {
        worksheet.getCell(filaTotal, i).border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: i === 1 ? { style: "thin" } : undefined,  
          right: i === 9 ? { style: "thin" } : undefined  
        };
      }

      // Firmas al pie de página (Fila 33)
      const filaFirmas = 33 + filasExtra;
      
      // A: RESPONSABLE (Destino) | D: SUPERVISOR | F: COORDINADOR | H: JEFE
      worksheet.getCell(`A${filaFirmas}`).value = `${movimiento.nivel_profesional_receptor} ${movimiento.receptor}`;
      worksheet.getCell(`D${filaFirmas}`).value = `${supervisor.nivel_profesional} ${supervisor.empleado}`;
      worksheet.getCell(`F${filaFirmas}`).value = `${coordinador.nivel_profesional} ${coordinador.empleado}`; 
      worksheet.getCell(`H${filaFirmas}`).value = `${jefe.nivel_profesional} ${jefe.empleado}`;

      // Centramos los nombres en la caja de firmas
      ['A', 'D', 'F', 'H'].forEach(col => {
        worksheet.getCell(`${col}${filaFirmas}`).alignment = { vertical: 'bottom', horizontal: 'center' };
      });

      // Restauramos el borde derecho de la caja gigante de firmas (Columna I)
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

export default new MovimientosServices();