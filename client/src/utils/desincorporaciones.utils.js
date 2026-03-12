import { z } from 'zod';


// --- Listas de datos
export const tiposDesincorporacion = ['Desuso', 'Deterioro', 'Donación', 'Obsolescencia', 'Pérdida', 'Robo', 'Venta'];


// --- Schemas de validación
export const desincorporacionSchema = z.object({
  dependencia: z.any()
    .refine((val) => val !== null && val !== undefined && val !== '', 'Seleccione una dependencia'),
  fecha_salida: z.string().trim()
    .min(1, 'La fecha de salida es obligatoria'),
  descripcion: z.string().trim()
    .max(150, 'La descripción debe tener máximo 150 caracteres')
    .optional(),
  bienes: z.array(z.any())
    .min(1, 'Debe seleccionar al menos un bien para desincorporar')
    .refine(
      (bienes) => {
        return bienes.every(bien => {
          return bien.tipo_desincorporacion !== null && 
            bien.tipo_desincorporacion !== undefined && 
            bien.tipo_desincorporacion !== '';
        });
      },
      'Debe asignar un tipo de desincorporación a cada bien listado'
    )
});