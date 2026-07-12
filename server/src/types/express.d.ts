import { JwtPayload } from "../lib/jwt";

// Extends Express's Request type so req.user is available and typed
// after the authGuard middleware runs.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
