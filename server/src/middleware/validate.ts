import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Validates req.body against a Zod schema. On success, replaces req.body
// with the parsed (and type-coerced) data so controllers get clean input.
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };
}
