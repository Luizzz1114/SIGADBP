import api from '@/api/axios.js';

export default {

  async crear(evaluacion) {
    const res = await api.post('/evaluaciones', evaluacion);
    return res.data;
  }

}