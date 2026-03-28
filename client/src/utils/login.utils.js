import { z } from 'zod';

// --- Schemas de validación
export const loginSchema = z.object({
  username: z.string().min(1, 'Requerido'),
  contrasena: z.string().min(1, 'Requerido')
});

export const recuperarContrasenaSchema = z.object({
  identificador: z.string().min(1, 'Requerido'),
  metodo: z.enum(['correo', 'pregunta']),
  pregunta: z.string().optional(),
  respuesta: z.string().optional()
}).superRefine((datos, ctx) => {
  if (datos.metodo === 'pregunta') {
    if (!datos.pregunta || datos.pregunta.trim() === '') {
      ctx.addIssue({
        path: ['pregunta'],
        message: 'La pregunta es requerida',
        code: "custom",
      });
    }
    if (!datos.respuesta || datos.respuesta.trim() === '') {
      ctx.addIssue({
        path: ['respuesta'],
        message: 'La respuesta es requerida',
        code: "custom",
      });
    }
  }
});

const contrasenaBaseSchema = z.string({ required_error: 'La contraseña es obligatoria' })
  .min(8, 'La contraseña debe tener mínimo 8 caracteres')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número');

export const nuevaContrasenaSchema = z.object({
  contrasena: contrasenaBaseSchema,
  confirmarContrasena: z.string({ required_error: 'Confirmar la contraseña es obligatorio' })
    .min(1, 'Debe confirmar la contraseña')
}).superRefine(({ contrasena, confirmarContrasena }, ctx) => {
  if (confirmarContrasena !== contrasena) {
    ctx.addIssue({
      code: "custom",
      message: "Las contraseñas no coinciden",
      path: ["confirmarContrasena"]
    });
  }
});