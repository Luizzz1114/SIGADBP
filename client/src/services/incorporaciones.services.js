import api from '@/api/axios.js';

export default {

  async listar() {
    const res = await api.get('/incorporaciones');
    return res.data;
  },
  
  async crear(incorporacion) {
    const res = await api.post('/incorporaciones', incorporacion);
    return res.data;
  },

  async leer(id) {
    const res = await api.get(`/incorporaciones/${id}`);
    return res.data;
  },
  
  async actualizar(incorporacion) {
    const res = await api.put('/incorporaciones', incorporacion);
    return res.data;
  },

  async eliminar(id) {
    const res = await api.delete(`/incorporaciones/${id}`);
    return res.data;
  },

}