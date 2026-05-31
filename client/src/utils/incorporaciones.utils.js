import { z } from 'zod';
import { parsearMonto } from '@/utils/formatters.js';


// --- Listas de datos
export const motivos = ['Compra', 'Donación', 'Permuta', 'Reposición', 'Sobrante'];


// --- Schemas de validación
export const incorporacionSchema = (presupuestosList = []) => z.object({
  motivo: z.string().trim()
    .min(1, 'El motivo es obligatorio'),
  fecha_entrada: z.preprocess(
      (val) => (val === null || val === undefined ? '' : val), // Convierte null/undefined a string vacío
      z.string().trim().min(1, 'La fecha de entrada es obligatoria')
    ),
  dependencia: z.any()
    .refine((val) => val !== null && val !== undefined && val !== '', 'Seleccione una dependencia'),
  orden_compra: z.string().trim().optional(),
  nota_entrega: z.string().trim().optional(),
  proveedor: z.string().trim().optional(),
  factura: z.string().trim().optional(),
  bienes: z.array(z.any())
    .min(1, 'Debe seleccionar al menos un bien')
    .refine(
      (bienes) => {
        return bienes.every(bien => {
          const tieneGasto = parsearMonto(bien.gasto) > 0;
          if (tieneGasto) {
            return bien.id_presupuesto !== null && bien.id_presupuesto !== undefined;
          }
          return true;
        });
      },
      'Si asigna un gasto, debe seleccionar una partida presupuestaria',
    )
}).superRefine((data, ctx) => {
  // Validar gastos por presupuesto
  if (data.bienes && data.bienes.length > 0 && presupuestosList.length > 0) {
    const gastosPorPresupuesto = {};
    
    data.bienes.forEach((bien) => {
      const gasto = parsearMonto(bien.gasto);
      const presupuestoId = bien.id_presupuesto;
      
      // Validar: si hay presupuesto, el gasto debe ser mayor a 0
      if (presupuestoId && gasto <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'El gasto debe ser mayor a 0,00 cuando hay un presupuesto seleccionado',
          path: ['bienes'],
        });
      }
      
      // Agrupar gastos para validar límite
      if (presupuestoId && gasto > 0) {
        if (!gastosPorPresupuesto[presupuestoId]) {
          gastosPorPresupuesto[presupuestoId] = 0;
        }
        gastosPorPresupuesto[presupuestoId] += gasto;
      }
    });
    
    // Validar que la suma no exceda el disponible
    for (const [idPresupuesto, totalGasto] of Object.entries(gastosPorPresupuesto)) {
      const presupuesto = presupuestosList.find(p => p.id === parseInt(idPresupuesto));
      if (presupuesto) {
        const disponible = parseFloat(presupuesto.total_disponible);
        if (totalGasto > disponible) {
          ctx.addIssue({
            code: 'custom',
            message: `La suma de gastos excede el disponible para "${presupuesto.tipo}"`,
            path: ['bienes'],
          });
          break;
        }
      }
    }
  }
});