/**
 * Tests TDD para DesincorporacionesService - Metodología XP
 * 
 * Ciclo TDD:
 * 1. Escribir test que falla (RED)
 * 2. Implementar código mínimo para pasar (GREEN)
 * 3. Refactorizar (REFACTOR)
 * 
 * Funcionalidades primordiales probadas:
 * - crear: Registro de nuevas desincorporaciones con bienes
 * - listar: Obtención de lista de desincorporaciones
 * - obtenerPorId: Obtención de desincorporación por ID
 * - actualizar: Modificación de desincorporación existente
 * - eliminar: Eliminación de desincorporación
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks de los repositorios
const mockDesincorporacionesRepositorio = {
  listar: vi.fn(),
  desincorporacionMetricas: vi.fn(),
  obtenerPorId: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  eliminar: vi.fn(),
  crearDetalles: vi.fn(),
  eliminarDetalles: vi.fn()
};

const mockBienesRepositorio = {
  obtenerPorIdDesincorporacion: vi.fn(),
  desvincularBienDesincorporacion: vi.fn(),
  deshacerDesincorporacion: vi.fn()
};

const mockPersonalRepositorio = {
  obtenerJefe: vi.fn(),
  obtenerCoordinador: vi.fn(),
  obtenerSupervisor: vi.fn(),
  obtenerJefeDesincorporacion: vi.fn()
};

// Mock del pool de base de datos
const mockClient = {
  query: vi.fn().mockResolvedValue({ rows: [] }),
  release: vi.fn()
};

const mockPool = {
  query: vi.fn(),
  connect: vi.fn().mockResolvedValue(mockClient)
};

vi.mock('@/config/database.js', () => ({
  default: mockPool
}));

vi.mock('@/repositories/desincorporacionesRepositorio.js', () => ({
  default: mockDesincorporacionesRepositorio
}));

vi.mock('@/repositories/bienesRepositorio.js', () => ({
  default: mockBienesRepositorio
}));

vi.mock('@/repositories/personalRepositorio.js', () => ({
  default: mockPersonalRepositorio
}));

// Mock de exceljs
vi.mock('exceljs', () => ({
  default: {
    Workbook: vi.fn().mockImplementation(() => ({
      xlsx: {
        readFile: vi.fn().mockResolvedValue(undefined),
        writeBuffer: vi.fn().mockResolvedValue(Buffer.from('mock buffer'))
      },
      getWorksheet: vi.fn().mockReturnValue({
        duplicateRow: vi.fn(),
        getCell: vi.fn().mockReturnValue({
          value: undefined,
          border: {},
          alignment: {}
        }),
        getRow: vi.fn().mockReturnValue({
          getCell: vi.fn().mockReturnValue({
            value: undefined,
            border: {},
            alignment: {}
          })
        })
      })
    }))
  },
  Workbook: vi.fn().mockImplementation(() => ({
    xlsx: {
      readFile: vi.fn().mockResolvedValue(undefined),
      writeBuffer: vi.fn().mockResolvedValue(Buffer.from('mock buffer'))
    },
    getWorksheet: vi.fn().mockReturnValue({
      duplicateRow: vi.fn(),
      getCell: vi.fn().mockReturnValue({
        value: undefined,
        border: {},
        alignment: {}
      }),
      getRow: vi.fn().mockReturnValue({
        getCell: vi.fn().mockReturnValue({
          value: undefined,
          border: {},
          alignment: {}
        })
      })
    })
  }))
}));

// Importar el servicio DESPUÉS de configurar los mocks
const { default: DesincorporacionesServices } = await import('@/services/desincorporacionesService.js');

describe('DesincorporacionesServices - TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listar', () => {
    // TEST 1: Listar todas las desincorporaciones - RED
    it('debe retornar una lista de desincorporaciones', async () => {
      const desincorporacionesMock = [
        { id: 1, fecha_salida: '2024-01-15', tipo: 'Obsolescencia', estado: 'Completada' },
        { id: 2, fecha_salida: '2024-02-20', tipo: 'Daño', estado: 'Pendiente' }
      ];
      
      mockDesincorporacionesRepositorio.listar.mockResolvedValue(desincorporacionesMock);
      
      const resultado = await DesincorporacionesServices.listar();

      expect(resultado).toHaveLength(2);
      expect(resultado[0].tipo).toBe('Obsolescencia');
    });

    // TEST 2: Lista vacía - RED
    it('debe retornar una lista vacía cuando no hay desincorporaciones', async () => {
      mockDesincorporacionesRepositorio.listar.mockResolvedValue([]);
      
      const resultado = await DesincorporacionesServices.listar();

      expect(resultado).toHaveLength(0);
    });
  });

  describe('desincorporacionMetricas', () => {
    // TEST 3: Obtener métricas de desincorporaciones - RED
    it('debe retornar métricas de desincorporaciones', async () => {
      const metricasMock = {
        total: 50,
        por_tipo: {
          obsolescencia: 30,
          dano: 15,
          robo: 5
        },
        valor_total: 250000
      };
      
      mockDesincorporacionesRepositorio.desincorporacionMetricas.mockResolvedValue(metricasMock);
      
      const resultado = await DesincorporacionesServices.desincorporacionMetricas();

      expect(resultado).toEqual(metricasMock);
      expect(resultado.total).toBe(50);
    });
  });

  describe('obtenerPorId', () => {
    // TEST 4: Obtener desincorporación por ID con bienes - RED
    it('debe retornar la desincorporación con sus bienes asociados', async () => {
      const desincorporacionMock = {
        id: 1,
        fecha_salida: '2024-01-15',
        tipo: 'Obsolescencia',
        dependencia: 'Dirección de TI',
        responsable: 'Juan Pérez',
        cedula: 'V12345678'
      };
      
      const bienesMock = [
        { id_bien: 1, numero: 'B-001', descripcion: 'Computadora antigua', tipo_desincorporacion: 'Obsolescencia' },
        { id_bien: 2, numero: 'B-002', descripcion: 'Monitor viejo', tipo_desincorporacion: 'Obsolescencia' }
      ];
      
      mockDesincorporacionesRepositorio.obtenerPorId.mockResolvedValue(desincorporacionMock);
      mockBienesRepositorio.obtenerPorIdDesincorporacion.mockResolvedValue(bienesMock);
      
      const resultado = await DesincorporacionesServices.obtenerPorId(1);

      expect(resultado.id).toBe(1);
      expect(resultado.bienes).toHaveLength(2);
      expect(resultado.bienes[0].descripcion).toBe('Computadora antigua');
    });

    // TEST 5: Desincorporación sin bienes - RED
    it('debe retornar la desincorporación con array de bienes vacío', async () => {
      const desincorporacionMock = {
        id: 2,
        fecha_salida: '2024-02-01',
        tipo: 'Daño'
      };
      
      mockDesincorporacionesRepositorio.obtenerPorId.mockResolvedValue(desincorporacionMock);
      mockBienesRepositorio.obtenerPorIdDesincorporacion.mockResolvedValue([]);
      
      const resultado = await DesincorporacionesServices.obtenerPorId(2);

      expect(resultado.id).toBe(2);
      expect(resultado.bienes).toHaveLength(0);
    });
  });

  describe('crear', () => {
    // TEST 6: Crear desincorporación sin bienes - RED
    it('debe crear una desincorporación sin bienes y retornar el ID', async () => {
      mockDesincorporacionesRepositorio.crear.mockResolvedValue(1);
      
      const payload = {
        fecha_salida: '2024-03-15',
        tipo: 'Obsolescencia',
        dependencia: 1,
        responsable: 1,
        bienes: []
      };

      const resultado = await DesincorporacionesServices.crear(payload);

      expect(resultado).toBe(1);
      expect(mockDesincorporacionesRepositorio.crear).toHaveBeenCalledTimes(1);
    });

    // TEST 7: Crear desincorporación con bienes - RED
    it('debe crear una desincorporación con bienes y desvincularlos', async () => {
      mockDesincorporacionesRepositorio.crear.mockResolvedValue(2);
      mockBienesRepositorio.desvincularBienDesincorporacion.mockResolvedValue(true);
      mockDesincorporacionesRepositorio.crearDetalles.mockResolvedValue(true);
      
      const payload = {
        fecha_salida: '2024-03-20',
        tipo: 'Daño',
        dependencia: 1,
        responsable: 1,
        bienes: [
          { id_bien: 10, tipo: 'Daño' },
          { id_bien: 11, tipo: 'Daño' }
        ]
      };

      const resultado = await DesincorporacionesServices.crear(payload);

      expect(resultado).toBe(2);
      expect(mockBienesRepositorio.desvincularBienDesincorporacion).toHaveBeenCalledTimes(2);
      expect(mockDesincorporacionesRepositorio.crearDetalles).toHaveBeenCalledTimes(2);
    });

    // TEST 8: Crear desincorporación con diferentes tipos - RED
    it('debe crear una desincorporación con bienes de diferentes tipos', async () => {
      mockDesincorporacionesRepositorio.crear.mockResolvedValue(3);
      mockBienesRepositorio.desvincularBienDesincorporacion.mockResolvedValue(true);
      mockDesincorporacionesRepositorio.crearDetalles.mockResolvedValue(true);
      
      const payload = {
        fecha_salida: '2024-03-25',
        tipo: 'Obsolescencia',
        dependencia: 1,
        responsable: 1,
        bienes: [
          { id_bien: 20, tipo: 'Obsolescencia' },
          { id_bien: 21, tipo: 'Daño' },
          { id_bien: 22, tipo: 'Robo' }
        ]
      };

      const resultado = await DesincorporacionesServices.crear(payload);

      expect(resultado).toBe(3);
      expect(mockBienesRepositorio.desvincularBienDesincorporacion).toHaveBeenCalledTimes(3);
    });
  });

  describe('actualizar', () => {
    // TEST 9: Actualizar desincorporación existente - RED
    it('debe actualizar una desincorporación y manejar sus bienes', async () => {
      const personalDependenciaMock = { dependencia: 1, personal: 1 };
      
      mockPersonalRepositorio.obtenerJefeDesincorporacion.mockResolvedValue(personalDependenciaMock);
      mockBienesRepositorio.deshacerDesincorporacion.mockResolvedValue(true);
      mockDesincorporacionesRepositorio.actualizar.mockResolvedValue(1);
      mockDesincorporacionesRepositorio.eliminarDetalles.mockResolvedValue(true);
      mockBienesRepositorio.desvincularBienDesincorporacion.mockResolvedValue(true);
      mockDesincorporacionesRepositorio.crearDetalles.mockResolvedValue(true);
      
      const payload = {
        id: 1,
        fecha_salida: '2024-04-01',
        tipo: 'Obsolescencia',
        bienes: [
          { id_bien: 100, tipo: 'Obsolescencia' }
        ]
      };

      const resultado = await DesincorporacionesServices.actualizar(payload);

      expect(resultado).toBe(1);
      expect(mockBienesRepositorio.deshacerDesincorporacion).toHaveBeenCalledWith(mockClient, 1, personalDependenciaMock);
      expect(mockDesincorporacionesRepositorio.eliminarDetalles).toHaveBeenCalledWith(mockClient, 1);
    });

    // TEST 10: Actualizar desincorporación eliminando todos los bienes - RED
    it('debe actualizar una desincorporación eliminando todos sus bienes', async () => {
      const personalDependenciaMock = { dependencia: 1, personal: 1 };
      
      mockPersonalRepositorio.obtenerJefeDesincorporacion.mockResolvedValue(personalDependenciaMock);
      mockBienesRepositorio.deshacerDesincorporacion.mockResolvedValue(true);
      mockDesincorporacionesRepositorio.actualizar.mockResolvedValue(2);
      mockDesincorporacionesRepositorio.eliminarDetalles.mockResolvedValue(true);
      
      const payload = {
        id: 2,
        fecha_salida: '2024-04-05',
        tipo: 'Daño',
        bienes: []
      };

      const resultado = await DesincorporacionesServices.actualizar(payload);

      expect(resultado).toBe(2);
      expect(mockBienesRepositorio.desvincularBienDesincorporacion).not.toHaveBeenCalled();
    });
  });

  describe('eliminar', () => {
    // TEST 11: Eliminar desincorporación - RED
    it('debe eliminar una desincorporación y deshacer la desincorporación de sus bienes', async () => {
      const personalDependenciaMock = { dependencia: 1, personal: 1 };
      
      mockPersonalRepositorio.obtenerJefeDesincorporacion.mockResolvedValue(personalDependenciaMock);
      mockBienesRepositorio.deshacerDesincorporacion.mockResolvedValue(true);
      mockDesincorporacionesRepositorio.eliminar.mockResolvedValue(true);
      
      const resultado = await DesincorporacionesServices.eliminar(1);

      expect(resultado).toEqual(personalDependenciaMock);
      expect(mockBienesRepositorio.deshacerDesincorporacion).toHaveBeenCalledWith(mockClient, 1, personalDependenciaMock);
      expect(mockDesincorporacionesRepositorio.eliminar).toHaveBeenCalledWith(mockClient, 1);
    });
  });
});