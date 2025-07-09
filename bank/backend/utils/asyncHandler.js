const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      const statusCode = err.statusCode || 500; // Default to 500 if statusCode is not defined
      console.error("Error in asyncHandler:", err); // Log the error for debugging
      return res.status(statusCode).json({
        statusCode,
        message: err.message || "Internal Server Error", // Provide a default message
      });
    });
  };
};

export { asyncHandler };