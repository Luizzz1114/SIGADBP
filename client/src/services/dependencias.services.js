import api from '@/api/axios.js';

export default {
  
  async listar() {
    const res = await api.get('/dependencias');
    return res.data;
  },

  async crear(dependencia) {
    const res = await api.post('/dependencias', dependencia);
    return res.data;
  },
  
  async leer(id) {
    const res = await api.get(`/dependencias/${id}`);
    return res.data;
  },

  async actualizar(dependencia) {
    const res = await api.put('/dependencias', dependencia);
    return res.data;
  },

  async eliminar(id) {
    const res = await api.delete(`/dependencias/${id}`);
    return res.data;
  },

  async validarNombre(nombre, id = null) {
    const res = await api.post('/dependencias/validar-nombre', { nombre, id });
    return res.data.esUnica;
  },


  async listarDependenciasResponsables() {
    const res = await api.get('/dependencias/responsables');
    return res.data;
  }

}