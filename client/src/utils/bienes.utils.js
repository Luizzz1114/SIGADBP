import { z } from 'zod';
import bienesServices from '@/services/bienes.services.js';


// --- Listas de datos
export const estatus = ['Operativo', 'No asignado', 'En mantenimiento', 'Desincorporado'];
export const categorias = ['Mueble', 'Tecnológico', 'Vehículo o Equipo de Elevación'];

export const tiposMuebles = [
  'Escritorio',
  'Archivador',
  'Estante',
  'Mesa',
  'Armario',
  'Electrodoméstico',
];

export const materialesMuebles = [
  'Madera',
  'Metal (Acero/Aluminio)',
  'Plástico / Polímero',
  'Vidrio Templado',
  'Cuero / Sintético',
  'Tela / Malla',
  'Acrílico',
  'Hierro Forjado',
  'Mármol / Granito'
];

export const coloresVehiculos = [
  'Blanco',
  'Amarillo',
  'Naranja',
  'Rojo',
  'Azul',
  'Gris Plata',
  'Gris Plomo',
  'Verde',
  'Negro',
  'Beige'
];


// --- Schema de validación
export const createBienSchema = () => {
  let lastCheck = {
    numero: '',
    id: null,
    esValido: true
  };
  return z.object({
    id: z.number().optional(),
    numero: z.string().trim()
      .transform((val) => val === '' ? 'S/N' : val),
    descripcion: z.string().trim()
      .min(1, 'La descripción es obligatoria'),
    categoria: z.string().trim()
      .min(1, 'Seleccione una categoría'),
    marca: z.string().trim().optional(),
    modelo: z.string().trim().optional(),
    tipomueble: z.string().trim().optional(),
    material: z.string().trim().optional(),
    serial: z.string().trim().optional(),
    especificaciones: z.string().trim().optional(),
    serialcarroceria: z.string().trim().optional(),
    placa: z.string().trim().optional(),
    color: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.categoria === 'Mueble') {
      if (!data.tipomueble) {
        ctx.addIssue({ 
          message: 'El tipo de mueble es obligatorio',
          path: ['tipomueble'],
          code: 'custom'
        });
      }
      if (!data.material) {
        ctx.addIssue({
          message: 'El material es obligatorio',
          path: ['material'],
          code: 'custom'
        });
      }
    }
    if (data.categoria === 'Tecnológico' && !data.serial) {
      ctx.addIssue({ 
        message: 'El serial es obligatorio',
        path: ['serial'],
        code: 'custom'
      });
    }
    if (data.categoria === 'Vehículo o Equipo de Elevación' && !data.serialcarroceria) {
      ctx.addIssue({
        message: 'El serial de carrocería es obligatorio',
        path: ['serialcarroceria'],
        code: 'custom'
      });
    }
  })
  .refine(async (data) => {
    if (data.numero === 'S/N') return true;
    if (data.numero === lastCheck.numero) {
      return lastCheck.esValido;
    }
    const existe = await bienesServices.validarNumero(data.numero, data?.id);
    const esValido = !existe;
    lastCheck = {
      numero: data.numero,
      id: data.id || null,
      esValido
    };
    return esValido;
  }, {
    message: 'Este número de bien ya está registrado',
    path: ['numero']
  });
};