import api from '@/api/axios.js';

export default {
  
  async listarEstados() {
    const res = await api.get('/ubicacion/estados');
    return res.data;
  },

  async listarMunicipios(idEstado) {
    const res = await api.get(`/ubicacion/estados/${idEstado}/municipios`);
    return res.data;
  },

  async listarParroquias(idMunicipio) {
    const res = await api.get(`/ubicacion/municipios/${idMunicipio}/parroquias`);
    return res.data;
  }
  
}