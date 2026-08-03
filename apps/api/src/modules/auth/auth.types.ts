import type { AuthUser, UserRole } from '@vps-template/contracts/auth';

export type StoredUser = AuthUser & {
  passwordHash: string;
};

export type JwtClaims = {
  sub: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequest = {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthUser;
};
