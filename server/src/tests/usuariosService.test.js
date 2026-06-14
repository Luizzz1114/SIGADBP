/**
 * Tests TDD para UsuariosService - Metodología XP
 * 
 * Ciclo TDD:
 * 1. Escribir test que falla (RED)
 * 2. Implementar código mínimo para pasar (GREEN)
 * 3. Refactorizar (REFACTOR)
 * 
 * Funcionalidades primordiales probadas:
 * - iniciarSesion: Autenticación de usuarios
 * - crear: Registro de nuevos usuarios
 * - validarUsernameCorreo: Validación de unicidad
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks
const mockUsuariosRepositorio = {
  listar: vi.fn(),
  iniciarSesion: vi.fn(),
  validarUsernameCorreo: vi.fn(),
  obtenerPorId: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  actualizarPerfil: vi.fn(),
  cambiarContrasena: vi.fn(),
  eliminar: vi.fn(),
  contarAdministradores: vi.fn(),
  recuperarContrasena: vi.fn()
};

const mockEvaluacionesRepositorio = {
  encuestaRespondida: vi.fn()
};

// Mock de bcrypt
const mockBcryptHash = vi.fn().mockImplementation((data) => Promise.resolve(`hashed_${data}`));
const mockBcryptCompare = vi.fn().mockImplementation((data, hash) => Promise.resolve(hash === `hashed_${data}`));

// Mock de jwt
const mockJwtSign = vi.fn().mockReturnValue('mock_jwt_token');

// Mock del pool
const mockPool = {
  query: vi.fn(),
  connect: vi.fn().mockResolvedValue({
    query: vi.fn(),
    release: vi.fn()
  })
};

// Configurar todos los mocks antes de importar los servicios
vi.mock('@/repositories/usuariosRepositorio.js', () => ({
  default: mockUsuariosRepositorio
}));

vi.mock('@/repositories/evaluacionesRepositorio.js', () => ({
  default: mockEvaluacionesRepositorio
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: mockBcryptHash,
    compare: mockBcryptCompare
  },
  hash: mockBcryptHash,
  compare: mockBcryptCompare
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: mockJwtSign,
    verify: vi.fn()
  },
  sign: mockJwtSign,
  verify: vi.fn()
}));

vi.mock('@/config/database.js', () => ({
  default: mockPool
}));

// Importar el servicio DESPUÉS de configurar los mocks
// Vitest permite esto porque los mocks se aplican antes de la resolución de módulos
const { default: UsuariosService } = await import('@/services/usuariosService.js');

describe('UsuariosService - TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('iniciarSesion', () => {
    // TEST 1: Usuario no encontrado - RED
    it('debe retornar autenticado=false cuando el usuario no existe', async () => {
      mockUsuariosRepositorio.iniciarSesion.mockResolvedValue(null);
      
      const resultado = await UsuariosService.iniciarSesion({
        username: 'usuario_no_existente',
        contrasena: 'password123'
      });

      expect(resultado.autenticado).toBe(false);
      expect(resultado.mensaje).toBe('Usuario no encontrado.');
    });

    // TEST 2: Credenciales incorrectas - RED
    it('debe retornar autenticado=false cuando la contraseña es incorrecta', async () => {
      mockUsuariosRepositorio.iniciarSesion.mockResolvedValue({
        id: 1,
        username: 'testuser',
        contrasena: 'hashed_wrong_password',
        rol: 'Usuario',
        correo: 'test@test.com'
      });
      mockEvaluacionesRepositorio.encuestaRespondida.mockResolvedValue(false);
      
      const resultado = await UsuariosService.iniciarSesion({
        username: 'testuser',
        contrasena: 'password_incorrecto'
      });

      expect(resultado.autenticado).toBe(false);
      expect(resultado.mensaje).toBe('Credenciales incorrectas.');
    });

    // TEST 3: Login exitoso - RED
    it('debe retornar autenticado=true con token cuando las credenciales son correctas', async () => {
      mockUsuariosRepositorio.iniciarSesion.mockResolvedValue({
        id: 1,
        username: 'admin',
        contrasena: 'hashed_password123',
        rol: 'Administrador',
        correo: 'admin@test.com'
      });
      mockEvaluacionesRepositorio.encuestaRespondida.mockResolvedValue(false);
      
      const resultado = await UsuariosService.iniciarSesion({
        username: 'admin',
        contrasena: 'password123'
      });

      expect(resultado.autenticado).toBe(true);
      expect(resultado.token).toBeDefined();
      expect(resultado.mensaje).toBe('Inicio de sesión exitoso.');
      expect(resultado.usuario).toBeDefined();
      expect(resultado.usuario.username).toBe('admin');
      expect(resultado.usuario.rol).toBe('Administrador');
    });
  });

  describe('validarUsernameCorreo', () => {
    // TEST 4: Validación exitosa cuando username y correo son únicos - RED
    it('debe retornar false cuando username y correo son únicos', async () => {
      mockUsuariosRepositorio.validarUsernameCorreo.mockResolvedValue({
        username_exists: false,
        correo_exists: false
      });
      
      const resultado = await UsuariosService.validarUsernameCorreo({
        username: 'nuevo_usuario',
        correo: 'nuevo@test.com'
      });

      expect(resultado.username_exists).toBe(false);
      expect(resultado.correo_exists).toBe(false);
    });

    // TEST 5: Username ya existe - RED
    it('debe retornar username_exists=true cuando el username ya está en uso', async () => {
      mockUsuariosRepositorio.validarUsernameCorreo.mockResolvedValue({
        username_exists: true,
        correo_exists: false
      });
      
      const resultado = await UsuariosService.validarUsernameCorreo({
        username: 'usuario_existente',
        correo: 'nuevo@test.com'
      });

      expect(resultado.username_exists).toBe(true);
      expect(resultado.correo_exists).toBe(false);
    });

    // TEST 6: Correo ya existe - RED
    it('debe retornar correo_exists=true cuando el correo ya está en uso', async () => {
      mockUsuariosRepositorio.validarUsernameCorreo.mockResolvedValue({
        username_exists: false,
        correo_exists: true
      });
      
      const resultado = await UsuariosService.validarUsernameCorreo({
        username: 'nuevo_usuario',
        correo: 'correo_existente@test.com'
      });

      expect(resultado.username_exists).toBe(false);
      expect(resultado.correo_exists).toBe(true);
    });
  });

  describe('crear', () => {
    // TEST 7: Crear usuario exitosamente - RED
    it('debe crear un usuario y retornar true', async () => {
      mockUsuariosRepositorio.crear.mockResolvedValue(true);
      
      const nuevoUsuario = {
        personal: 1,
        username: 'nuevo_usuario',
        correo: 'nuevo@test.com',
        contrasena: 'password123',
        rol: 'Usuario',
        pregunta: '¿Color favorito?',
        respuesta: 'azul'
      };

      const resultado = await UsuariosService.crear(nuevoUsuario);

      expect(resultado).toBe(true);
      expect(mockUsuariosRepositorio.crear).toHaveBeenCalledTimes(1);
      // Verificar que la contraseña fue hasheada
      const callArgs = mockUsuariosRepositorio.crear.mock.calls[0][0];
      expect(callArgs.contrasena).toContain('hashed_');
      expect(callArgs.respuesta).toContain('hashed_');
    });
  });

  describe('obtenerPorId', () => {
    // TEST 8: Obtener usuario por ID - RED
    it('debe retornar los datos del usuario cuando existe', async () => {
      const usuarioMock = {
        id: 1,
        username: 'testuser',
        correo: 'test@test.com',
        rol: 'Usuario',
        cedula: 'V12345678',
        empleado: 'Test User'
      };
      
      mockUsuariosRepositorio.obtenerPorId.mockResolvedValue(usuarioMock);
      
      const resultado = await UsuariosService.obtenerPorId(1);

      expect(resultado).toEqual(usuarioMock);
      expect(resultado.username).toBe('testuser');
    });

    // TEST 9: Obtener usuario inexistente - RED
    it('debe retornar undefined cuando el usuario no existe', async () => {
      mockUsuariosRepositorio.obtenerPorId.mockResolvedValue(null);
      
      const resultado = await UsuariosService.obtenerPorId(999);

      expect(resultado).toBeNull();
    });
  });

  describe('listar', () => {
    // TEST 10: Listar todos los usuarios - RED
    it('debe retornar una lista de usuarios', async () => {
      const usuariosMock = [
        { id: 1, username: 'admin', rol: 'Administrador' },
        { id: 2, username: 'user1', rol: 'Usuario' },
        { id: 3, username: 'user2', rol: 'Usuario' }
      ];
      
      mockUsuariosRepositorio.listar.mockResolvedValue(usuariosMock);
      
      const resultado = await UsuariosService.listar();

      expect(resultado).toHaveLength(3);
      expect(resultado[0].username).toBe('admin');
      expect(resultado[2].username).toBe('user2');
    });
  });

  describe('recuperarContrasena', () => {
    // TEST 11: Usuario no encontrado - RED
    it('debe retornar encontrado=false cuando el usuario no existe', async () => {
      mockUsuariosRepositorio.recuperarContrasena.mockResolvedValue(null);
      
      const resultado = await UsuariosService.recuperarContrasena({
        identificador: 'no_existe',
        pregunta: '¿Color favorito?',
        respuesta: 'azul'
      });

      expect(resultado.encontrado).toBe(false);
      expect(resultado.mensaje).toBe('Usuario no encontrado.');
    });

    // TEST 12: Pregunta incorrecta - RED
    it('debe retornar encontrado=false cuando la pregunta es incorrecta', async () => {
      mockUsuariosRepositorio.recuperarContrasena.mockResolvedValue({
        id: 1,
        username: 'testuser',
        pregunta: '¿Color favorito?',
        respuesta: 'hashed_azul'
      });
      
      const resultado = await UsuariosService.recuperarContrasena({
        identificador: 'testuser',
        pregunta: '¿Número favorito?',
        respuesta: 'azul'
      });

      expect(resultado.encontrado).toBe(false);
      expect(resultado.mensaje).toBe('Pregunta incorrecta.');
    });

    // TEST 13: Recuperación exitosa - RED
    it('debe retornar encontrado=true con token cuando la respuesta es correcta', async () => {
      mockUsuariosRepositorio.recuperarContrasena.mockResolvedValue({
        id: 1,
        username: 'testuser',
        correo: 'test@test.com',
        pregunta: '¿Color favorito?',
        respuesta: 'hashed_azul'
      });
      
      const resultado = await UsuariosService.recuperarContrasena({
        identificador: 'testuser',
        pregunta: '¿Color favorito?',
        respuesta: 'azul'
      });

      expect(resultado.encontrado).toBe(true);
      expect(resultado.mensaje).toBe('Usuario verificado.');
      expect(resultado.token).toBeDefined();
    });
  });

  describe('cambiarContrasena', () => {
    // TEST 14: Cambiar contraseña exitosamente - RED
    it('debe cambiar la contraseña y retornar true', async () => {
      mockUsuariosRepositorio.cambiarContrasena.mockResolvedValue(true);
      
      const resultado = await UsuariosService.cambiarContrasena({
        id: 1,
        contrasena: 'nueva_password'
      });

      expect(resultado).toBe(true);
      expect(mockUsuariosRepositorio.cambiarContrasena).toHaveBeenCalledTimes(1);
      // Verificar que la contraseña fue hasheada
      const callArgs = mockUsuariosRepositorio.cambiarContrasena.mock.calls[0][0];
      expect(callArgs.contrasena).toContain('hashed_');
    });
  });
});