// module.exports = (err, req, res, next) => {
//   console.error(err);

//   res.status(err.statusCode || 500).json({
//     success: false,
//     code: err.code || "SERVER_ERROR",
//     message: err.message || "Internal Server Error"
//   });
// };

module.exports = (err, req, res, next) => {
  console.error(err);

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