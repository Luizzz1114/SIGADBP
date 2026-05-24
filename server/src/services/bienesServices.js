import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/database.js";
import BienesRepositorio from "../repositories/bienesRepositorio.js";
import MueblesRepositorio from "../repositories/mueblesRepositorio.js";
import TecnologicosRepositorio from "../repositories/tecnologicosRepositorio.js";
import VehiculosRepositorio from "../repositories/vehiculosRepositorio.js";
import PersonalRepositorio from "../repositories/personalRepositorio.js";
import ExcelJS from "exceljs";

// Configuración de __dirname requerida para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BienesServices {
  async listar() {
    return await BienesRepositorio.listar();
  }

  async listarOperativos() {
    return await BienesRepositorio.listarOperativos();
  }

  async listarNoAsignados() {
    return await BienesRepositorio.listarNoAsignados();
  }

  async bienesNoIdentificados() {
    return await BienesRepositorio.bienesNoIdentificados();
  }

  async validarNumeroBienUnico(validar) {
    const resultado = await BienesRepositorio.validarNumeroBienUnico(validar);
    if (resultado > 0) {
      return true;
    }
    return false;
  }

  async obtenerPorId(id) {
    return await BienesRepositorio.obtenerPorId(id);
  }

  async obtenerMetricasPorCategoria() {
    return await BienesRepositorio.obtenerMetricasPorCategoria();
  }

  async obtenerMetricasPorEstatus() {
    return await BienesRepositorio.obtenerMetricasPorEstatus();
  }

  async obtenerResumenMetricas() {
    return await BienesRepositorio.obtenerResumenMetricas();
  }

  async obtenerMetricasPorDependencia() {
    return await BienesRepositorio.obtenerMetricasPorDependencia();
  }

  async metricaDisponibilidadPorDependencia() {
    return await BienesRepositorio.metricaDisponibilidadPorDependencia();
  }

  async crear(bien) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const idBien = await BienesRepositorio.crear(bien, client);

      switch (bien.categoria) {
        case "Mueble":
          await MueblesRepositorio.crear(idBien, bien, client);
          break;
        case "Tecnológico":
          await TecnologicosRepositorio.crear(idBien, bien, client);
          break;
        case "Vehículo o Equipo de Elevación":
          await VehiculosRepositorio.crear(idBien, bien, client);
          break;
        default:
          throw new Error("Categoría de bien no válida");
      }

      await client.query("COMMIT");
      return idBien;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizar(bien) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await BienesRepositorio.actualizar(bien, client);

      switch (bien.categoria) {
        case "Mueble":
          await MueblesRepositorio.actualizar(bien, client);
          break;
        case "Tecnológico":
          await TecnologicosRepositorio.actualizar(bien, client);
          break;
        case "Vehículo o Equipo de Elevación":
          await VehiculosRepositorio.actualizar(bien, client);
          break;
        default:
          throw new Error("Categoría de bien no válida");
      }

      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async eliminar(id) {
    return await BienesRepositorio.eliminar(id);
  }

  async generarReporte(idDependencia) {
    const bienes = await BienesRepositorio.listarPorDependencia(idDependencia);
    const responsable = await PersonalRepositorio.responsableDependencia(idDependencia);
    const jefe = await PersonalRepositorio.obtenerJefe();
    const supervisor = await PersonalRepositorio.obtenerSupervisor();

    const templatePath = path.join(__dirname, "../templates/formato_inventario.xlsx");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    
    const worksheet = workbook.getWorksheet(1);

    const FILAS_PLANTILLA = 20; 
    const totalBienes = bienes.length;
    const filasExtra = totalBienes > FILAS_PLANTILLA ? totalBienes - FILAS_PLANTILLA : 0;

    if (filasExtra > 0) {
      worksheet.duplicateRow(28, filasExtra, true);
    }

    worksheet.getCell("A6").value = `DEPENDENCIA ORGANIZATIVA: ${responsable.dependencia}`;
    worksheet.getCell("A7").value = `RESPONSABLE ADMINISTRATIVO: ${responsable.nivel_profesional} ${responsable.responsable}`;
    worksheet.getCell("D6").value = `DIRECCIÓN: ${responsable.direccion}`;
    worksheet.getCell("D7").value = `CEDULA: ${responsable.cedula}`;
    worksheet.getCell("F7").value = `CARGO: ${responsable.cargo}`;
  
    const fecha = new Date();
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    
    worksheet.getCell("F3").value = `${dia} / ${mes} / ${anio}`;

    // 3. Inyectar el Total y asegurar su borde derecho (que ahora es la columna F)
    const filaTotal = 29 + filasExtra;
    worksheet.getCell(`A${filaTotal}`).value = `TOTAL: ${totalBienes}`; 
    
    worksheet.getCell(`F${filaTotal}`).border = {
      top: { style: "thin" },
      right: { style: "thin" }, 
      bottom: { style: "thin" }
    };

    // --- NUEVO: INYECTAR NOMBRES EN EL PIE DE PÁGINA ---
    const filaFirmas = 31 + filasExtra;
    
    worksheet.getCell(`A${filaFirmas}`).value = `${responsable.nivel_profesional} ${responsable.responsable}`;
    worksheet.getCell(`C${filaFirmas}`).value = `${supervisor.nivel_profesional} ${supervisor.empleado}`;
    worksheet.getCell(`E${filaFirmas}`).value = `${jefe.nivel_profesional} ${jefe.empleado}`;
    worksheet.getCell(`A${filaFirmas}`).alignment = { vertical: 'middle', horizontal: 'center' };
    
    worksheet.getCell(`F${filaTotal}`).border = {
      top: { style: "thin" },
      right: { style: "thin" }, 
      bottom: { style: "thin" }
    };

    let filaActual = 9;

    bienes.forEach((bien, index) => {
      const row = worksheet.getRow(filaActual);

      row.getCell("A").value = index + 1;         
      row.getCell("B").value = bien.numero;       
      row.getCell("C").value = bien.descripcion;  
      row.getCell("D").value = bien.serial || 'S/S'; 
      row.getCell("E").value = bien.estatus;      
      row.getCell("F").value = bien.observacion;  

      filaActual++;
    });

    return await workbook.xlsx.writeBuffer();
  }
}

export default new BienesServices();