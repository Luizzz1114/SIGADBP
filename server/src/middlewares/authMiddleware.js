import jwt from 'jsonwebtoken';
import UsuariosRepositorio from '../repositories/usuariosRepositorio.js';


// --- 1.  Middleware para Express / HTTP ---
export const verificarToken = async (req, res, next) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó token.' });
  }
    
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuarioExiste = await UsuariosRepositorio.obtenerPorId(decoded.id);
    if (!usuarioExiste) {
      return res.status(401).json({ mensaje: 'Usuario inexistente o sesión invalidada.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado.' });
  }
};


// --- 2. Middleware para Socket.io ---
export const verificarTokenSocket = async (socket, next) => {

  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("NO_TOKEN"));
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;
    const usuario = await UsuariosRepositorio.obtenerPorId(id); 

    if (!usuario) {
      return next(new Error("USER_NOT_FOUND"));
    }

    socket.user = decoded; 
    socket.join(`sala_usuario_${decoded.id}`);

    next();
  } catch (error) {
    return next(new Error("INVALID_TOKEN"));
  }
};