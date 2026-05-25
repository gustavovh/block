import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err);

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    timestamp: new Date(),
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: "Route not found",
    timestamp: new Date(),
  });
}
