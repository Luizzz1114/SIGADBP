// Mock para bcrypt
const hashMock = jest.fn ? jest.fn() : (data, salt) => `hashed_${data}`);
const compareMock = jest.fn ? jest.fn() : (data, hash) => hash === `hashed_${data}` || hash === `hashed_respuesta_${data}`;

export const bcrypt = {
  hash: hashMock,
  compare: compareMock
};

export default { hash: hashMock, compare: compareMock };