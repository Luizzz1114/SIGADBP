import api from '@/api/axios.js';

export default {

  async listar() {
    const res = await api.get('/bienes');
    return res.data;
  },

  async leer(id) {
    const res = await api.get(`/bienes/${id}`);
    return res.data;
  },

  async crear(bien) {
    const res = await api.post('/bienes', bien);
    return res.data;
  },

  async actualizar(bien) {
    const res = await api.put('/bienes', bien);
    return res.data;
  },

  async eliminar(id) {
    const res = await api.delete(`/bienes/${id}`);
    return res.data;
  },

  async listarNoAsignados() {
    const res = await api.get('/bienes/no-asignados');
    return res.data;
  },

  async listarOperativos() {
    const res = await api.get('/bienes/operativos');
    return res.data;
  },

  async validarNumero(numero, id = null) {
    const res = await api.post('/bienes/validar-numero', { numero, id });
    return res.data.esUnico;
  }

}