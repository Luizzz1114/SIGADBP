import { z } from 'zod';
import personalServices from '@/services/personal.services.js';


// --- Listas de datos
export const generos = [{ label: 'Masculino', value: 'M' }, { label: 'Femenino', value: 'F' }];
export const prefijosAcademicos = ['Abg.', 'Arq.', 'Dr.', 'Esp.', 'Ing.', 'Lic.', 'MSc.', 'PhD.', 'Prof.', 'T.S.U.'];

const hoy = new Date();
export const maxDate = new Date(new Date().setFullYear(hoy.getFullYear() - 18));
export const minDate = new Date(new Date().setFullYear(hoy.getFullYear() - 80));


// --- Schemas de validación
export const createPersonalSchema = () => {
  let lastCheck = {
    cedula: '',
    id: null,
    esValido: true
  }
  return z.object({
    id: z.number().optional(),
    cedula: z.string().trim()
      .min(1, 'La cédula es obligatoria')
      .regex(/^\d{7,8}$/, 'La cédula debe tener entre 7 y 8 números'),
    nombres: z.string().trim()
      .min(1, 'El nombre es obligatorio')
      .min(2, 'El nombre debe tener mínimo 2 caracteres'),
    apellidos: z.string().trim()
      .min(1, 'El apellido es obligatorio')
      .min(2, 'El apellido debe tener mínimo 2 caracteres'),
    fechanacimiento: z.union([z.string(), z.date()])
      .refine((val) => val !== '' && val !== null, 'La fecha de nacimiento es obligatoria'),
    genero: z.string().trim()
      .min(1, 'Seleccione un género'),
    telefono: z.string().trim()
      .min(1, 'El teléfono es obligatorio')
      .regex(/^\d{4}-\d{6,8}$/, 'El teléfono tiene un formato inválido (Ej: 0414-1234567)'),
    estatus: z.string().trim()
      .min(1, 'Seleccione un estatus')
      .optional(),
    nivelprofesional: z.string().trim()
      .min(1, 'Seleccione o ingrese un nivel profesional'),
    cargo: z.any()
      .refine((val) => val !== null && val !== '', 'Seleccione un cargo'),
    dependencia: z.any()
      .refine((val) => val !== null && val !== '', 'Seleccione una dependencia'),
    fechaingreso: z.union([z.string(), z.date()])
      .refine((val) => val !== '' && val !== null, 'La fecha de ingreso es obligatoria'),
    idhc: z.number().optional(),
    fechasalida: z.union([z.string().nullable(), z.date().nullable()]).optional()
  })
  .refine(async (data) => {
    if (data.cedula === lastCheck.cedula) {
      return lastCheck.esValido;
    }
    const existe = await personalServices.validarCedula(data.cedula, data?.id);
    const esValido = !existe;
    lastCheck = {
      cedula: data.cedula,
      id: data.id || null,
      esValido: esValido
    };
    return esValido;
  }, {
    message: 'Esta cédula ya está registrada',
    path: ['cedula'] 
  })
  .superRefine((values, ctx) => {
    if (values.estatus === 'Inactivo' && !values.fechasalida) {
      ctx.addIssue({
        code: 'custom',
        message: 'La fecha de salida es obligatoria si el estatus es inactivo',
        path: ['fechasalida'],
      });
    }
  });
}