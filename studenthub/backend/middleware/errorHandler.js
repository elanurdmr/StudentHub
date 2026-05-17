export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) { super(message, 400, 'VALIDATION_ERROR'); }
}
export class NotFoundError extends AppError {
  constructor(resource = 'Kaynak') { super(`${resource} bulunamadı`, 404, 'NOT_FOUND'); }
}
export class UnauthorizedError extends AppError {
  constructor(msg = 'Yetkisiz erişim') { super(msg, 401, 'UNAUTHORIZED'); }
}
export class ForbiddenError extends AppError {
  constructor() { super('Bu işlem için yetkiniz yok', 403, 'FORBIDDEN'); }
}

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function globalErrorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages[0], code: 'VALIDATION_ERROR', details: messages });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `Bu ${field} zaten kayıtlı`, code: 'DUPLICATE_KEY' });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Geçersiz token', code: 'INVALID_TOKEN' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token süresi dolmuş', code: 'TOKEN_EXPIRED' });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }
  console.error('UNEXPECTED ERROR:', err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    error: isDev ? err.message : 'Sunucu hatası. Lütfen tekrar deneyin.',
    code: 'INTERNAL_ERROR',
    ...(isDev && { stack: err.stack }),
  });
}
