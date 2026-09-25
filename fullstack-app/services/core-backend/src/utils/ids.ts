import { createHash, randomBytes, randomInt } from "crypto";

function yymmdd(): string {
  return new Date().toISOString().slice(2, 10).replace(/-/g, "");
}

export function generateDisplayId(): string {
  const rand = randomInt(0, 1_000_000_000).toString(36).toUpperCase().padStart(6, "0");
  return `ORD-${yymmdd()}-${rand}`;
}

export function generateAwb(): string {
  const rand = randomBytes(5).toString("hex").toUpperCase();
  return `SIH${yymmdd()}${rand}`;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}