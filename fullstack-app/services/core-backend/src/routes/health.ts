import { Router } from "express";
import { ApiError } from "../errors/ApiError";
import { prisma } from "../lib/prisma";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      service: "core-backend",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    next(
      ApiError.serviceUnavailable("Database connection is unavailable")
    );
  }
});