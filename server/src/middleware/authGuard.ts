import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

// Verifies the Authorization: Bearer <token> header and attaches the
// decoded payload to req.user. Every protected route depends on this
// running first.
export function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
