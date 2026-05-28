import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/repositories/desincorporacionesRepositorio.js', () => ({
  default: {
    listar: vi.fn(),
    desincorporacionMetricas: vi.fn(),
    obtenerPorId: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
    crearDetalles: vi.fn(),
    eliminarDetalles: vi.fn()
  }
}));

vi.mock('../../src/repositories/bienesRepositorio.js', () => ({
  default: {
    obtenerPorIdDesincorporacion: vi.fn(),
    desvincularBienDesincorporacion: vi.fn(),
    deshacerDesincorporacion: vi.fn()
  }
}));

vi.mock('../../src/repositories/personalRepositorio.js', () => ({
  default: {
    obtenerJefe: vi.fn(),
    obtenerSupervisor: vi.fn(),
    obtenerCoordinador: vi.fn(),
    obtenerJefeDesincorporacion: vi.fn()
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
      },
      getWorksheet: vi.fn().mockReturnValue({
        duplicateRow: vi.fn(),
        getCell: vi.fn().mockReturnValue({ value: '', alignment: {}, border: {} }),
        getRow: vi.fn().mockReturnValue({ getCell: vi.fn().mockReturnValue({ value: '' }) })
      })
    }))
  }
}));

import DesincorporacionesServices from '../../src/services/desincorporacionesService.js';
import DesincorporacionesRepositorio from '../../src/repositories/desincorporacionesRepositorio.js';
import BienesRepositorio from '../../src/repositories/bienesRepositorio.js';
import PersonalRepositorio from '../../src/repositories/personalRepositorio.js';

describe('DesincorporacionesServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('debe listar todas las desincorporaciones', async () => {
      const mockDesincorporaciones = [
        { id: 1, fecha_salida: '2024-01-20', motivo: 'Obsolescencia' }
      ];
      DesincorporacionesRepositorio.listar.mockResolvedValue(mockDesincorporaciones);

      const resultado = await DesincorporacionesServices.listar();

      expect(DesincorporacionesRepositorio.listar).toHaveBeenCalled();
      expect(resultado).toEqual(mockDesincorporaciones);
    });
  });

  describe('desincorporacionMetricas', () => {
    it('debe obtener métricas de desincorporaciones', async () => {
      const mockMetricas = { total: 15, porMotivo: { Obsolescencia: 10, Daño: 5 } };
      DesincorporacionesRepositorio.desincorporacionMetricas.mockResolvedValue(mockMetricas);

      const resultado = await DesincorporacionesServices.desincorporacionMetricas();

      expect(resultado).toEqual(mockMetricas);
    });
  });

  describe('obtenerPorId', () => {
    it('debe obtener desincorporación por ID con sus bienes', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      const mockDesincorporacion = { id: 1, fecha_salida: '2024-01-20' };
      const mockBienes = [{ id: 1, numero: '1234-001', descripcion: 'Computadora' }];
      
      DesincorporacionesRepositorio.obtenerPorId.mockResolvedValue(mockDesincorporacion);
      BienesRepositorio.obtenerPorIdDesincorporacion.mockResolvedValue(mockBienes);

      const resultado = await DesincorporacionesServices.obtenerPorId(1);

      expect(resultado.id).toBe(1);
      expect(resultado.bienes).toEqual(mockBienes);
    });
  });

  describe('crear', () => {
    it('debe crear una desincorporación con bienes', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      DesincorporacionesRepositorio.crear.mockResolvedValue(1);
      BienesRepositorio.desvincularBienDesincorporacion.mockResolvedValue(undefined);
      DesincorporacionesRepositorio.crearDetalles.mockResolvedValue(undefined);

      const resultado = await DesincorporacionesServices.crear({
        fecha_salida: '2024-01-20',
        motivo: 'Obsolescencia',
        bienes: [{ id_bien: 1, tipo: 'Donación' }]
      });

      expect(DesincorporacionesRepositorio.crear).toHaveBeenCalled();
      expect(BienesRepositorio.desvincularBienDesincorporacion).toHaveBeenCalled();
      expect(resultado).toBe(1);
    });

    it('debe crear sin bienes si el array está vacío', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      DesincorporacionesRepositorio.crear.mockResolvedValue(1);

      const resultado = await DesincorporacionesServices.crear({
        fecha_salida: '2024-01-20',
        motivo: 'Obsolescencia',
        bienes: []
      });

      expect(resultado).toBe(1);
      expect(BienesRepositorio.desvincularBienDesincorporacion).not.toHaveBeenCalled();
    });

    it('debe hacer rollback si hay error en la creación', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      };
      pool.connect.mockResolvedValue(mockClient);

      DesincorporacionesRepositorio.crear.mockRejectedValue(new Error('DB Error'));

      await expect(DesincorporacionesServices.crear({
        fecha_salida: '2024-01-20',
        bienes: []
      })).rejects.toThrow('DB Error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('actualizar', () => {
    it('debe actualizar desincorporación y crear nuevos detalles', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      const mockPersonalDependencia = { dependencia: 1, personal: 1 };
      PersonalRepositorio.obtenerJefeDesincorporacion.mockResolvedValue(mockPersonalDependencia);
      BienesRepositorio.deshacerDesincorporacion.mockResolvedValue(undefined);
      DesincorporacionesRepositorio.actualizar.mockResolvedValue(1);
      DesincorporacionesRepositorio.eliminarDetalles.mockResolvedValue(undefined);
      BienesRepositorio.desvincularBienDesincorporacion.mockResolvedValue(undefined);
      DesincorporacionesRepositorio.crearDetalles.mockResolvedValue(undefined);

      const resultado = await DesincorporacionesServices.actualizar({
        id: 1,
        fecha_salida: '2024-01-25',
        bienes: [{ id_bien: 2, tipo: 'Reciclaje' }]
      });

      expect(PersonalRepositorio.obtenerJefeDesincorporacion).toHaveBeenCalled();
      expect(BienesRepositorio.deshacerDesincorporacion).toHaveBeenCalled();
      expect(resultado).toBe(1);
    });
  });

  describe('eliminar', () => {
    it('debe eliminar desincorporación y restaurar bienes', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      const mockPersonalDependencia = { dependencia: 1, personal: 1 };
      PersonalRepositorio.obtenerJefeDesincorporacion.mockResolvedValue(mockPersonalDependencia);
      BienesRepositorio.deshacerDesincorporacion.mockResolvedValue(undefined);
      DesincorporacionesRepositorio.eliminar.mockResolvedValue(true);

      const resultado = await DesincorporacionesServices.eliminar(1);

      expect(PersonalRepositorio.obtenerJefeDesincorporacion).toHaveBeenCalled();
      expect(BienesRepositorio.deshacerDesincorporacion).toHaveBeenCalled();
      expect(resultado).toEqual(mockPersonalDependencia);
    });

    it('debe hacer rollback si hay error al eliminar', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      };
      pool.connect.mockResolvedValue(mockClient);

      PersonalRepositorio.obtenerJefeDesincorporacion.mockRejectedValue(new Error('DB Error'));

      await expect(DesincorporacionesServices.eliminar(1)).rejects.toThrow('DB Error');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('generarReporte', () => {
    it('debe generar reporte Excel con datos correctos', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      const mockDesincorporacion = {
        id: 1,
        fecha_salida: '20/01/2024',
        dependencia: 'Sistemas',
        nivel_profesional: 'Lic.',
        responsable: 'Juan Pérez',
        cedula: '12345678',
        cargo: 'Analista'
      };
      const mockBienes = [{ numero: '1234-001', descripcion: 'Computadora', tipo_desincorporacion: 'Obsolescencia' }];
      
      DesincorporacionesRepositorio.obtenerPorId.mockResolvedValue(mockDesincorporacion);
      BienesRepositorio.obtenerPorIdDesincorporacion.mockResolvedValue(mockBienes);
      PersonalRepositorio.obtenerJefe.mockResolvedValue({ nivel_profesional: 'Ing.', empleado: 'Dir' });
      PersonalRepositorio.obtenerCoordinador.mockResolvedValue({ nivel_profesional: 'Lic.', empleado: 'Coord' });
      PersonalRepositorio.obtenerSupervisor.mockResolvedValue({ nivel_profesional: 'Lic.', empleado: 'Sup' });

      const resultado = await DesincorporacionesServices.generarReporte(1);

      expect(resultado).toBeInstanceOf(Buffer);
    });
  });
});