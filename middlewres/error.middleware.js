const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;
    console.log(error);

    // mongoose bad ObjectId
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`;
      error = new Error(message);
      res.status(400).json({ success: false, error });
    }

    // mongoose duplicate key
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
      error = new Error(message);
      res.status(400).json({ success: false, error });
    }

    // mongoose validation error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((value) => value.message);
      error = new Error(message);
      res.status(400).json({ success: false, error });
    }

    // send response
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || "Server Error",
    });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
