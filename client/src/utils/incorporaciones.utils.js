import { z } from 'zod';
import { parsearMonto } from '@/utils/formatters.js';


// --- Listas de datos
export const motivos = ['Compra', 'Donación', 'Permuta', 'Reposición', 'Sobrante'];


// --- Schemas de validación
export const incorporacionSchema = z.object({
  motivo: z.string().trim()
    .min(1, 'El motivo es obligatorio'),
  fecha_entrada: z.string().trim()
    .min(1, 'La fecha de entrada es obligatoria'),
  dependencia: z.any()
    .refine((val) => val !== null && val !== undefined && val !== '', 'Seleccione una dependencia'),
  orden_compra: z.string().trim().optional(),
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
});