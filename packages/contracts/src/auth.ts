import { z } from 'zod';

export const userRoleSchema = z.enum(['customer', 'admin']);

export type UserRole = z.infer<typeof userRoleSchema>;

export const registerInputSchema = z.object({
  email: z.string().trim().email().max(255).toLowerCase(),
  password: z.string().min(8).max(120),
});

export const loginInputSchema = z.object({
  email: z.string().trim().email().max(255).toLowerCase(),
  password: z.string().min(1).max(120),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  externalId: string | null;
};

export type AuthTokenResponse = {
  accessToken: string;
  user: AuthUser;
};
