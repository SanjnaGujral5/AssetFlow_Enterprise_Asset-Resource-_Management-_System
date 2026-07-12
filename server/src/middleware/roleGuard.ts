import { Request, Response, NextFunction } from "express";

// Restricts a route to a set of roles. Must run after authGuard.
// Usage: router.post("/promote", authGuard, roleGuard("ADMIN"), handler)
export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }

    next();
  };
}
