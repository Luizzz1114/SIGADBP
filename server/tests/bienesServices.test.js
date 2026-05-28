import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/repositories/bienesRepositorio.js', () => ({
  default: {
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
    metricaDisponibilidadPorDependencia: vi.fn()
  }
}));

vi.mock('../../src/repositories/mueblesRepositorio.js', () => ({
  default: {
    crear: vi.fn(),
    actualizar: vi.fn()
  }
}));

vi.mock('../../src/repositories/tecnologicosRepositorio.js', () => ({
  default: {
    crear: vi.fn(),
    actualizar: vi.fn()
  }
}));

vi.mock('../../src/repositories/vehiculosRepositorio.js', () => ({
  default: {
    crear: vi.fn(),
    actualizar: vi.fn()
  }
}));

vi.mock('../../src/repositories/personalRepositorio.js', () => ({
  default: {
    responsableDependencia: vi.fn(),
    obtenerJefe: vi.fn(),
    obtenerSupervisor: vi.fn()
  }
}));

vi.mock('../../src/config/database.js', () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn().mockResolvedValue({
      query: vi.fn().mockResolvedValue({ rows: [] }),
      release: vi.fn()
    })
  }
}));

vi.mock('exceljs', () => ({
  default: {
    Workbook: vi.fn().mockImplementation(() => ({
      xlsx: {
        readFile: vi.fn().mockResolvedValue(undefined),
        writeBuffer: vi.fn().mockResolvedValue(Buffer.from('mock'))
      }
    }))
  }
}));

import BienesServices from '../../src/services/bienesServices.js';
import BienesRepositorio from '../../src/repositories/bienesRepositorio.js';
import MueblesRepositorio from '../../src/repositories/mueblesRepositorio.js';
import TecnologicosRepositorio from '../../src/repositories/tecnologicosRepositorio.js';
import VehiculosRepositorio from '../../src/repositories/vehiculosRepositorio.js';

describe('BienesServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('debe listar todos los bienes', async () => {
      const mockBienes = [
        { id: 1, numero: '1234-001', estatus: 'Operativo' },
        { id: 2, numero: '1234-002', estatus: 'En mantenimiento' }
      ];
      BienesRepositorio.listar.mockResolvedValue(mockBienes);

      const resultado = await BienesServices.listar();

      expect(BienesRepositorio.listar).toHaveBeenCalled();
      expect(resultado).toEqual(mockBienes);
    });

    it('debe retornar array vacío si no hay bienes', async () => {
      BienesRepositorio.listar.mockResolvedValue([]);

      const resultado = await BienesServices.listar();

      expect(resultado).toEqual([]);
    });
  });

  describe('listarOperativos', () => {
    it('debe listar solo bienes operativos', async () => {
      const mockBienes = [
        { id: 1, estatus: 'Operativo' },
        { id: 2, estatus: 'Operativo' }
      ];
      BienesRepositorio.listarOperativos.mockResolvedValue(mockBienes);

      const resultado = await BienesServices.listarOperativos();

      expect(BienesRepositorio.listarOperativos).toHaveBeenCalled();
      expect(resultado.length).toBe(2);
    });
  });

  describe('validarNumeroBienUnico', () => {
    it('debe retornar true si el número de bien ya existe', async () => {
      BienesRepositorio.validarNumeroBienUnico.mockResolvedValue(1);

      const resultado = await BienesServices.validarNumeroBienUnico({ numero: '1234-001' });

      expect(resultado).toBe(true);
    });

    it('debe retornar false si el número de bien es único', async () => {
      BienesRepositorio.validarNumeroBienUnico.mockResolvedValue(0);

      const resultado = await BienesServices.validarNumeroBienUnico({ numero: '1234-001' });

      expect(resultado).toBe(false);
    });
  });

  describe('crear', () => {
    it('debe crear un bien mueble correctamente', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      BienesRepositorio.crear.mockResolvedValue(1);
      MueblesRepositorio.crear.mockResolvedValue(undefined);

      const resultado = await BienesServices.crear({
        numero: '1234-001',
        descripcion: 'Silla ergonómica',
        marca: 'OfficePro',
        modelo: 'EP-100',
        categoria: 'Mueble'
      });

      expect(BienesRepositorio.crear).toHaveBeenCalled();
      expect(MueblesRepositorio.crear).toHaveBeenCalled();
      expect(resultado).toBe(1);
    });

    it('debe crear un bien tecnológico correctamente', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      BienesRepositorio.crear.mockResolvedValue(2);
      TecnologicosRepositorio.crear.mockResolvedValue(undefined);

      const resultado = await BienesServices.crear({
        numero: '1234-002',
        descripcion: 'Monitor LG',
        marca: 'LG',
        modelo: '24MK400',
        categoria: 'Tecnológico'
      });

      expect(TecnologicosRepositorio.crear).toHaveBeenCalled();
    });

    it('debe lanzar error si la categoría es inválida', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      BienesRepositorio.crear.mockResolvedValue(1);

      await expect(BienesServices.crear({
        numero: '1234-001',
        descripcion: 'Test',
        marca: 'Test',
        modelo: 'Test',
        categoria: 'CategoriaInvalida'
      })).rejects.toThrow('Categoría de bien no válida');
    });

    it('debe hacer rollback en caso de error', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      };
      pool.connect.mockResolvedValue(mockClient);

      BienesRepositorio.crear.mockRejectedValue(new Error('DB Error'));

      await expect(BienesServices.crear({
        numero: '1234-001',
        descripcion: 'Test',
        marca: 'Test',
        modelo: 'Test',
        categoria: 'Mueble'
      })).rejects.toThrow('DB Error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('actualizar', () => {
    it('debe actualizar un bien mueble correctamente', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      BienesRepositorio.actualizar.mockResolvedValue(true);
      MueblesRepositorio.actualizar.mockResolvedValue(undefined);

      const resultado = await BienesServices.actualizar({
        id: 1,
        numero: '1234-001',
        descripcion: 'Silla actualizada',
        marca: 'OfficePro',
        modelo: 'EP-200',
        categoria: 'Mueble'
      });

      expect(BienesRepositorio.actualizar).toHaveBeenCalled();
      expect(MueblesRepositorio.actualizar).toHaveBeenCalled();
      expect(resultado).toBe(true);
    });
  });

  describe('eliminar', () => {
    it('debe eliminar un bien correctamente', async () => {
      BienesRepositorio.eliminar.mockResolvedValue(true);

      const resultado = await BienesServices.eliminar(1);

      expect(BienesRepositorio.eliminar).toHaveBeenCalledWith(1);
      expect(resultado).toBe(true);
    });
  });

  describe('métricas', () => {
    it('debe obtener métricas por categoría', async () => {
      const mockMetricas = { Mueble: 50, 'Tecnológico': 30 };
      BienesRepositorio.obtenerMetricasPorCategoria.mockResolvedValue(mockMetricas);

      const resultado = await BienesServices.obtenerMetricasPorCategoria();

      expect(resultado).toEqual(mockMetricas);
    });

    it('debe obtener métricas por estatus', async () => {
      const mockMetricas = { Operativo: 60, 'En mantenimiento': 10 };
      BienesRepositorio.obtenerMetricasPorEstatus.mockResolvedValue(mockMetricas);

      const resultado = await BienesServices.obtenerMetricasPorEstatus();

      expect(resultado).toEqual(mockMetricas);
    });

    it('debe obtener resumen de métricas generales', async () => {
      const mockResumen = { total: 90, operativos: 60 };
      BienesRepositorio.obtenerResumenMetricas.mockResolvedValue(mockResumen);

      const resultado = await BienesServices.obtenerResumenMetricas();

      expect(resultado).toEqual(mockResumen);
    });
  });
});