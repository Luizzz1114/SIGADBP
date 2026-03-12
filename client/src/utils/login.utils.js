import { z } from 'zod';

// --- Schemas de validación
export const loginSchema = z.object({
  username: z.string().min(1, 'Requerido'),
  contrasena: z.string().min(1, 'Requerido')
});