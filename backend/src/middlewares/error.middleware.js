export function errorMiddleware(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  console.error(err);

  if (err?.name === 'MulterError') {
    return res.status(400).json({ message: err.message || 'File upload error' });
  }

  return res.status(500).json({
    message: isProd ? 'Internal server error' : err.message || 'Internal server error'
  });
}
