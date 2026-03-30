import api from '@/api/axios.js';

export default {
  
  async listar() {
    const res = await api.get('/usuarios');
    return res.data;
  },

  async crear(usuario) {
    const res = await api.post('/usuarios', usuario);
    return res.data;
  },

  async obtener(id) {
    const res = await api.get(`/usuarios/${id}`);
    return res.data;
  },

  async actualizar(usuario) {
    const res = await api.put('/usuarios', usuario);
    return res.data;
  },

  async eliminar(id) {
    const res = await api.delete(`/usuarios/${id}`);
    return res.data;
  },

  async validarUsernameCorreo(username, correo, id = null) {
    const res = await api.post('/usuarios/username-correo', { username, correo, id });
    return res.data;
  },

  async login(usuario) {
    const res = await api.post('/usuarios/login', usuario);
    return res.data;
  },

  async recuperarContrasena(data) {
    const res = await api.post('/usuarios/recuperar-contrasena', data);
    return res.data;
  },

  async actualizarContrasena(usuario) {
    const res = await api.patch('/usuarios', usuario);
    return res.data;
  },

}