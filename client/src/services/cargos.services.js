import api from '@/api/axios.js';

export default {
  
  async listar() {
    const res = await api.get('/cargos');
    return res.data;
  },

  async crear(cargo) {
    const res = await api.post('/cargos', cargo);
    return res.data;
  },

  async actualizar(cargo) {
    const res = await api.put('/cargos', cargo);
    return res.data;
  },

  async eliminar(id) {
    const res = await api.delete(`/cargos/${id}`);
    return res.data;
  },

  async validarNombre(nombre, id = null) {
    const res = await api.post('/cargos/validar-nombre', { nombre, id });
    return res.data.esUnico;
  }
  
}