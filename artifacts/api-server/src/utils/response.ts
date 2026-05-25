import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string
) {
  res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date(),
  });
}

export function sendError(
  res: Response,
  error: string | Error,
  statusCode: number = 500
) {
  res.status(statusCode).json({
    success: false,
    error: typeof error === "string" ? error : error.message,
    timestamp: new Date(),
  });
}

export function sendPaginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  statusCode: number = 200
) {
  const totalPages = Math.ceil(total / limit);

  res.status(statusCode).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
    },
    timestamp: new Date(),
  });
}
