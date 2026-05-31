import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod";
import { ValidationError } from "../lib/errors.js";

export function validate(schema: ZodType) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ValidationError(
            "Validation failed",
            error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          ),
        );
      } else {
        next(error);
      }
    }
  };
}
