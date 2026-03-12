import { z } from 'zod';


// --- Listas de datos
export const tiposMovimiento = ['Traslado', 'Cambio de responsable'];


// --- Schemas de validación para Movimientos
export const movimientoSchema = z.object({
  
  tipo: z.string().min(1, 'Debe seleccionar un tipo de movimiento'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),

  origen: z.any().refine((val) => val !== null && val !== undefined && val !== '', {
    message: 'Debe seleccionar una dependencia de origen (Cedente)'
  }),

  destino: z.any().optional().nullable(),
  nuevoResponsable: z.any().optional().nullable(),
  motivo: z.string().optional(),
  bienes: z.array(z.any()).min(1, 'Debe seleccionar al menos un bien para realizar el movimiento')

}).superRefine((datos, ctx) => {
  
  if (datos.tipo === 'Traslado' && datos.origen && datos.destino) {
    if (datos.origen.id === datos.destino.id) {
      ctx.addIssue({
        message: 'La dependencia de destino no puede ser la misma de origen',
        path: ['destino'],
      });
    }
  }

  if (datos.tipo === 'Cambio de responsable' && datos.origen && datos.nuevoResponsable) {
    if (datos.origen.idr === datos.nuevoResponsable.id) {
      ctx.addIssue({
        message: 'El nuevo responsable debe ser una persona diferente al actual',
        path: ['nuevoResponsable'],
      });
    }
  }
  
});