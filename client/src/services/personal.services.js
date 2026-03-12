import api from '@/api/axios.js';

export default {

  async listar() {
    const res = await api.get('/personal');
    return res.data;
  },

  async crear(personal){
    const res = await api.post('/personal', personal);
    return res.data;
  },

  async leer(id) {
    const res = await api.get(`/personal/${id}`);
    return res.data;
  },

  async actualizar(personal) {
    const res = await api.put(`/personal`, personal);
    return res.data;
  },

  async eliminar(id) {
    const res = await api.delete(`/personal/${id}`);
    return res.data;
  },

  async validarCedula(cedula, id = null) {
    const res = await api.post('/personal/validar-cedula', { cedula, id });
    return res.data.esUnica;
  },

  async listarSinUsuario() {
    const res = await api.get('/personal/sin-usuario');
    return res.data;
  }
  
}