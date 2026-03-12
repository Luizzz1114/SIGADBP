import { z } from 'zod';
import cargosServices from '@/services/cargos.services.js';


// --- Listas de datos
export const tiposCargos = [
  'Responsable Patrimonial Primario',
  'Responsable Patrimonial de Uso y Custodia',
  'Personal de la Unidad de Administración'
];


// --- Schemas de validación
export const createCargoSchema = () => {
  let lastCheck = {
    nombre: '',
    id: null,
    esValido: true
  }
  return z.object({
    id: z.number().optional(),
    nombre: z.string().trim()
      .min(1, 'El nombre es obligatorio')
      .min(3, 'El nombre debe tener mínimo 3 caracteres'),
    tipo: z.string().trim()
      .min(1, 'Seleccione un tipo de cargo')
  })
  .refine(async (data) => {
    if (data.nombre === lastCheck.nombre) {
      return lastCheck.esValido;
    }
    const existe = await cargosServices.validarNombre(data.nombre, data?.id);
    const esValido = !existe;
    lastCheck = {
      nombre: data.nombre,
      id: data.id || null,
      esValido: esValido
    };
    return esValido;
  }, {
    message: 'Este nombre de cargo ya está registrado',
    path: ['nombre'] 
  });
}