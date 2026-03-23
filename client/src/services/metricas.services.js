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
      return [];
    }
  },


  // --- BIENES SIN NUMERO ---
  async sinNumeroResumen() {
    try {
      const res = await api.get('/bienes/metricas/no-identificados');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },


  // --- DESINCORPORACIONES ---
  async desincorporacionesResumen() {
    try {
      const res = await api.get('/desincorporaciones/metricas');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },


  // --- KPIs ---
  async obtenerKPI(siglas) {
    try {
      const res = await api.get(`/metricas?siglas=${siglas}`);
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },

}