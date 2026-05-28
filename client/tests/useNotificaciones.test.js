import { describe, it, expect, vi } from 'vitest';

// Mock PrimeVue toast
const mockToast = {
  add: vi.fn()
};

vi.mock('primevue/usetoast', () => ({
  useToast: () => mockToast
}));

import { useNotificaciones } from '@/utils/useNotificaciones.js';

describe('useNotificaciones.js', () => {
  beforeEach(() => {
    mockToast.add.mockClear();
  });

  describe('showSuccess', () => {
    it('debe llamar a toast.add con severity success', () => {
      const { showSuccess } = useNotificaciones();
      showSuccess('Operación completada');
      
      expect(mockToast.add).toHaveBeenCalledTimes(1);
      expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'success',
        summary: 'Operación exitosa'
      }));
    });

    it('debe usar mensaje predeterminado si no se proporciona', () => {
      const { showSuccess } = useNotificaciones();
      showSuccess();
      
      expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
        detail: 'Operación realizada correctamente'
      }));
    });

    it('debe usar mensaje personalizado si se proporciona', () => {
      const { showSuccess } = useNotificaciones();
      showSuccess('Usuario creado exitosamente');
      
      expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
        detail: 'Usuario creado exitosamente'
      }));
    });

    it('debe establecer life en 5000ms', () => {
      const { showSuccess } = useNotificaciones();
      showSuccess();
      
      expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
        life: 5000
      }));
    });
  });

  describe('showError', () => {
    it('debe llamar a toast.add con severity error', () => {
      const { showError } = useNotificaciones();
      showError('Error de conexión');
      
      expect(mockToast.add).toHaveBeenCalledTimes(1);
      expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        summary: 'Error'
      }));
    });

    it('debe usar mensaje predeterminado si no se proporciona', () => {
      const { showError } = useNotificaciones();
      showError();
      
      expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
        detail: 'Ha ocurrido un error'
      }));
    });

    it('debe usar mensaje personalizado si se proporciona', () => {
      const { showError } = useNotificaciones();
      showError('No se pudo eliminar el usuario');
      
      expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
        detail: 'No se pudo eliminar el usuario'
      }));
    });
  });

  describe('showWarning', () => {
    it('debe llamar a toast.add con severity warn', () => {
      const { showWarning } = useNotificaciones();
      showWarning('Verifique los datos');
      
      expect(mockToast.add).toHaveBeenCalledTimes(1);
      expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'warn',
        summary: 'Advertencia'
      }));
    });

    it('debe usar mensaje predeterminado si no se proporciona', () => {
      const { showWarning } = useNotificaciones();
      showWarning();
      
      expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
        detail: 'Ha ocurrido un error'
      }));
    });

    it('debe usar mensaje personalizado si se proporciona', () => {
      const { showWarning } = useNotificaciones();
      showWarning('Límite de rate exceeded');
      
      expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
        detail: 'Límite de rate exceeded'
      }));
    });
  });

  describe('returned API', () => {
    it('debe retornar las tres funciones de notificación', () => {
      const { showSuccess, showError, showWarning } = useNotificaciones();
      
      expect(typeof showSuccess).toBe('function');
      expect(typeof showError).toBe('function');
      expect(typeof showWarning).toBe('function');
    });
  });
});