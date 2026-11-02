module.exports = (err, req, res, next) => {
  console.error('[Anex Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal Omotenashi service error occurred.'
  });
};