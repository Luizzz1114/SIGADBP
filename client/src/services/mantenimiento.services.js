import api from '@/api/axios.js';

export default {

  async listar() {
    const res = await api.get('/mantenimientos');
    return res.data;
  },

  async crear(mantenimiento) {
    const res = await api.post('/mantenimientos', mantenimiento);
    return res.data;
  },

  async leer(id) {
    const res = await api.get(`/mantenimientos/${id}`);
    return res.data;
  },

  async actualizar(mantenimiento) {
    const res = await api.put('/mantenimientos', mantenimiento);
    return res.data;
  },

  async eliminar(id) {
    const res = await api.delete(`/mantenimientos/${id}`);
    return res.data;
  }

}