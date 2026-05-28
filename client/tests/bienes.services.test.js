import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockBienes } from './mocks/api.js';

vi.mock('@/api/axios.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

import bienesService from '@/services/bienes.services.js';

describe('bienes.services.js', () => {
  let mockAxiosInstance;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    const axios = await import('@/api/axios.js');
    mockAxiosInstance = axios.default;
  });

  describe('listar()', () => {
    it('debe hacer GET /bienes y retornar los bienes', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockBienes });
      
      const result = await bienesService.listar();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bienes');
      expect(result).toEqual(mockBienes);
    });

    it('debe retornar array vacío si no hay bienes', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });
      
      const result = await bienesService.listar();
      
      expect(result).toEqual([]);
    });
  });

  describe('obtener()', () => {
    it('debe hacer GET /bienes/:id y retornar el bien', async () => {
      const mockBien = mockBienes[0];
      mockAxiosInstance.get.mockResolvedValue({ data: mockBien });
      
      const result = await bienesService.obtener(1);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bienes/1');
      expect(result).toEqual(mockBien);
    });
  });

  describe('crear()', () => {
    it('debe hacer POST /bienes con datos del bien', async () => {
      const newBien = {
        numero: '1234-004',
        descripcion: 'Impresora HP',
        marca: 'HP',
        modelo: 'LaserJet',
        categoria: 'Tecnológico'
      };
      mockAxiosInstance.post.mockResolvedValue({ data: { message: 'Bien creado.' } });
      
      await bienesService.crear(newBien);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/bienes', newBien);
    });
  });

  describe('actualizar()', () => {
    it('debe hacer PUT /bienes con datos actualizados', async () => {
      const updatedBien = { id: 1, numero: '1234-001', descripcion: 'Computadora HP actualizada' };
      mockAxiosInstance.put.mockResolvedValue({ data: { message: 'Bien actualizado.' } });
      
      await bienesService.actualizar(updatedBien);
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/bienes', updatedBien);
    });
  });

  describe('eliminar()', () => {
    it('debe hacer DELETE /bienes/:id', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: { message: 'Bien eliminado.' } });
      
      await bienesService.eliminar(1);
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/bienes/1');
    });
  });

  describe('listarOperativos()', () => {
    it('debe hacer GET /bienes/operativos', async () => {
      const operativos = mockBienes.filter(b => b.estatus === 'Operativo');
      mockAxiosInstance.get.mockResolvedValue({ data: operativos });
      
      const result = await bienesService.listarOperativos();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bienes/operativos');
      expect(result).toEqual(operativos);
    });
  });

  describe('listarNoAsignados()', () => {
    it('debe hacer GET /bienes/no-asignados', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });
      
      await bienesService.listarNoAsignados();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bienes/no-asignados');
    });
  });

  describe('validarNumero()', () => {
    it('deba hacer POST /bienes/validar-numero y retornar esUnico', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { esUnico: true } });
      
      const result = await bienesService.validarNumero('1234-999');
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/bienes/validar-numero', {
        numero: '1234-999',
        id: null
      });
      expect(result).toBe(true);
    });

    it('deba retornar false si el número ya existe', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { esUnico: false } });
      
      const result = await bienesService.validarNumero('1234-001');
      
      expect(result).toBe(false);
    });

    it('debe incluir id para edición', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { esUnico: true } });
      
      await bienesService.validarNumero('1234-001', 1);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/bienes/validar-numero', {
        numero: '1234-001',
        id: 1
      });
    });
  });

  describe('generarReporte()', () => {
    it('debe hacer GET /bienes/reporte/:idDependencia con responseType blob', async () => {
      const mockBlob = new ArrayBuffer();
      mockAxiosInstance.get.mockResolvedValue({ data: mockBlob });
      
      const result = await bienesService.generarReporte(1);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bienes/reporte/1', {
        responseType: 'blob'
      });
      expect(result).toEqual(mockBlob);
    });
  });
});