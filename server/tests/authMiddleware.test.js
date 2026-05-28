import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

const { default: mockUsuariosRepositorio } = await import('../../src/repositories/usuariosRepositorio.js');

// Reset modules before each test
beforeEach(() => {
  vi.resetModules();
});

vi.mock('../../src/repositories/usuariosRepositorio.js', () => ({
  default: {
    obtenerPorId: vi.fn()
  }
}));

import { verificarToken, verificarTokenSocket } from '../../src/middlewares/authMiddleware.js';
import UsuariosRepositorio from '../../src/repositories/usuariosRepositorio.js';

describe('AuthMiddleware - verificarToken', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockReq = { headers: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();
  });

  it('debe rechazar request sin token', async () => {
    await verificarToken(mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ 
      mensaje: 'Acceso denegado. No se proporcionó token.' 
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debe rechazar request con token expirado', async () => {
    const expiredToken = jwt.sign(
      { id: 1, username: 'test' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );
    mockReq.headers['authorization'] = `Bearer ${expiredToken}`;
    
    await verificarToken(mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ 
      mensaje: 'Token inválido o expirado.' 
    });
  });

  it('debe rechazar request con token de usuario inexistente', async () => {
    const validToken = jwt.sign(
      { id: 999, username: 'ghost' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    mockReq.headers['authorization'] = `Bearer ${validToken}`;
    UsuariosRepositorio.obtenerPorId.mockResolvedValue(null);
    
    await verificarToken(mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ 
      mensaje: 'Usuario inexistente o sesión invalidada.' 
    });
  });

  it('debe aceptar request con token válido y usuario existente', async () => {
    const validToken = jwt.sign(
      { id: 1, username: 'admin', rol: 'Administrador' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    mockReq.headers['authorization'] = `Bearer ${validToken}`;
    UsuariosRepositorio.obtenerPorId.mockResolvedValue({
      id: 1,
      username: 'admin',
      rol: 'Administrador'
    });
    
    await verificarToken(mockReq, mockRes, mockNext);
    
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.id).toBe(1);
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('AuthMiddleware - verificarTokenSocket', () => {
  let mockSocket;
  let mockNext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket = {
      handshake: { auth: {} },
      user: undefined,
      join: vi.fn()
    };
    mockNext = vi.fn();
  });

  it('debe rechazar conexión sin token', async () => {
    await verificarTokenSocket(mockSocket, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new Error('NO_TOKEN'));
  });

  it('debe rechazar conexión con token inválido', async () => {
    mockSocket.handshake.auth = { token: 'invalid-token' };
    await verificarTokenSocket(mockSocket, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new Error('INVALID_TOKEN'));
  });

  it('debe rechazar conexión si el usuario no existe', async () => {
    const validToken = jwt.sign(
      { id: 999, username: 'ghost' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    mockSocket.handshake.auth = { token: validToken };
    UsuariosRepositorio.obtenerPorId.mockResolvedValue(null);
    
    await verificarTokenSocket(mockSocket, mockNext);
    expect(mockNext).toHaveBeenCalledWith(new Error('USER_NOT_FOUND'));
  });

  it('debe aceptar conexión con token válido', async () => {
    const validToken = jwt.sign(
      { id: 1, username: 'admin', rol: 'Administrador' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    mockSocket.handshake.auth = { token: validToken };
    UsuariosRepositorio.obtenerPorId.mockResolvedValue({
      id: 1,
      username: 'admin',
      rol: 'Administrador'
    });
    
    await verificarTokenSocket(mockSocket, mockNext);
    
    expect(mockSocket.user).toBeDefined();
    expect(mockSocket.join).toHaveBeenCalledWith('sala_usuario_1');
    expect(mockNext).toHaveBeenCalledWith();
  });
});