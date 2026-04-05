import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Demasiados intentos. Por seguridad, por favor espera 15 minutos antes de volver a intentarlo.'
  },
  standardHeaders: true, 
  legacyHeaders: false,
});