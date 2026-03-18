import { z } from 'zod';
import { parsearMonto } from './formatters';
import presupuestosServices from '@/services/presupuestos.services.js';


// --- Listas de datos
export const tiposPresupuestos = ['Compra de Muebles', 'Compra de Equipos Tecnológicos', 'Compra de Vehículos / Equipos de Elevación', 'Mantenimiento de Bienes'];
export const semestres = ['Semestre I', 'Semestre II'];

export const obtenerOpcionesSemestre = () => {
  const mesActual = new Date().getMonth();
  return semestres.map((s) => ({
    label: s,
    value: s,
    disabled: (s === 'Semestre I' && mesActual > 5) || (s === 'Semestre II' && mesActual < 6)
  }));
};

// --- Calcular monto en Bs.
export const montoCalculadoBs = (montousd, tasacambio) => {
  const usd = Number(montousd) || 0;
  const tasa = Number(tasacambio) || 0;
  return Number((usd * tasa).toFixed(2));
};


// --- Schema de validacion
export const createPresupuestoSchema = () => {
  let lastCheck = {
    codigo: '',
    id: null,
    esValido: true
  };
  return z.object({
    id: z.number().optional(),
    codigo: z.string().trim()
      .min(1, 'El código es obligatorio'),
    anio: z.union([z.string(), z.number()]),
    tipo: z.string().trim()
      .min(1, 'Seleccione un tipo'),
    semestre: z.string().trim()
      .min(1, 'Seleccione un semestre'),
    montousd: z.preprocess(parsearMonto, z.number().min(0.01, 'El monto es obligatorio')),
    tasacambio: z.preprocess(parsearMonto, z.number().min(0.01, 'La tasa de cambio es obligatoria')),
    montobs: z.preprocess(parsearMonto, z.number()),
    descripcion: z.string().trim()
      .min(1, 'La descripción es obligatoria'),
    estatus: z.string().trim().optional()
  })
  .refine(async (data) => {
    if (data.codigo === lastCheck.codigo) {
      return lastCheck.esValido;
    }
    const existe = await presupuestosServices.validarCodigo(data.codigo, data?.id);
    const esValido = !existe;
    lastCheck = {
      codigo: data.codigo,
      id: data.id || null,
      esValido: esValido
    };
    return esValido;
  }, {
    message: 'Este código de partida ya está registrado',
    path: ['codigo']
  });
};