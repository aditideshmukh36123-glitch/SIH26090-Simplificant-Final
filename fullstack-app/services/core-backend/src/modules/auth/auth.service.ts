import type { Role, User } from "@prisma/client";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import ms from "ms";
import { env } from "../../env";
import { ApiError } from "../../errors/ApiError";
import { prisma } from "../../lib/prisma";
import { hashPassword, verifyPassword } from "../../utils/crypto";
import { hashToken } from "../../utils/ids";
import type { LoginInput, RegisterInput } from "./auth.schemas";

const ACCESS_SECRET = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = env.JWT_REFRESH_SECRET;
const ISSUER = "sih26090-core";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export interface RefreshTokenPayload extends AccessTokenPayload {
  type: "refresh";
}

export interface SessionMeta {
  userAgent?: string;
  ip?: string;
}

function tokenExpiryMs(duration: string): number {
  const value = ms(duration as ms.StringValue);
  if (value === undefined) {
    throw new Error(`Invalid JWT duration: ${duration}`);
  }
  return value;
}

export function signAccessToken(user: { id: string; role: Role }): string {
  return jwt.sign(
    { sub: user.id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions["expiresIn"], issuer: ISSUER } satisfies SignOptions
  );
}

export function signRefreshToken(user: { id: string; role: Role }): string {
  return jwt.sign(
    { sub: user.id, role: user.role, type: "refresh" },
    REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions["expiresIn"], issuer: ISSUER } satisfies SignOptions
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, ACCESS_SECRET, { issuer: ISSUER });
    if (typeof payload === "string" || !isTokenPayload(payload)) {
      throw new Error("Unexpected token shape");
    }
    return { sub: payload.sub, role: payload.role };
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }
}

function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET, { issuer: ISSUER });
    if (
      typeof payload === "string" ||
      payload.type !== "refresh" ||
      !isTokenPayload(payload)
    ) {
      throw new Error("Unexpected token shape");
    }
    return { sub: payload.sub, role: payload.role, type: "refresh" };
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }
}

function isTokenPayload(payload: JwtPayload): payload is JwtPayload & { sub: string; role: Role } {
  return typeof payload.sub === "string" && typeof payload.role === "string";
}

export function publicUser(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function registerUser(
  input: RegisterInput
): Promise<User> {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ phone: input.phone }, ...(input.email ? [{ email: input.email }] : [])],
    },
    select: { id: true },
  });
  if (existing) {
    throw ApiError.conflict("A user with this phone or email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      phone: input.phone,
      email: input.email,
      name: input.name,
      role: input.role,
      giCluster: input.giCluster,
      passwordHash,
    },
  });
}

export async function loginUser(input: LoginInput): Promise<User> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ phone: input.identifier }, { email: input.identifier }],
    },
  });
  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }
  const passwordOk = await verifyPassword(input.password, user.passwordHash);
  if (!passwordOk) {
    throw ApiError.unauthorized("Invalid credentials");
  }
  return user;
}

export async function issueTokenPair(
  user: { id: string; role: Role },
  meta: SessionMeta = {}
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const ttlMs = tokenExpiryMs(env.JWT_REFRESH_EXPIRES);

  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
      expiresAt: new Date(Date.now() + ttlMs),
    },
  });

  return { accessToken, refreshToken, expiresIn: ttlMs };
}

export async function rotateRefreshSession(
  refreshToken: string,
  meta: SessionMeta = {}
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const payload = verifyRefreshToken(refreshToken);
  const session = await prisma.refreshSession.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
  });

  if (!session || session.revokedAt !== null) {
    throw ApiError.unauthorized("Refresh token has been revoked");
  }
  if (session.expiresAt <= new Date()) {
    throw ApiError.unauthorized("Refresh token has expired");
  }
  if (session.userId !== payload.sub) {
    throw ApiError.unauthorized("Refresh token subject mismatch");
  }

  const ttlMs = tokenExpiryMs(env.JWT_REFRESH_EXPIRES);
  const nextAccess = signAccessToken({ id: payload.sub, role: payload.role });
  const nextRefresh = signRefreshToken({ id: payload.sub, role: payload.role });

  await prisma.$transaction([
    prisma.refreshSession.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshSession.create({
      data: {
        userId: payload.sub,
        tokenHash: hashToken(nextRefresh),
        userAgent: meta.userAgent ?? null,
        ip: meta.ip ?? null,
        expiresAt: new Date(Date.now() + ttlMs),
      },
    }),
  ]);

  return { accessToken: nextAccess, refreshToken: nextRefresh, expiresIn: ttlMs };
}

export async function revokeRefreshSession(refreshToken: string): Promise<void> {
  await prisma.refreshSession.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}