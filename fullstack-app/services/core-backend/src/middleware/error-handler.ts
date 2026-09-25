import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "../errors/ApiError";
import { env } from "../env";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const payload: ErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  };

  let statusCode = 500;

  if (err instanceof ZodError) {
    statusCode = 400;
    payload.error.code = "VALIDATION_ERROR";
    payload.error.message = "Request validation failed";
    payload.error.details = err.flatten();
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    payload.error.code = err.code;
    payload.error.message = err.message;
    if (err.details !== undefined) {
      payload.error.details = err.details;
    }
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = mapPrismaKnownError(err);
    payload.error.code = err.code;
    payload.error.message = describePrismaKnownError(err);
    if (statusCode === 500 && env.NODE_ENV !== "production") {
      payload.error.details = err.meta;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    payload.error.code = "DATABASE_VALIDATION_ERROR";
    payload.error.message = "Request conflicts with the data model";
  } else if (err instanceof Error && env.NODE_ENV !== "production") {
    payload.error.message = err.message;
  }

  res.status(statusCode).json(payload);
}

function describePrismaKnownError(err: Prisma.PrismaClientKnownRequestError): string {
  switch (err.code) {
    case "P2002":
      return "Conflict: a record with the same unique value already exists";
    case "P2025":
      return "The requested record could not be found";
    case "P2003":
      return "Referenced record does not exist";
    default:
      return "Database operation failed";
  }
}

function mapPrismaKnownError(err: Prisma.PrismaClientKnownRequestError): number {
  switch (err.code) {
    case "P2002":
      return 409;
    case "P2025":
      return 404;
    case "P2003":
      return 400;
    default:
      return 500;
  }
}