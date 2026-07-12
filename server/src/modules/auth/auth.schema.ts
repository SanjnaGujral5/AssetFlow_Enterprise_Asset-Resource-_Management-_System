import { z } from "zod";

// Signup deliberately has NO role field — every signup becomes an
// EMPLOYEE. Roles can only be changed later via the Admin promotion
// endpoint (Employee Directory, Phase 2).
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  departmentId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
