import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/repositories/incorporacionesRepositorio.js', () => ({
  default: {
    listar: vi.fn(),
    obtenerPorId: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn()
  }
}));

vi.mock('../../src/repositories/bienesRepositorio.js', () => ({
  default: {
    vincularIncorporacion: vi.fn(),
    desvincularBien: vi.fn()
  }
}));

vi.mock('../../src/repositories/gastosRepositorio.js', () => ({
  default: {
    crear: vi.fn(),
    obtenerGastosPorPresupuesto: vi.fn(),
    eliminarGastoPorIncorporacion: vi.fn()
  }
}));

vi.mock('../../src/repositories/personalRepositorio.js', () => ({
  default: {
    obtenerJefe: vi.fn(),
    obtenerSupervisor: vi.fn(),
    obtenerCoordinador: vi.fn()
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

import IncorporacionesServices from '../../src/services/incorporacionesService.js';
import IncorporacionesRepositorio from '../../src/repositories/incorporacionesRepositorio.js';
import BienesRepositorio from '../../src/repositories/bienesRepositorio.js';
import GastosRepositorio from '../../src/repositories/gastosRepositorio.js';

describe('IncorporacionesServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('debe listar todas las incorporaciones', async () => {
      const mockIncorporaciones = [
        { id: 1, orden_compra: 'OC-2024-001', proveedor: 'TechCorp' }
      ];
      IncorporacionesRepositorio.listar.mockResolvedValue(mockIncorporaciones);

      const resultado = await IncorporacionesServices.listar();

      expect(IncorporacionesRepositorio.listar).toHaveBeenCalled();
      expect(resultado).toEqual(mockIncorporaciones);
    });
  });

  describe('obtenerPorId', () => {
    it('debe obtener incorporación por ID con sus bienes', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      const mockIncorporacion = { id: 1, orden_compra: 'OC-2024-001' };
      const mockBienes = [{ id: 1, descripcion: 'Computadora', gasto: 500 }];
      
      IncorporacionesRepositorio.obtenerPorId.mockResolvedValue(mockIncorporacion);
      GastosRepositorio.obtenerGastosPorPresupuesto.mockResolvedValue(mockBienes);

      const resultado = await IncorporacionesServices.obtenerPorId(1);

      expect(resultado.id).toBe(1);
      expect(resultado.bienes).toEqual(mockBienes);
    });
  });

  describe('crear', () => {
    it('debe crear una incorporación con bienes', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      IncorporacionesRepositorio.crear.mockResolvedValue(1);
      BienesRepositorio.vincularIncorporacion.mockResolvedValue(undefined);
      GastosRepositorio.crear.mockResolvedValue(1);

      const resultado = await IncorporacionesServices.crear({
        orden_compra: 'OC-2024-001',
        proveedor: 'TechCorp',
        bienes: [{ id_bien: 1, gasto: 500, id_presupuesto: 1 }]
      });

      expect(IncorporacionesRepositorio.crear).toHaveBeenCalled();
      expect(BienesRepositorio.vincularIncorporacion).toHaveBeenCalled();
      expect(resultado).toBe(1);
    });

    it('debe omitir gasto si el monto es 0', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      IncorporacionesRepositorio.crear.mockResolvedValue(1);
      BienesRepositorio.vincularIncorporacion.mockResolvedValue(undefined);

      await IncorporacionesServices.crear({
        orden_compra: 'OC-2024-001',
        proveedor: 'TechCorp',
        bienes: [{ id_bien: 1, gasto: 0, id_presupuesto: 1 }]
      });

      expect(GastosRepositorio.crear).not.toHaveBeenCalled();
    });

    it('debe hacer rollback si hay error en la creación', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      };
      pool.connect.mockResolvedValue(mockClient);

      IncorporacionesRepositorio.crear.mockRejectedValue(new Error('DB Error'));

      await expect(IncorporacionesServices.crear({
        orden_compra: 'OC-2024-001',
        proveedor: 'TechCorp',
        bienes: []
      })).rejects.toThrow('DB Error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('actualizar', () => {
    it('debe actualizar incorporación y vincular nuevos bienes', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      IncorporacionesRepositorio.actualizar.mockResolvedValue(1);
      GastosRepositorio.eliminarGastoPorIncorporacion.mockResolvedValue(undefined);
      BienesRepositorio.desvincularBien.mockResolvedValue(undefined);
      BienesRepositorio.vincularIncorporacion.mockResolvedValue(undefined);
      GastosRepositorio.crear.mockResolvedValue(1);

      const resultado = await IncorporacionesServices.actualizar({
        id: 1,
        orden_compra: 'OC-2024-001-UPD',
        bienes: [{ id_bien: 2, gasto: 300, id_presupuesto: 1 }]
      });

      expect(IncorporacionesRepositorio.actualizar).toHaveBeenCalled();
      expect(GastosRepositorio.eliminarGastoPorIncorporacion).toHaveBeenCalled();
      expect(resultado).toBe(1);
    });
  });

  describe('eliminar', () => {
    it('debe eliminar incorporación y desvincular bienes', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      GastosRepositorio.eliminarGastoPorIncorporacion.mockResolvedValue(undefined);
      BienesRepositorio.desvincularBien.mockResolvedValue(undefined);
      IncorporacionesRepositorio.eliminar.mockResolvedValue(true);

      const resultado = await IncorporacionesServices.eliminar(1);

      expect(GastosRepositorio.eliminarGastoPorIncorporacion).toHaveBeenCalled();
      expect(BienesRepositorio.desvincularBien).toHaveBeenCalled();
      expect(resultado).toBe(true);
    });
  });

  describe('generarReporte', () => {
    it('debe generar reporte Excel con datos correctos', async () => {
      const pool = (await import('../../src/config/database.js')).default;
      pool.connect.mockResolvedValue({
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn()
      });

      const mockIncorporacion = {
        id: 1,
        orden_compra: 'OC-2024-001',
        proveedor: 'TechCorp',
        dependencia: 'Sistemas',
        nivel_profesional: 'Lic.',
        responsable: 'Juan Pérez',
        nota_entrega: '',
        factura: '',
        fecha_entrada: ''
      };
      const mockBienes = [{ descripcion: 'Computadora', marca: 'HP', modelo: 'Test', serial: 'SN123', numero: '1234' }];
      
      IncorporacionesRepositorio.obtenerPorId.mockResolvedValue(mockIncorporacion);
      GastosRepositorio.obtenerGastosPorPresupuesto.mockResolvedValue(mockBienes);
      
      const PersonalRepo = await import('../../src/repositories/personalRepositorio.js');
      PersonalRepo.default.obtenerJefe.mockResolvedValue({ nivel_profesional: 'Ing.', empleado: 'Dir' });
      PersonalRepo.default.obtenerCoordinador.mockResolvedValue({ nivel_profesional: 'Lic.', empleado: 'Coord' });
      PersonalRepo.default.obtenerSupervisor.mockResolvedValue({ nivel_profesional: 'Lic.', empleado: 'Sup' });

      const resultado = await IncorporacionesServices.generarReporte(1);

      expect(resultado).toBeInstanceOf(Buffer);
    });
  });
});