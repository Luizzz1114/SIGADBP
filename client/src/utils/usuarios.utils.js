import { z } from 'zod';
import usuariosServices from '@/services/usuarios.services.js';


// --- Listas de datos
export const roles = ['Administrador', 'Supervisor', 'Analista'];


// --- Schemas de validación
export const createUsuarioSchema = () => {
  let lastCheck = {
    username: '',
    correo: '',
    id: null,
    usernameValido: true,
    correoValido: true
  };
  return z.object({
    id: z.number().optional(),
    personal: z.any()
      .refine((val) => val !== null && val !== '', 'Seleccione una persona'),
    rol: z.string().trim()
      .min(1, 'Seleccione un rol'),
    username: z.string().trim()
      .min(1, 'El nombre de usuario es obligatorio')
      .min(3, 'El nombre de usuario debe tener mínimo 3 caracteres')
      .max(20, 'El nombre de usuario debe tener máximo 20 caracteres')
      .regex(/[A-Z]/, 'El nombre de usuario debe contener al menos una letra mayúscula') 
      .regex(/[0-9]/, 'El nombre de usuario debe contener al menos un número'),
    correo: z.string().trim()
      .min(1, 'El correo es obligatorio')
      .email('El correo electrónico es inválido'),
    contrasena: z.string()
      .min(1, 'La contraseña es obligatoria')
      .min(8, 'La contraseña debe tener mínimo 8 caracteres')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  })
  .superRefine(async (data, ctx) => {
    if (data.username === lastCheck.username && data.correo === lastCheck.correo) {
      if (!lastCheck.usernameValido) {
        ctx.addIssue({ 
          code: 'custom',
          message: 'Este nombre de usuario ya está registrado',
          path: ['username']
        });
      }
      if (!lastCheck.correoValido) {
        ctx.addIssue({ 
          code: 'custom', 
          message: 'Este correo ya está registrado', 
          path: ['correo'] 
        });
      }
      return;
    }
    const { username_exists, correo_exists } = await usuariosServices.validarUsernameCorreo(data.username, data.correo, data?.id);
    lastCheck = { 
      username: data.username, 
      correo: data.correo, 
      id: data.id || null,
      usernameValido: !username_exists,
      correoValido: !correo_exists 
    };
    if (username_exists) {
      ctx.addIssue({ 
        code: 'custom',
        message: 'Este nombre de usuario ya está registrado',
        path: ['username']
      })
    }
    if (correo_exists) {
      ctx.addIssue({ 
        code: 'custom', 
        message: 'Este correo ya está registrado', 
        path: ['correo'] 
      });
    }
  });
};


// --- Schema para el perfil
export const createPerfilSchema = () => {
  let lastCheck = {
    username: '',
    correo: '',
    id: null,
    usernameValido: true,
    correoValido: true
  };
  return z.object({
    id: z.number(),
    username: z.string().trim()
      .min(1, 'El nombre de usuario es obligatorio')
      .min(3, 'El nombre de usuario debe tener mínimo 3 caracteres')
      .max(20, 'El nombre de usuario debe tener máximo 20 caracteres')
      .regex(/[A-Z]/, 'El nombre de usuario debe contener al menos una letra mayúscula') 
      .regex(/[0-9]/, 'El nombre de usuario debe contener al menos un número'),
    correo: z.string().trim()
      .min(1, 'El correo es obligatorio')
      .email('El correo electrónico es inválido'),
    contrasena: z.string()
      .min(1, 'La contraseña es obligatoria')
      .min(8, 'La contraseña debe tener mínimo 8 caracteres')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  })
  .superRefine(async (data, ctx) => {
    if (data.username === lastCheck.username && data.correo === lastCheck.correo && data.id === lastCheck.id) {
      if (!lastCheck.usernameValido) {
        ctx.addIssue({ 
          code: 'custom',
          message: 'Este nombre de usuario ya está registrado',
          path: ['username']
        });
      }
      if (!lastCheck.correoValido) {
        ctx.addIssue({ 
          code: 'custom', 
          message: 'Este correo ya está registrado', 
          path: ['correo'] 
        });
      }
      return;
    }
    const { username_exists, correo_exists } = await usuariosServices.validarUsernameCorreo(data.username, data.correo, data?.id);
    lastCheck = { 
      username: data.username, 
      correo: data.correo, 
      id: data.id || null,
      usernameValido: !username_exists,
      correoValido: !correo_exists 
    };
    if (username_exists) {
      ctx.addIssue({ 
        code: 'custom',
        message: 'Este nombre de usuario ya está registrado',
        path: ['username']
      })
    }
    if (correo_exists) {
      ctx.addIssue({ 
        code: 'custom', 
        message: 'Este correo ya está registrado', 
        path: ['correo'] 
      });
    }
  });
};