import { z } from 'zod';
import { parsearMonto } from '@/utils/formatters.js';


// --- Listas de datos
export const tiposMantenimiento = ['Preventivo', 'Correctivo'];
export const estatusMantenimiento = ['En proceso', 'Finalizado', 'Cancelado'];
export const estadosPosteriores = ['Óptimo', 'Bueno', 'Regular', 'Deficiente', 'Inoperativo'];


// --- Schema de validación
export const crearMantenimientoSchema = (presupuestosList = [], mantenimientoOriginal = null) => {
  return z.object({
    id: z.number().optional(),
    bien: z.any().refine((val) => val !== null && val !== '', 'Seleccione un bien'),
    tipo: z.string().trim().min(1, 'Seleccione un tipo de mantenimiento'),
    descripcion: z.string().trim().min(1, 'La descripción es obligatoria').max(100, 'La descripción debe tener máximo 100 caracteres'),
    fecha_inicio: z.preprocess(
      (val) => (val === null || val === undefined ? '' : val),
      z.string().trim().min(1, 'La fecha de inicio es obligatoria')
    ),
    estatus: z.string().trim().default('En proceso'),
    fecha_fin: z.string().trim().nullable().optional(),
    estado_posterior: z.any().optional(),
    gasto: z.preprocess(parsearMonto, z.number().default(0)),
    presupuesto: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.presupuesto) {
      if (data.gasto <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'El gasto debe ser mayor a 0,00 al usar un presupuesto',
          path: ['gasto'],
        });
      } else {
        const presupuestoSeleccionado = presupuestosList.find(p => p.id === data.presupuesto.id);
        if (presupuestoSeleccionado) {
          let disponibleReal = parseFloat(presupuestoSeleccionado.total_disponible);
          
          if (mantenimientoOriginal && mantenimientoOriginal.id_presupuesto === data.presupuesto.id) {
            disponibleReal += parseFloat(mantenimientoOriginal.gasto || 0);
          }
          
          if (data.gasto > disponibleReal) {
            ctx.addIssue({
              code: 'custom',
              message: `El gasto excede el monto disponible ($${disponibleReal.toFixed(2)}) para el presupuesto seleccionado`,
              path: ['gasto'],
            });
          }
        }
      }
    }
    if (data.estatus !== 'En proceso') {
      if (!data.estado_posterior) {
        ctx.addIssue({
          code: 'custom',
          message: 'Seleccione el estado del bien tras el mantenimiento',
          path: ['estado_posterior'],
        });
      }
      if (!data.fecha_fin) { 
        ctx.addIssue({
          code: 'custom',
          message: 'La fecha de finalización es obligatoria',
          path: ['fecha_fin'],
        });
      }
    }
  });
};