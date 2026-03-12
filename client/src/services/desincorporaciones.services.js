import api from '@/api/axios';

export default {

  async listar() {
    const res = await api.get('/desincorporaciones');
    return res.data;
  },
  
  async crear(desincorporacion) {
    const res = await api.post('/desincorporaciones', desincorporacion);
    return res.data;
  },

  async leer(id) {
    const res = await api.get(`/desincorporaciones/${id}`);
    return res.data;
  },
  
  async actualizar(desincorporacion) {
    const res = await api.put('/desincorporaciones', desincorporacion);
    return res.data;
  },

  async eliminar(id) {
    const res = await api.delete(`/desincorporaciones/${id}`);
    return res.data;
  },

}