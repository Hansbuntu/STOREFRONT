import { NextFunction, Request, Response } from "express";

// Basic centralized error handler; extend as needed.
// Never log raw PII; truncate or hash where necessary.
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // eslint-disable-next-line no-console
  console.error("Error:", {
    message: err.message,
    // Do not include IPs or sensitive payloads
    code: err.code,
  });

  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || "Internal server error",
    },
  });
}


