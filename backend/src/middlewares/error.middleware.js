module.exports = (err, req, res, next) => {
  console.error(err);
  try {
    require('fs').appendFileSync('F:/We Promote Application/Hrm Backend/backend/error_log.txt', new Date().toISOString() + ' ' + req.method + ' ' + req.url + ' -> ' + JSON.stringify({ statusCode: err.statusCode, code: err.code, message: err.message, stack: err.stack }) + '\n');
  } catch(e) {}

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};