import api from '@/api/axios';

export default {

  // --- DASHBOARD ---

  async obtenerMetricas() {
    try {
      const res = await api.get('/bienes/metricas/resumen');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },

  async bienesPorEstatus() {
    try {
      const res = await api.get('/bienes/metricas/estatus');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },

  async bienesPorCategoria() {
    try {
      const res = await api.get('/bienes/metricas/categorias');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },

  async bienesPorDependencia() {
    try {
      const res = await api.get('/bienes/metricas/dependencias');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },




  // --- KPIs ---
  async obtenerIBEO() {
    try {
      const res = await api.get('/metricas?siglas=IBEO');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },

  async obtenerICMI() {
    try {
      const res = await api.get('/metricas?siglas=ICMI');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },



  // --- PRESUPUESTOS ---
  async presupuestosResumen() {
    try {
      const res = await api.get('/presupuestos/metricas/resumen');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  }

}