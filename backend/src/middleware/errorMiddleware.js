const { Prisma } = require("@prisma/client");

/**
 * 404 Not Found handler
 * Creates an error for routes that don't exist
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler middleware
 * Handles all errors in the application and sends appropriate responses
 * Provides detailed error information in development, minimal info in production
 */
const errorHandler = (err, req, res, next) => {
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({
      status: "fail",
      message: "CORS policy blocked this origin",
    });
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    err.statusCode = 400;
    err.message = "Invalid data provided";
  }

  // Handle Prisma unique constraint violations
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      err.statusCode = 400;
      err.message = `${field} already exists`;
    }
    // Handle record not found
    if (err.code === "P2025") {
      err.statusCode = 404;
      err.message = "Record not found";
    }
  }

  // Handle Prisma foreign key constraint violations
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2003") {
      err.statusCode = 400;
      err.message = "Invalid reference: related record does not exist";
    }
  }

  const isProd = process.env.NODE_ENV === "production";

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: isProd && err.statusCode >= 500 ? "Internal server error" : err.message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };