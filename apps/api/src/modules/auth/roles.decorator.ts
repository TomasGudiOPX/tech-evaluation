import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@vps-template/contracts/auth';

export const ROLES_METADATA_KEY = 'roles';

export function Roles(...roles: UserRole[]) {
  return SetMetadata(ROLES_METADATA_KEY, roles);
}
