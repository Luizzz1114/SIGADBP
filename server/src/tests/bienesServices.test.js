/**
 * Tests TDD para BienesServices - Metodología XP
 * 
 * Ciclo TDD:
 * 1. Escribir test que falla (RED)
 * 2. Implementar código mínimo para pasar (GREEN)
 * 3. Refactorizar (REFACTOR)
 * 
 * Funcionalidades primordiales probadas:
 * - crear: Registro de nuevos bienes
 * - validarNumeroBienUnico: Validación de número único
 * - listar: Obtención de lista de bienes
 * - obtenerPorId: Obtención de bien por ID
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks de los repositorios
const mockBienesRepositorio = {
  listar: vi.fn(),
  listarOperativos: vi.fn(),
  listarNoAsignados: vi.fn(),
  bienesNoIdentificados: vi.fn(),
  validarNumeroBienUnico: vi.fn(),
  obtenerPorId: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  eliminar: vi.fn(),
  obtenerMetricasPorCategoria: vi.fn(),
  obtenerMetricasPorEstatus: vi.fn(),
  obtenerResumenMetricas: vi.fn(),
  obtenerMetricasPorDependencia: vi.fn(),
  metricaDisponibilidadPorDependencia: vi.fn(),
  listarPorDependencia: vi.fn(),
  vincularIncorporacion: vi.fn(),
  desvincularBien: vi.fn(),
  desvincularBienDesincorporacion: vi.fn(),
  deshacerDesincorporacion: vi.fn()
};

const mockMueblesRepositorio = {
  crear: vi.fn(),
  actualizar: vi.fn()
};

const mockTecnologicosRepositorio = {
  crear: vi.fn(),
  actualizar: vi.fn()
};

const mockVehiculosRepositorio = {
  crear: vi.fn(),
  actualizar: vi.fn()
};

const mockPersonalRepositorio = {
  responsableDependencia: vi.fn(),
  obtenerJefe: vi.fn(),
  obtenerSupervisor: vi.fn()
};

// Mock del pool de base de datos
const mockClient = {
  query: vi.fn(),
  release: vi.fn()
};

const mockPool = {
  query: vi.fn(),
  connect: vi.fn().mockResolvedValue(mockClient)
};

vi.mock('@/config/database.js', () => ({
  default: mockPool
}));

vi.mock('@/repositories/bienesRepositorio.js', () => ({
  default: mockBienesRepositorio
}));

vi.mock('@/repositories/mueblesRepositorio.js', () => ({
  default: mockMueblesRepositorio
}));

vi.mock('@/repositories/tecnologicosRepositorio.js', () => ({
  default: mockTecnologicosRepositorio
}));

vi.mock('@/repositories/vehiculosRepositorio.js', () => ({
  default: mockVehiculosRepositorio
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
const { default: BienesServices } = await import('@/services/bienesServices.js');

describe('BienesServices - TDD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listar', () => {
    // TEST 1: Listar todos los bienes - RED
    it('debe retornar una lista de bienes', async () => {
      const bienesMock = [
        { id: 1, numero: 'B-001', descripcion: 'Escritorio', estatus: 'Operativo' },
        { id: 2, numero: 'B-002', descripcion: 'Computadora', estatus: 'Operativo' },
        { id: 3, numero: 'B-003', descripcion: 'Silla', estatus: 'En mantenimiento' }
      ];
      
      mockBienesRepositorio.listar.mockResolvedValue(bienesMock);
      
      const resultado = await BienesServices.listar();

      expect(resultado).toHaveLength(3);
      expect(resultado[0].numero).toBe('B-001');
      expect(resultado[0].estatus).toBe('Operativo');
    });

    // TEST 2: Lista vacía - RED
    it('debe retornar una lista vacía cuando no hay bienes', async () => {
      mockBienesRepositorio.listar.mockResolvedValue([]);
      
      const resultado = await BienesServices.listar();

      expect(resultado).toHaveLength(0);
    });
  });

  describe('listarOperativos', () => {
    // TEST 3: Listar bienes operativos - RED
    it('debe retornar solo bienes con estatus Operativo', async () => {
      const bienesOperativosMock = [
        { id: 1, numero: 'B-001', descripcion: 'Escritorio', estatus: 'Operativo' },
        { id: 2, numero: 'B-002', descripcion: 'Computadora', estatus: 'Operativo' }
      ];
      
      mockBienesRepositorio.listarOperativos.mockResolvedValue(bienesOperativosMock);
      
      const resultado = await BienesServices.listarOperativos();

      expect(resultado).toHaveLength(2);
      resultado.forEach(bien => {
        expect(bien.estatus).toBe('Operativo');
      });
    });
  });

  describe('listarNoAsignados', () => {
    // TEST 4: Listar bienes no asignados - RED
    it('debe retornar solo bienes con estatus No asignado', async () => {
      const bienesNoAsignadosMock = [
        { id: 3, numero: 'B-003', descripcion: 'Silla', estatus: 'No asignado' }
      ];
      
      mockBienesRepositorio.listarNoAsignados.mockResolvedValue(bienesNoAsignadosMock);
      
      const resultado = await BienesServices.listarNoAsignados();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].estatus).toBe('No asignado');
    });
  });

  describe('validarNumeroBienUnico', () => {
    // TEST 5: Número de bien único - RED
    it('debe retornar false cuando el número de bien no existe', async () => {
      mockBienesRepositorio.validarNumeroBienUnico.mockResolvedValue(0);
      
      const resultado = await BienesServices.validarNumeroBienUnico({
        numero: 'B-NUEVO'
      });

      expect(resultado).toBe(false);
    });

    // TEST 6: Número de bien duplicado - RED
    it('debe retornar true cuando el número de bien ya existe', async () => {
      mockBienesRepositorio.validarNumeroBienUnico.mockResolvedValue(1);
      
      const resultado = await BienesServices.validarNumeroBienUnico({
        numero: 'B-001'
      });

      expect(resultado).toBe(true);
    });

    // TEST 7: Caso especial S/N - RED
    it('debe retornar false para número S/N (sin número)', async () => {
      mockBienesRepositorio.validarNumeroBienUnico.mockResolvedValue(0);
      
      const resultado = await BienesServices.validarNumeroBienUnico({
        numero: 'S/N'
      });

      expect(resultado).toBe(false);
    });
  });

  describe('obtenerPorId', () => {
    // TEST 8: Obtener bien por ID - RED
    it('debe retornar los datos del bien cuando existe', async () => {
      const bienMock = {
        id: 1,
        numero: 'B-001',
        descripcion: 'Escritorio',
        marca: 'OficinaPro',
        modelo: 'EP-2000',
        categoria: 'Mueble',
        estatus: 'Operativo'
      };
      
      mockBienesRepositorio.obtenerPorId.mockResolvedValue(bienMock);
      
      const resultado = await BienesServices.obtenerPorId(1);

      expect(resultado).toEqual(bienMock);
      expect(resultado.numero).toBe('B-001');
      expect(resultado.categoria).toBe('Mueble');
    });

    // TEST 9: Bien inexistente - RED
    it('debe retornar null cuando el bien no existe', async () => {
      mockBienesRepositorio.obtenerPorId.mockResolvedValue(null);
      
      const resultado = await BienesServices.obtenerPorId(999);

      expect(resultado).toBeNull();
    });
  });

  describe('crear', () => {
    // TEST 10: Crear bien tipo Mueble - RED
    it('debe crear un bien mueble y retornar el ID', async () => {
      mockBienesRepositorio.crear.mockResolvedValue(1);
      mockMueblesRepositorio.crear.mockResolvedValue(true);
      
      const nuevoBien = {
        numero: 'B-NUEVO',
        descripcion: 'Escritorio ejecutivo',
        marca: 'OficinaPro',
        modelo: 'EP-3000',
        categoria: 'Mueble'
      };

      const resultado = await BienesServices.crear(nuevoBien);

      expect(resultado).toBe(1);
      expect(mockBienesRepositorio.crear).toHaveBeenCalledTimes(1);
      expect(mockMueblesRepositorio.crear).toHaveBeenCalledTimes(1);
    });

    // TEST 11: Crear bien tipo Tecnológico - RED
    it('debe crear un bien tecnológico y retornar el ID', async () => {
      mockBienesRepositorio.crear.mockResolvedValue(2);
      mockTecnologicosRepositorio.crear.mockResolvedValue(true);
      
      const nuevoBien = {
        numero: 'B-TECH-001',
        descripcion: 'Laptop Dell',
        marca: 'Dell',
        modelo: ' XPS 15',
        categoria: 'Tecnológico'
      };

      const resultado = await BienesServices.crear(nuevoBien);

      expect(resultado).toBe(2);
      expect(mockTecnologicosRepositorio.crear).toHaveBeenCalledTimes(1);
    });

    // TEST 12: Crear bien tipo Vehículo - RED
    it('debe crear un bien vehículo y retornar el ID', async () => {
      mockBienesRepositorio.crear.mockResolvedValue(3);
      mockVehiculosRepositorio.crear.mockResolvedValue(true);
      
      const nuevoBien = {
        numero: 'B-VEH-001',
        descripcion: 'Camioneta Toyota',
        marca: 'Toyota',
        modelo: 'Hilux',
        categoria: 'Vehículo o Equipo de Elevación'
      };

      const resultado = await BienesServices.crear(nuevoBien);

      expect(resultado).toBe(3);
      expect(mockVehiculosRepositorio.crear).toHaveBeenCalledTimes(1);
    });

    // TEST 13: Categoría inválida - RED
    it('debe lanzar error cuando la categoría no es válida', async () => {
      const nuevoBien = {
        numero: 'B-INVALIDO',
        descripcion: 'Bien inválido',
        marca: 'Marca',
        modelo: 'Modelo',
        categoria: 'CategoríaInvalida'
      };

      await expect(BienesServices.crear(nuevoBien)).rejects.toThrow('Categoría de bien no válida');
    });
  });

  describe('actualizar', () => {
    // TEST 14: Actualizar bien existente - RED
    it('debe actualizar un bien y retornar true', async () => {
      mockBienesRepositorio.actualizar.mockResolvedValue(true);
      mockMueblesRepositorio.actualizar.mockResolvedValue(true);
      
      const bienActualizado = {
        id: 1,
        numero: 'B-001-UPD',
        descripcion: 'Escritorio actualizado',
        marca: 'NuevaMarca',
        modelo: 'NuevoModelo',
        categoria: 'Mueble'
      };

      const resultado = await BienesServices.actualizar(bienActualizado);

      expect(resultado).toBe(true);
      expect(mockBienesRepositorio.actualizar).toHaveBeenCalledTimes(1);
      expect(mockMueblesRepositorio.actualizar).toHaveBeenCalledTimes(1);
    });
  });

  describe('eliminar', () => {
    // TEST 15: Eliminar bien - RED
    it('debe eliminar un bien y retornar true', async () => {
      mockBienesRepositorio.eliminar.mockResolvedValue(true);
      
      const resultado = await BienesServices.eliminar(1);

      expect(resultado).toBe(true);
      expect(mockBienesRepositorio.eliminar).toHaveBeenCalledWith(1);
    });
  });

  describe('métricas', () => {
    // TEST 16: Obtener métricas por categoría - RED
    it('debe retornar métricas agrupadas por categoría', async () => {
      const metricasMock = {
        muebles: 50,
        tecnologicos: 30,
        vehiculos: 10
      };
      
      mockBienesRepositorio.obtenerMetricasPorCategoria.mockResolvedValue(metricasMock);
      
      const resultado = await BienesServices.obtenerMetricasPorCategoria();

      expect(resultado).toEqual(metricasMock);
      expect(resultado.muebles).toBe(50);
    });

    // TEST 17: Obtener métricas por estatus - RED
    it('debe retornar métricas agrupadas por estatus', async () => {
      const metricasMock = {
        operativos: 70,
        en_mantenimiento: 10,
        no_asignados: 5,
        desincorporados: 5
      };
      
      mockBienesRepositorio.obtenerMetricasPorEstatus.mockResolvedValue(metricasMock);
      
      const resultado = await BienesServices.obtenerMetricasPorEstatus();

      expect(resultado).toEqual(metricasMock);
      expect(resultado.operativos).toBe(70);
    });

    // TEST 18: Obtener resumen de métricas - RED
    it('debe retornar un resumen general de métricas', async () => {
      const resumenMock = {
        total_bienes: 90,
        total_valor: 5000000,
        disponibilidad: 77.78
      };
      
      mockBienesRepositorio.obtenerResumenMetricas.mockResolvedValue(resumenMock);
      
      const resultado = await BienesServices.obtenerResumenMetricas();

      expect(resultado).toEqual(resumenMock);
      expect(resultado.total_bienes).toBe(90);
    });
  });

  describe('bienesNoIdentificados', () => {
    // TEST 19: Bienes sin número de bien - RED
    it('debe retornar bienes sin número de identificación', async () => {
      const bienesNoIdentificadosMock = {
        count: 5,
        bienes: [
          { id: 1, descripcion: 'Objeto 1', serial: 'ABC123' },
          { id: 2, descripcion: 'Objeto 2', serial: 'DEF456' }
        ]
      };
      
      mockBienesRepositorio.bienesNoIdentificados.mockResolvedValue(bienesNoIdentificadosMock);
      
      const resultado = await BienesServices.bienesNoIdentificados();

      expect(resultado).toEqual(bienesNoIdentificadosMock);
    });
  });
});