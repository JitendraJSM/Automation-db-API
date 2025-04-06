const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => {
      // Log error for debugging
      console.error('Error:', err);

      // Send appropriate error response
      res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });
  };
};

module.exports = catchAsync;