import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock pool for transaction testing
vi.mock('../../src/config/database.js', () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn().mockResolvedValue({
      query: vi.fn(),
      release: vi.fn()
    })
  }
}));

import UsuariosService from '../../src/services/usuariosService.js';
import UsuariosRepositorio from '../../src/repositories/usuariosRepositorio.js';
import EvaluacionesRepositorio from '../../src/repositories/evaluacionesRepositorio.js';

describe('UsuariosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('debe listar todos los usuarios', async () => {
      const mockUsuarios = [
        { id: 1, username: 'admin', rol: 'Administrador' },
        { id: 2, username: 'user1', rol: 'Usuario' }
      ];
      UsuariosRepositorio.listar.mockResolvedValue(mockUsuarios);

      const resultado = await UsuariosService.listar();

      expect(UsuariosRepositorio.listar).toHaveBeenCalled();
      expect(resultado).toEqual(mockUsuarios);
    });
  });

  describe('validarUsernameCorreo', () => {
    it('debe validar username y correo únicos', async () => {
      const validarData = { username: 'newuser', correo: 'new@test.com' };
      UsuariosRepositorio.validarUsernameCorreo.mockResolvedValue({ username_exists: false, correo_exists: false });

      const resultado = await UsuariosService.validarUsernameCorreo(validarData);

      expect(UsuariosRepositorio.validarUsernameCorreo).toHaveBeenCalledWith(validarData);
      expect(resultado.username_exists).toBe(false);
      expect(resultado.correo_exists).toBe(false);
    });

    it('debe indicar cuando el username ya existe', async () => {
      UsuariosRepositorio.validarUsernameCorreo.mockResolvedValue({ username_exists: true, correo_exists: false });

      const resultado = await UsuariosService.validarUsernameCorreo({ username: 'existing', correo: 'new@test.com' });

      expect(resultado.username_exists).toBe(true);
    });
  });

  describe('iniciarSesion', () => {
    it('debe retornar error cuando el usuario no existe', async () => {
      UsuariosRepositorio.iniciarSesion.mockResolvedValue(null);

      const resultado = await UsuariosService.iniciarSesion({ username: 'nonexistent', contrasena: 'pass' });

      expect(resultado).toEqual({ autenticado: false, mensaje: 'Usuario no encontrado.' });
    });

    it('debe retornar error cuando la contraseña es incorrecta', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        contrasena: await bcrypt.hash('correct_password', 10),
        rol: 'Administrador',
        correo: 'admin@test.com'
      };
      UsuariosRepositorio.iniciarSesion.mockResolvedValue(mockUser);

      const resultado = await UsuariosService.iniciarSesion({ username: 'admin', contrasena: 'wrong' });

      expect(resultado).toEqual({ autenticado: false, mensaje: 'Credenciales incorrectas.' });
    });

    it('debe iniciar sesión exitosamente con credenciales válidas', async () => {
      const plainPassword = 'valid_password';
      const mockUser = {
        id: 1,
        username: 'admin',
        contrasena: await bcrypt.hash(plainPassword, 10),
        rol: 'Administrador',
        correo: 'admin@test.com'
      };
      UsuariosRepositorio.iniciarSesion.mockResolvedValue(mockUser);
      EvaluacionesRepositorio.encuestaRespondida.mockResolvedValue(false);

      const resultado = await UsuariosService.iniciarSesion({ username: 'admin', contrasena: plainPassword });

      expect(resultado.autenticado).toBe(true);
      expect(resultado.token).toBeDefined();
      expect(resultado.usuario.id).toBe(1);
    });
  });

  describe('recuperarContrasena', () => {
    it('debe retornar error cuando el usuario no existe', async () => {
      UsuariosRepositorio.recuperarContrasena.mockResolvedValue(null);

      const resultado = await UsuariosService.recuperarContrasena({
        identificador: 'nonexistent',
        pregunta: 'color',
        respuesta: 'azul'
      });

      expect(resultado).toEqual({ encontrado: false, mensaje: 'Usuario no encontrado.' });
    });

    it('debe retornar error cuando la pregunta es incorrecta', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        correo: 'admin@test.com',
        pregunta: 'mascota',
        respuesta: await bcrypt.hash('perro', 10)
      };
      UsuariosRepositorio.recuperarContrasena.mockResolvedValue(mockUser);

      const resultado = await UsuariosService.recuperarContrasena({
        identificador: 'admin',
        pregunta: 'color',
        respuesta: 'azul'
      });

      expect(resultado.mensaje).toBe('Pregunta incorrecta.');
    });

    it('debe verificar usuario y generar token para recuperación', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        correo: 'admin@test.com',
        pregunta: 'mascota',
        respuesta: await bcrypt.hash('perro', 10)
      };
      UsuariosRepositorio.recuperarContrasena.mockResolvedValue(mockUser);

      const resultado = await UsuariosService.recuperarContrasena({
        identificador: 'admin',
        pregunta: 'mascota',
        respuesta: 'perro'
      });

      expect(resultado.encontrado).toBe(true);
      expect(resultado.token).toBeDefined();
    });
  });

  describe('crear', () => {
    it('debe crear un usuario con contraseña encriptada', async () => {
      UsuariosRepositorio.crear.mockResolvedValue(true);

      await UsuariosService.crear({
        personal: 1,
        username: 'newuser',
        correo: 'new@test.com',
        contrasena: 'password123',
        rol: 'Usuario',
        pregunta: 'color',
        respuesta: 'azul'
      });

      const userCreado = UsuariosRepositorio.crear.mock.calls[0][0];
      expect(userCreado.contrasena).not.toBe('password123');
    });
  });

  describe('actualizar', () => {
    it('debe actualizar usuario sin cambiar contraseña vacía', async () => {
      UsuariosRepositorio.actualizar.mockResolvedValue(true);

      await UsuariosService.actualizar({ id: 1, username: 'updated', contrasena: '', rol: 'Usuario' });

      const userActualizado = UsuariosRepositorio.actualizar.mock.calls[0][0];
      expect(userActualizado.contrasena).toBeUndefined();
    });

    it('debe actualizar usuario con nueva contraseña encriptada', async () => {
      UsuariosRepositorio.actualizar.mockResolvedValue(true);

      await UsuariosService.actualizar({ id: 1, username: 'updated', contrasena: 'newpassword', rol: 'Usuario' });

      const userActualizado = UsuariosRepositorio.actualizar.mock.calls[0][0];
      expect(userActualizado.contrasena).not.toBe('newpassword');
    });
  });

  describe('eliminar', () => {
    it('debe lanzar error ULTIMO_ADMIN si es el último administrador', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });
      
      UsuariosRepositorio.contarAdministradores.mockResolvedValue({ total_admin: '1', rol: 'Administrador' });

      await expect(UsuariosService.eliminar(1)).rejects.toThrow('ULTIMO_ADMIN');
    });
  });
});