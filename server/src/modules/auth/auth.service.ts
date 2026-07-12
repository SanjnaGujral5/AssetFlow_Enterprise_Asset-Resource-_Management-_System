import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/jwt";
import { SignupInput, LoginInput } from "./auth.schema";

const SALT_ROUNDS = 10;

export async function signupEmployee(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    const err: any = new Error("An account with this email already exists");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // role is hard-coded to EMPLOYEE — this is the only path a signup can
  // take, regardless of what the client sends.
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "EMPLOYEE",
      departmentId: input.departmentId,
    },
  });

  const token = signToken({
    userId: user.id,
    role: user.role,
    departmentId: user.departmentId,
  });

  return { token, user: sanitizeUser(user) };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    const err: any = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  if (user.status === "INACTIVE") {
    const err: any = new Error("This account has been deactivated. Contact your admin.");
    err.status = 403;
    throw err;
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    const err: any = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    departmentId: user.departmentId,
  });

  return { token, user: sanitizeUser(user) };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err: any = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return sanitizeUser(user);
}

// Never send passwordHash back to the client.
function sanitizeUser(user: any) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
