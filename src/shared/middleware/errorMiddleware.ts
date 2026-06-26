import type { NextFunction, Request, Response } from "express";

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: "Not found"
  });
}

function errorHandler(error: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = error.statusCode || error.status || 500;

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? "Internal server error" : error.message
  });
}

export { errorHandler, notFoundHandler };
