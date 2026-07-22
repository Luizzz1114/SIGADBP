import api from '@/api/axios';

export default {

  // --- DASHBOARD ---

  async obtenerMetricas() {
    try {
      const res = await api.get('/bienes/metricas/resumen');
      return res.data;
    } catch(error) {
      console.log(error);
      throw error;
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


  // --- PRESUPUESTOS ---
  async presupuestosResumen() {
    try {
      const res = await api.get('/presupuestos/metricas/resumen');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },


  // --- EVALUACIONES ---
  async evaluacionesResumen() {
    try {
      const res = await api.get('/evaluaciones/metricas');
      return res.data;
    } catch(error) {
      console.log(error);
      throw error;
    }
  },


  // --- BIENES SIN NUMERO ---
  async sinNumeroResumen(hasta = null) {
    try {
      const res = await api.get('/bienes/metricas/no-identificados', { params: hasta ? { hasta } : {} });
      return res.data;
    } catch(error) {
      console.log(error);
      throw error;
    }
  },


  async disponibilidadDependencia(hasta = null) {
    try {
      const res = await api.get('/bienes/metricas/disponibilidad-dependencia', { params: hasta ? { hasta } : {} });
      return res.data;
    } catch(error) {
      console.log(error);
      throw error;
    }
  },


  // --- DESINCORPORACIONES ---
  async desincorporacionesResumen() {
    try {
      const res = await api.get('/desincorporaciones/metricas');
      return res.data;
    } catch(error) {
      console.log(error);
      throw error;
    }
  },


  // --- KPIs ---
  async obtenerKPI(siglas, hasta = null) {
    try {
      const params = { siglas };
      if (hasta) params.hasta = hasta;
      const res = await api.get('/metricas', { params });
      return res.data;
    } catch(error) {
      console.log(error);
      throw error;
    }
  },

}