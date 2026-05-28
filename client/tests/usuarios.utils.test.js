import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Mock the usuariosService before importing the utils
vi.mock('@/services/usuarios.services.js', () => ({
  default: {
    validarUsernameCorreo: vi.fn().mockResolvedValue({ username_exists: false, correo_exists: false })
  }
}));

import { roles, preguntasSeguridad } from '@/utils/usuarios.utils.js';

describe('usuarios.utils.js - constants', () => {
  it('debe tener exactamente 3 roles definidos', () => {
    expect(roles).toHaveLength(3);
    expect(roles).toContain('Administrador');
    expect(roles).toContain('Supervisor');
    expect(roles).toContain('Analista');
  });

  it('debe tener 10 preguntas de seguridad', () => {
    expect(preguntasSeguridad).toHaveLength(10);
  });

  it('debe tener preguntas de seguridad no vacías', () => {
    preguntasSeguridad.forEach(pregunta => {
      expect(pregunta.trim().length).toBeGreaterThan(0);
    });
  });

  it('debe tener roles únicos', () => {
    const uniqueRoles = [...new Set(roles)];
    expect(uniqueRoles).toHaveLength(roles.length);
  });
});

describe('usuarios.utils.js - schema validation (basic)', () => {
  // We test the basic structure of the schema factory without async validation
  
  it('debe exportar la función createUsuarioSchema', async () => {
    const { createUsuarioSchema } = await import('@/utils/usuarios.utils.js');
    expect(typeof createUsuarioSchema).toBe('function');
  });

  it('debe exportar la función createPerfilSchema', async () => {
    const { createPerfilSchema } = await import('@/utils/usuarios.utils.js');
    expect(typeof createPerfilSchema).toBe('function');
  });

  it('debe crear un schema para crear usuario (no edit mode)', async () => {
    const { createUsuarioSchema } = await import('@/utils/usuarios.utils.js');
    const schema = createUsuarioSchema(false);
    expect(schema).toBeInstanceOf(z.ZodObject);
  });

  it('debe crear un schema para editar usuario', async () => {
    const { createUsuarioSchema } = await import('@/utils/usuarios.utils.js');
    const schema = createUsuarioSchema(true);
    expect(schema).toBeInstanceOf(z.ZodObject);
  });
});