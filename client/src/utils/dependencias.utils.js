import { z } from 'zod';
import dependenciasServices from '@/services/dependencias.services.js';

// --- Listas de datos
export const tiposDependencias = ['Centro de Acopio', 'Módulo', 'Unidad'];


// --- Schemas de validación
export const createDependenciaSchema = () => {
  let lastCheck = {
    nombre: '',
    id: null,
    esValido: true
  }
  return z.object({
    id: z.number().optional(),
    nombre: z.string().trim()
      .min(1, 'El nombre es obligatorio')
      .max(50, 'El nombre debe tener máximo 50 caracteres'),
    tipo: z.string().trim()
      .min(1, 'Seleccione un tipo de dependencia'),
    direccion: z.string().trim()
      .min(1, 'La dirección es obligatoria'),
    estado: z.any()
      .refine((val) => val !== null && val !== '', 'Seleccione un estado'),
    municipio: z.any()
      .refine((val) => val !== null && val !== '', 'Seleccione un municipio'),
    parroquia: z.any()
      .refine((val) => val !== null && val !== '', 'Seleccione una parroquia'),
  })
  .refine(async (data) => {
    if (data.nombre === lastCheck.nombre) {
      return lastCheck.esValido;
    }
    const existe = await dependenciasServices.validarNombre(data.nombre, data?.id);
    const esValido = !existe;
    lastCheck = {
      nombre: data.nombre,
      id: data.id || null,
      esValido: esValido
    };
    return esValido;
  }, {
    message: 'Esta dependencia ya está registrada',
    path: ['nombre'] 
  });
}