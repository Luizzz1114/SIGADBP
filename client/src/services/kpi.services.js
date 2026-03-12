import api from '@/api/axios';

export default {
  async IBEO() {
    try {
      const res = await api.get('/bienes/resumen-estatus');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },

  async categoriasBienes() {
    try {
      const res = await api.get('/bienes/bienes-categoria');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },

  async bienesPorDep() {
    try {
      const res = await api.get('/bienes/dependencia-categoria');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },

  async obtenerInfoPaneles() {
    try {
      const res = await api.get('/bienes/paneles');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  },

  async presupuesto() {
    try {
      const res = await api.get('/presupuestos/kpi-presupuesto');
      return res.data;
    } catch(error) {
      console.log(error);
      return [];
    }
  }

}