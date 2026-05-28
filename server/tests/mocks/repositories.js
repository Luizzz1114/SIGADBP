export const mockUsuariosData = {
  id: 1,
  username: 'admin',
  correo: 'admin@test.com',
  rol: 'Administrador',
  contrasena: '$2b$10$hashedpassword',
  cedula: '12345678',
  id_personal: 1
};

export const mockUsuariosRepo = {
  listar: vi.fn().mockResolvedValue([mockUsuariosData]),
  obtenerPorId: vi.fn().mockResolvedValue(mockUsuariosData),
  iniciarSesion: vi.fn().mockResolvedValue(mockUsuariosData),
  validarUsernameCorreo: vi.fn().mockResolvedValue({ username_exists: false, correo_exists: false }),
  crear: vi.fn().mockResolvedValue(true),
  actualizar: vi.fn().mockResolvedValue(true),
  eliminar: vi.fn().mockResolvedValue(true),
  cambiarContrasena: vi.fn().mockResolvedValue(true),
  contarAdministradores: vi.fn().mockResolvedValue({ total_admin: '2', rol: 'Administrador' })
};

export const mockBienesData = {
  id: 1,
  numero: '1234-001',
  descripcion: 'Computadora HP',
  marca: 'HP',
  modelo: 'ProDesk 400',
  serial: 'SN123456',
  estatus: 'Operativo',
  categoria: 'Tecnológico',
  dependencia: 'Sistemas',
  numero_bien: '1234-001'
};

export const mockBienesRepo = {
  listar: vi.fn().mockResolvedValue([mockBienesData]),
  obtenerPorId: vi.fn().mockResolvedValue(mockBienesData),
  listarOperativos: vi.fn().mockResolvedValue([mockBienesData]),
  listarNoAsignados: vi.fn().mockResolvedValue([mockBienesData]),
  crear: vi.fn().mockResolvedValue(1),
  actualizar: vi.fn().mockResolvedValue(true),
  eliminar: vi.fn().mockResolvedValue(true),
  validarNumeroBienUnico: vi.fn().mockResolvedValue(0),
  listarPorDependencia: vi.fn().mockResolvedValue([mockBienesData]),
  vincularIncorporacion: vi.fn().mockResolvedValue(undefined),
  desvincularBien: vi.fn().mockResolvedValue(undefined)
};

export const mockPersonalRepo = {
  obtenerJefe: vi.fn().mockResolvedValue({ nivel_profesional: 'Ing.', empleado: 'Director General' }),
  obtenerSupervisor: vi.fn().mockResolvedValue({ nivel_profesional: 'Lic.', empleado: 'Supervisor' }),
  obtenerCoordinador: vi.fn().mockResolvedValue({ nivel_profesional: 'Lic.', empleado: 'Coordinador' }),
  responsableDependencia: vi.fn().mockResolvedValue({
    dependencia: 'Sistemas',
    responsable: 'Juan Pérez',
    nivel_profesional: 'Lic.',
    cedula: '12345678',
    cargo: 'Analista',
    direccion: 'Dirección Central'
  })
};

export const mockGastosRepo = {
  crear: vi.fn().mockResolvedValue(1),
  obtenerGastosPorPresupuesto: vi.fn().mockResolvedValue([{ id: 1, monto: 1000, fecha: '2024-01-15' }]),
  eliminarGastoPorIncorporacion: vi.fn().mockResolvedValue(undefined),
  eliminarGastoPorMantenimiento: vi.fn().mockResolvedValue(undefined)
};