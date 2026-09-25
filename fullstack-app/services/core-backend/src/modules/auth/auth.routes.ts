import { Router } from "express";
import { ApiError } from "../../errors/ApiError";
import { prisma } from "../../lib/prisma";
import { asyncHandler } from "../../middleware/async-handler";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  issueTokenPair,
  loginUser,
  publicUser,
  registerUser,
  revokeRefreshSession,
  rotateRefreshSession,
} from "./auth.service";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas";

export const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);
    const meta = { userAgent: req.headers["user-agent"], ip: req.ip };
    const pair = await issueTokenPair(user, meta);
    res.status(201).json({ success: true, data: { user: publicUser(user), ...pair } });
  })
);

authRouter.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await loginUser(req.body);
    const meta = { userAgent: req.headers["user-agent"], ip: req.ip };
    const pair = await issueTokenPair(user, meta);
    res.json({ success: true, data: { user: publicUser(user), ...pair } });
  })
);

authRouter.post(
  "/refresh",
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    const meta = { userAgent: req.headers["user-agent"], ip: req.ip };
    const pair = await rotateRefreshSession(req.body.refreshToken, meta);
    res.json({ success: true, data: pair });
  })
);

authRouter.post(
  "/logout",
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    await revokeRefreshSession(req.body.refreshToken);
    res.json({ success: true, data: null });
  })
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
    res.json({ success: true, data: publicUser(user) });
  })
);