import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockLoginResponse, mockUsuarios } from './mocks/api.js';

vi.mock('@/api/axios.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

import usuariosService from '@/services/usuarios.services.js';

describe('usuarios.services.js', () => {
  let mockAxiosInstance;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    const axios = await import('@/api/axios.js');
    mockAxiosInstance = axios.default;
  });

  describe('listar()', () => {
    it('debe hacer GET /usuarios y retornar los datos', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockUsuarios });
      
      const result = await usuariosService.listar();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/usuarios');
      expect(result).toEqual(mockUsuarios);
    });

    it('debe manejar errores de red', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));
      
      await expect(usuariosService.listar()).rejects.toThrow('Network error');
    });
  });

  describe('login()', () => {
    it('debe hacer POST /usuarios/login con credenciales', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: mockLoginResponse });
      
      const credentials = { username: 'admin', contrasena: 'password123' };
      const result = await usuariosService.login(credentials);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/usuarios/login', credentials);
      expect(result.autenticado).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('debe retornar autenticado: false cuando credenciales son inválidas', async () => {
      mockAxiosInstance.post.mockResolvedValue({ 
        data: { autenticado: false, mensaje: 'Credenciales incorrectas.' } 
      });
      
      const credentials = { username: 'admin', contrasena: 'wrong' };
      const result = await usuariosService.login(credentials);
      
      expect(result.autenticado).toBe(false);
    });
  });

  describe('crear()', () => {
    it('debe hacer POST /usuarios con datos del usuario', async () => {
      const newUser = {
        username: 'newuser',
        correo: 'new@test.com',
        contrasena: 'Password123',
        rol: 'Usuario'
      };
      mockAxiosInstance.post.mockResolvedValue({ data: { message: 'Usuario creado exitosamente.' } });
      
      const result = await usuariosService.crear(newUser);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/usuarios', newUser);
      expect(result.message).toBe('Usuario creado exitosamente.');
    });
  });

  describe('obtener()', () => {
    it('debe hacer GET /usuarios/:id y retornar el usuario', async () => {
      const mockUser = mockUsuarios[0];
      mockAxiosInstance.get.mockResolvedValue({ data: mockUser });
      
      const result = await usuariosService.obtener(1);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/usuarios/1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('actualizar()', () => {
    it('debe hacer PUT /usuarios con datos actualizados', async () => {
      const updatedUser = { id: 1, username: 'admin_updated' };
      mockAxiosInstance.put.mockResolvedValue({ data: { message: 'Usuario actualizado.' } });
      
      const result = await usuariosService.actualizar(updatedUser);
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/usuarios', updatedUser);
    });
  });

  describe('eliminar()', () => {
    it('debe hacer DELETE /usuarios/:id', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: { message: 'Usuario eliminado.' } });
      
      await usuariosService.eliminar(1);
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/usuarios/1');
    });
  });

  describe('validarUsernameCorreo()', () => {
    it('deba hacer POST /usuarios/username-correo', async () => {
      mockAxiosInstance.post.mockResolvedValue({ 
        data: { username_exists: false, correo_exists: false } 
      });
      
      const result = await usuariosService.validarUsernameCorreo('newuser', 'new@test.com');
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/usuarios/username-correo', {
        username: 'newuser',
        correo: 'new@test.com',
        id: null
      });
      expect(result.username_exists).toBe(false);
    });

    it('debe incluir id cuando se proporciona para edición', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { username_exists: false } });
      
      await usuariosService.validarUsernameCorreo('admin', 'admin@test.com', 1);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/usuarios/username-correo', {
        username: 'admin',
        correo: 'admin@test.com',
        id: 1
      });
    });
  });

  describe('recuperarContrasena()', () => {
    it('debe hacer POST /usuarios/recuperar-contrasena', async () => {
      const data = { identificador: 'admin', pregunta: 'mascota', respuesta: 'perro' };
      mockAxiosInstance.post.mockResolvedValue({ 
        data: { encontrado: true, token: 'reset-token-123' } 
      });
      
      const result = await usuariosService.recuperarContrasena(data);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/usuarios/recuperar-contrasena', data);
      expect(result.encontrado).toBe(true);
    });
  });

  describe('actualizarContrasena()', () => {
    it('debe hacer PUT /usuarios/cambiar-contrasena', async () => {
      const data = { contrasena: 'NewPassword123' };
      mockAxiosInstance.put.mockResolvedValue({ data: { message: 'Contraseña actualizada.' } });
      
      await usuariosService.actualizarContrasena(data);
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/usuarios/cambiar-contrasena', data);
    });
  });
});