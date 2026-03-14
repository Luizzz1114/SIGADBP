import api from '@/api/axios.js';

export default {

  async listar() {
    const res = await api.get('/movimientos');
    return res.data;
  },

  async crear(movimiento) {
    const res = await api.post('/movimientos', movimiento);
    return res.data;
  },

  async obtener(id) {
    const res = await api.get(`/movimientos/${id}`);
    return res.data;
  },

  async actualizar(movimiento) {
    const res = await api.put('/movimientos', movimiento);
    return res.data;
  },

  async eliminar(id) {
    const res = await api.delete(`/movimientos/${id}`);
    return res.data;
  }

}