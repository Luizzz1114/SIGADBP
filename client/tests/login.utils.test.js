import { describe, it, expect } from 'vitest';
import { loginSchema, nuevaContrasenaSchema } from '@/utils/login.utils.js';

describe('login.utils.js - loginSchema', () => {
  it('debe validar un objeto de login válido', () => {
    const result = loginSchema.safeParse({
      username: 'admin',
      contrasena: 'password123'
    });
    expect(result.success).toBe(true);
  });

  it('debe fallar si el username está vacío', () => {
    const result = loginSchema.safeParse({
      username: '',
      contrasena: 'password123'
    });
    expect(result.success).toBe(false);
  });

  it('debe fallar si la contraseña está vacía', () => {
    const result = loginSchema.safeParse({
      username: 'admin',
      contrasena: ''
    });
    expect(result.success).toBe(false);
  });

  it('debe fallar si ambos campos están vacíos', () => {
    const result = loginSchema.safeParse({
      username: '',
      contrasena: ''
    });
    expect(result.success).toBe(false);
  });

  it('debe fallar si faltan ambos campos', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('login.utils.js - nuevaContrasenaSchema', () => {
  it('debe validar contraseña válida con requisitos mínimos', () => {
    const result = nuevaContrasenaSchema.safeParse({
      contrasena: 'Password123',
      confirmarContrasena: 'Password123'
    });
    expect(result.success).toBe(true);
  });

  it('debe fallar si la contraseña tiene menos de 8 caracteres', () => {
    const result = nuevaContrasenaSchema.safeParse({
      contrasena: 'Pass1',
      confirmarContrasena: 'Pass1'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La contraseña debe tener mínimo 8 caracteres');
    }
  });

  it('debe fallar si la contraseña no tiene minúscula', () => {
    const result = nuevaContrasenaSchema.safeParse({
      contrasena: 'PASSWORD123',
      confirmarContrasena: 'PASSWORD123'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La contraseña debe contener al menos una letra minúscula');
    }
  });

  it('debe fallar si la contraseña no tiene mayúscula', () => {
    const result = nuevaContrasenaSchema.safeParse({
      contrasena: 'password123',
      confirmarContrasena: 'password123'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La contraseña debe contener al menos una letra mayúscula');
    }
  });

  it('debe fallar si la contraseña no tiene número', () => {
    const result = nuevaContrasenaSchema.safeParse({
      contrasena: 'PasswordABC',
      confirmarContrasena: 'PasswordABC'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La contraseña debe contener al menos un número');
    }
  });

  it('debe fallar si las contraseñas no coinciden', () => {
    const result = nuevaContrasenaSchema.safeParse({
      contrasena: 'Password123',
      confirmarContrasena: 'Password456'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const hasMismatchError = result.error.issues.some(
        issue => issue.message === 'Las contraseñas no coinciden'
      );
      expect(hasMismatchError).toBe(true);
    }
  });

  it('debe fallar si confirmar contraseña está vacío', () => {
    const result = nuevaContrasenaSchema.safeParse({
      contrasena: 'Password123',
      confirmarContrasena: ''
    });
    expect(result.success).toBe(false);
  });

  it('debe validar contraseña con caracteres especiales', () => {
    const result = nuevaContrasenaSchema.safeParse({
      contrasena: 'Password123!',
      confirmarContrasena: 'Password123!'
    });
    expect(result.success).toBe(true);
  });
});