import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { z } from "zod";
import { ZodError } from "zod";

type Targets = "body" | "query" | "params";

export function validate<T extends z.ZodTypeAny>(
  schema: T,
  target: Targets = "body"
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (result.success) {
      if (target === "body") {
        req.body = result.data;
      } else if (target === "query") {
        req.query = result.data;
      } else {
        req.params = result.data;
      }
      next();
      return;
    }
    next(result.error);
  };
}

export function validateAll(
  schemas: Partial<Record<Targets, z.ZodTypeAny>>
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const issues: z.ZodIssue[] = [];

    for (const target of Object.keys(schemas) as Targets[]) {
      const schema = schemas[target];
      if (!schema) {
        continue;
      }
      const result = schema.safeParse(req[target]);
      if (result.success) {
        if (target === "body") {
          req.body = result.data;
        } else if (target === "query") {
          req.query = result.data;
        } else {
          req.params = result.data;
        }
      } else {
        issues.push(...result.error.issues);
      }
    }

    if (issues.length === 0) {
      next();
      return;
    }
    next(new ZodError(issues));
  };
}