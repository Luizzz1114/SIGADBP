import { useToast } from 'primevue/usetoast';

export function useNotificaciones() {
  const toast = useToast();

  const showSuccess = (mensaje = 'Operación realizada correctamente') => {
    toast.add({ 
      severity: 'success', 
      summary: 'Operación exitosa', 
      detail: mensaje, 
      life: 5000 
    });
  };

  const showError = (mensaje = 'Ha ocurrido un error') => {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: mensaje, 
      life: 5000 
    });
  };

  return {
    showSuccess,
    showError
  };
}