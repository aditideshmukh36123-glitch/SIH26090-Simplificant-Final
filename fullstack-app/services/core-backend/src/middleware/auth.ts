import type { Role } from "@prisma/client";
import type { RequestHandler } from "express";
import { ApiError } from "../errors/ApiError";
import { verifyAccessToken } from "../modules/auth/auth.service";

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    next(ApiError.unauthorized("Missing Bearer token"));
    return;
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden("Insufficient permissions for this role"));
      return;
    }
    next();
  };
}