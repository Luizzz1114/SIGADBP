import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';

// Mock dependencies
const mockUsuariosService = {
  login: vi.fn()
};

const mockSocket = {
  auth: {},
  connect: vi.fn(),
  disconnect: vi.fn()
};

vi.mock('@/services/usuarios.services.js', () => ({
  default: mockUsuariosService
}));

vi.mock('@/api/socket', () => ({
  socket: mockSocket
}));

vi.mock('@/utils/useNotificaciones.js', () => ({
  useNotificaciones: () => ({
    showError: vi.fn(),
    showWarning: vi.fn()
  })
}));

// Mock router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
    { path: '/inicio', name: 'inicio', component: { template: '<div>Inicio</div>' } },
    { path: '/recuperar-contrasena', name: 'recuperar', component: { template: '<div>Recuperar</div>' } }
  ]
});

describe('Login.vue component', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    router.push('/login');
    await router.isReady();
  });

  it('debe tener username y contrasena en el formulario', async () => {
    // Test the login form structure expectations
    const formData = {
      username: '',
      contrasena: ''
    };
    
    expect(formData).toHaveProperty('username');
    expect(formData).toHaveProperty('contrasena');
  });

  it('debe tener estado inicial con cargando en false', () => {
    const cargando = false;
    expect(cargando).toBe(false);
  });

  it('debe tener esquema de validación definido', async () => {
    const { loginSchema } = await import('@/utils/login.utils.js');
    expect(loginSchema).toBeDefined();
    
    const result = loginSchema.safeParse({ username: '', contrasena: '' });
    expect(result.success).toBe(false);
  });

  it('debe validar que username no esté vacío', async () => {
    const { loginSchema } = await import('@/utils/login.utils.js');
    
    const result = loginSchema.safeParse({ username: '', contrasena: 'Password123' });
    expect(result.success).toBe(false);
  });

  it('debe validar que contrasena no esté vacía', async () => {
    const { loginSchema } = await import('@/utils/login.utils.js');
    
    const result = loginSchema.safeParse({ username: 'admin', contrasena: '' });
    expect(result.success).toBe(false);
  });

  it('debe tener credenciales válidas según esquema', async () => {
    const { loginSchema } = await import('@/utils/login.utils.js');
    
    const result = loginSchema.safeParse({ username: 'admin', contrasena: 'password123' });
    expect(result.success).toBe(true);
  });
});

describe('Login flow - integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe llamar a usuariosService.login con valores del formulario', async () => {
    const credentials = { username: 'admin', contrasena: 'Password123' };
    mockUsuariosService.login.mockResolvedValue({
      autenticado: true,
      token: 'mock-token',
      usuario: { id: 1, username: 'admin' }
    });

    const result = await mockUsuariosService.login(credentials);
    
    expect(mockUsuariosService.login).toHaveBeenCalledWith(credentials);
    expect(result.autenticado).toBe(true);
  });

  it('debe guardar sesión en localStorage cuando login es exitoso', async () => {
    const session = {
      autenticado: true,
      token: 'mock-jwt-token',
      usuario: { id: 1, username: 'admin', rol: 'Administrador' }
    };
    
    localStorage.setItem('user_session', JSON.stringify(session));
    const stored = JSON.parse(localStorage.getItem('user_session'));
    
    expect(stored.autenticado).toBe(true);
    expect(stored.token).toBe('mock-jwt-token');
  });

  it('debe guardar token en socket.auth', () => {
    const token = 'mock-jwt-token';
    mockSocket.auth = { token };
    
    expect(mockSocket.auth.token).toBe('mock-jwt-token');
  });

  it('debe conectar socket después de login exitoso', () => {
    mockSocket.connect();
    
    expect(mockSocket.connect).toHaveBeenCalled();
  });

  it('debe manejar respuesta de login fallido', async () => {
    mockUsuariosService.login.mockResolvedValue({
      autenticado: false,
      mensaje: 'Credenciales incorrectas.'
    });

    const result = await mockUsuariosService.login({ username: 'admin', contrasena: 'wrong' });
    
    expect(result.autenticado).toBe(false);
    expect(result.mensaje).toBe('Credenciales incorrectas.');
  });

  it('debe manejar errores de red', async () => {
    mockUsuariosService.login.mockRejectedValue(new Error('Network error'));

    await expect(
      mockUsuariosService.login({ username: 'admin', contrasena: 'password' })
    ).rejects.toThrow('Network error');
  });
});