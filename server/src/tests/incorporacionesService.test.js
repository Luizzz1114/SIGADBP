/**
 * Tests TDD para IncorporacionesService - Metodología XP
 * 
 * Ciclo TDD:
 * 1. Escribir test que falla (RED)
 * 2. Implementar código mínimo para pasar (GREEN)
 * 3. Refactorizar (REFACTOR)
 * 
 * Funcionalidades primordiales probadas:
 * - crear: Registro de nuevas incorporaciones con bienes
 * - listar: Obtención de lista de incorporaciones
 * - obtenerPorId: Obtención de incorporación por ID
 * - actualizar: Modificación de incorporación existente
 * - eliminar: Eliminación de incorporación
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks de los repositorios
const mockIncorporacionesRepositorio = {
  listar: vi.fn(),
  obtenerPorId: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  eliminar: vi.fn()
};

const mockBienesRepositorio = {
  vincularIncorporacion: vi.fn(),
  desvincularBien: vi.fn()
};

const mockGastosRepositorio = {
  obtenerGastosPorPresupuesto: vi.fn(),
  crear: vi.fn(),
  eliminarGastoPorIncorporacion: vi.fn()
};

const mockPersonalRepositorio = {
  obtenerJefe: vi.fn(),
  obtenerCoordinador: vi.fn(),
  obtenerSupervisor: vi.fn()
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

vi.mock('@/repositories/incorporacionesRepositorio.js', () => ({
  default: mockIncorporacionesRepositorio
}));

vi.mock('@/repositories/bienesRepositorio.js', () => ({
  default: mockBienesRepositorio
}));

vi.mock('@/repositories/gastosRepositorio.js', () => ({
  default: mockGastosRepositorio
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
const { default: IncorporacionesServices } = await import('@/services/incorporacionesService.js');

describe('IncorporacionesServices - TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listar', () => {
    // TEST 1: Listar todas las incorporaciones - RED
    it('debe retornar una lista de incorporaciones', async () => {
      const incorporacionesMock = [
        { id: 1, orden_compra: 'OC-001', proveedor: 'Empresa A', estado: 'Completada' },
        { id: 2, orden_compra: 'OC-002', proveedor: 'Empresa B', estado: 'Pendiente' }
      ];
      
      mockIncorporacionesRepositorio.listar.mockResolvedValue(incorporacionesMock);
      
      const resultado = await IncorporacionesServices.listar();

      expect(resultado).toHaveLength(2);
      expect(resultado[0].orden_compra).toBe('OC-001');
    });

    // TEST 2: Lista vacía - RED
    it('debe retornar una lista vacía cuando no hay incorporaciones', async () => {
      mockIncorporacionesRepositorio.listar.mockResolvedValue([]);
      
      const resultado = await IncorporacionesServices.listar();

      expect(resultado).toHaveLength(0);
    });
  });

  describe('obtenerPorId', () => {
    // TEST 3: Obtener incorporación por ID con bienes - RED
    it('debe retornar la incorporación con sus bienes asociados', async () => {
      const incorporacionMock = {
        id: 1,
        orden_compra: 'OC-001',
        proveedor: 'Empresa A',
        dependencia: 'Dirección de TI',
        responsable: 'Juan Pérez'
      };
      
      const bienesMock = [
        { id_bien: 1, descripcion: 'Computadora', gasto: 1000 },
        { id_bien: 2, descripcion: 'Monitor', gasto: 500 }
      ];
      
      mockIncorporacionesRepositorio.obtenerPorId.mockResolvedValue(incorporacionMock);
      mockGastosRepositorio.obtenerGastosPorPresupuesto.mockResolvedValue(bienesMock);
      
      const resultado = await IncorporacionesServices.obtenerPorId(1);

      expect(resultado.id).toBe(1);
      expect(resultado.bienes).toHaveLength(2);
      expect(resultado.bienes[0].descripcion).toBe('Computadora');
    });

    // TEST 4: Incorporación sin bienes - RED
    it('debe retornar la incorporación con array de bienes vacío', async () => {
      const incorporacionMock = {
        id: 2,
        orden_compra: 'OC-002',
        proveedor: 'Empresa B'
      };
      
      mockIncorporacionesRepositorio.obtenerPorId.mockResolvedValue(incorporacionMock);
      mockGastosRepositorio.obtenerGastosPorPresupuesto.mockResolvedValue([]);
      
      const resultado = await IncorporacionesServices.obtenerPorId(2);

      expect(resultado.id).toBe(2);
      expect(resultado.bienes).toHaveLength(0);
    });
  });

  describe('crear', () => {
    // TEST 5: Crear incorporación sin bienes - RED
    it('debe crear una incorporación sin bienes y retornar el ID', async () => {
      mockIncorporacionesRepositorio.crear.mockResolvedValue(1);
      
      const payload = {
        orden_compra: 'OC-NUEVA',
        proveedor: 'Nuevo Proveedor',
        fecha_entrada: '2024-01-15',
        dependencia: 1,
        responsable: 1,
        bienes: []
      };

      const resultado = await IncorporacionesServices.crear(payload);

      expect(resultado).toBe(1);
      expect(mockIncorporacionesRepositorio.crear).toHaveBeenCalledTimes(1);
    });

    // TEST 6: Crear incorporación con bienes - RED
    it('debe crear una incorporación con bienes y vincularlos', async () => {
      mockIncorporacionesRepositorio.crear.mockResolvedValue(2);
      mockBienesRepositorio.vincularIncorporacion.mockResolvedValue(true);
      
      const payload = {
        orden_compra: 'OC-CON-BIENES',
        proveedor: 'Proveedor Bienes',
        fecha_entrada: '2024-01-20',
        dependencia: 1,
        responsable: 1,
        bienes: [
          { id_bien: 10, gasto: 1500, id_presupuesto: 1 },
          { id_bien: 11, gasto: 2000, id_presupuesto: 1 }
        ]
      };

      const resultado = await IncorporacionesServices.crear(payload);

      expect(resultado).toBe(2);
      expect(mockBienesRepositorio.vincularIncorporacion).toHaveBeenCalledTimes(2);
    });

    // TEST 7: Crear incorporación con bienes sin gasto - RED
    it('debe crear una incorporación con bienes sin gasto (gasto=0)', async () => {
      mockIncorporacionesRepositorio.crear.mockResolvedValue(3);
      mockBienesRepositorio.vincularIncorporacion.mockResolvedValue(true);
      
      const payload = {
        orden_compra: 'OC-SIN-GASTO',
        proveedor: 'Proveedor C',
        fecha_entrada: '2024-01-25',
        dependencia: 1,
        responsable: 1,
        bienes: [
          { id_bien: 20, gasto: 0, id_presupuesto: null }
        ]
      };

      const resultado = await IncorporacionesServices.crear(payload);

      expect(resultado).toBe(3);
      expect(mockBienesRepositorio.vincularIncorporacion).toHaveBeenCalledTimes(1);
      expect(mockGastosRepositorio.crear).not.toHaveBeenCalled();
    });
  });

  describe('actualizar', () => {
    // TEST 8: Actualizar incorporación existente - RED
    it('debe actualizar una incorporación y desvincular bienes anteriores', async () => {
      mockIncorporacionesRepositorio.actualizar.mockResolvedValue(1);
      mockGastosRepositorio.eliminarGastoPorIncorporacion.mockResolvedValue(true);
      mockBienesRepositorio.desvincularBien.mockResolvedValue(true);
      mockBienesRepositorio.vincularIncorporacion.mockResolvedValue(true);
      
      const payload = {
        id: 1,
        orden_compra: 'OC-UPDATED',
        proveedor: 'Nuevo Proveedor',
        fecha_entrada: '2024-02-01',
        dependencia: 1,
        responsable: 1,
        bienes: [
          { id_bien: 100, gasto: 3000, id_presupuesto: 2 }
        ]
      };

      const resultado = await IncorporacionesServices.actualizar(payload);

      expect(resultado).toBe(1);
      expect(mockGastosRepositorio.eliminarGastoPorIncorporacion).toHaveBeenCalledWith(mockClient, 1);
      expect(mockBienesRepositorio.desvincularBien).toHaveBeenCalledWith(mockClient, 1);
    });

    // TEST 9: Actualizar incorporación eliminando todos los bienes - RED
    it('debe actualizar una incorporación eliminando todos sus bienes', async () => {
      mockIncorporacionesRepositorio.actualizar.mockResolvedValue(2);
      mockGastosRepositorio.eliminarGastoPorIncorporacion.mockResolvedValue(true);
      mockBienesRepositorio.desvincularBien.mockResolvedValue(true);
      
      const payload = {
        id: 2,
        orden_compra: 'OC-NUEVA',
        proveedor: 'Proveedor',
        bienes: []
      };

      const resultado = await IncorporacionesServices.actualizar(payload);

      expect(resultado).toBe(2);
      expect(mockBienesRepositorio.vincularIncorporacion).not.toHaveBeenCalled();
    });
  });

  describe('eliminar', () => {
    // TEST 10: Eliminar incorporación - RED
    it('debe eliminar una incorporación y desvincular sus bienes', async () => {
      mockGastosRepositorio.eliminarGastoPorIncorporacion.mockResolvedValue(true);
      mockBienesRepositorio.desvincularBien.mockResolvedValue(true);
      mockIncorporacionesRepositorio.eliminar.mockResolvedValue(true);
      
      const resultado = await IncorporacionesServices.eliminar(1);

      expect(resultado).toBe(true);
      expect(mockGastosRepositorio.eliminarGastoPorIncorporacion).toHaveBeenCalledWith(mockClient, 1);
      expect(mockBienesRepositorio.desvincularBien).toHaveBeenCalledWith(mockClient, 1);
      expect(mockIncorporacionesRepositorio.eliminar).toHaveBeenCalledWith(mockClient, 1);
    });
  });
});