// Mock para jsonwebtoken
const signMock = () => 'mock_jwt_token';
const verifyMock = () => ({ id: 1, username: 'test', rol: 'Usuario' });

export const jwt = {
  sign: signMock,
  verify: verifyMock
};

export default { sign: signMock, verify: verifyMock };