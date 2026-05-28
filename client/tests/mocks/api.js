// Mock data for testing
export const mockUsuarios = [
  { id: 1, username: 'admin', correo: 'admin@test.com', rol: 'Administrador' },
  { id: 2, username: 'user1', correo: 'user1@test.com', rol: 'Usuario' }
];

export const mockBienes = [
  { id: 1, numero: '1234-001', descripcion: 'Computadora HP', estatus: 'Operativo', categoria: 'Tecnológico' },
  { id: 2, numero: '1234-002', descripcion: 'Silla ergonómica', estatus: 'Operativo', categoria: 'Mueble' },
  { id: 3, numero: '1234-003', descripcion: 'Monitor LG', estatus: 'En mantenimiento', categoria: 'Tecnológico' }
];

export const mockLoginResponse = {
  autenticado: true,
  token: 'mock-jwt-token-123',
  mensaje: 'Inicio de sesión exitoso.',
  usuario: {
    id: 1,
    username: 'admin',
    correo: 'admin@test.com',
    rol: 'Administrador',
    encuestaRespondida: false
  }
};

export const mockSession = {
  autenticado: true,
  token: 'mock-jwt-token-123',
  usuario: {
    id: 1,
    username: 'admin',
    rol: 'Administrador',
    encuestaRespondida: false
  }
};

// Mock API functions
export const mockApi = {
  get: vi.fn().mockResolvedValue({ data: [] }),
  post: vi.fn().mockResolvedValue({ data: {} }),
  put: vi.fn().mockResolvedValue({ data: {} }),
  delete: vi.fn().mockResolvedValue({ data: {} })
};

// Mock toast for PrimeVue
export const mockToast = {
  add: vi.fn()
};

// Reset all mocks
export function resetAllMocks() {
  mockApi.get.mockReset();
  mockApi.post.mockReset();
  mockApi.put.mockReset();
  mockApi.delete.mockReset();
  mockToast.add.mockReset();
}