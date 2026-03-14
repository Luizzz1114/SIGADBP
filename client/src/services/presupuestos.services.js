import api from '@/api/axios.js';
import axios from 'axios';

export default {

  async listar() {
    const res = await api.get('/presupuestos');
    return res.data;
  },

  async crear(presupuesto) {
    const res = await api.post('/presupuestos', presupuesto);
    return res.data;
  },

  async obtener(id) {
    const res = await api.get(`/presupuestos/${id}`);
    return res.data;
  },

  async actualizar(presupuesto) {
    const res = await api.put('/presupuestos', presupuesto);
    return res.data;
  },

  async eliminar(id) {
    const res = await api.delete(`/presupuestos/${id}`);
    return res.data;
  },

  async listarActivos() {
    const res = await api.get('/presupuestos/activos');
    return res.data;
  },

  async listarActivosMantenimiento() {
    const res = await api.get('/presupuestos/activos-mantenimiento');
    return res.data;
  },

  async validarCodigo(codigo, id = null) {
    const res = await api.post('/presupuestos/validar-codigo', { codigo, id });
    return res.data.existe;
  },

  async obtenerDolarOficial() {
    const res = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial');
    return res.data;
  },

}