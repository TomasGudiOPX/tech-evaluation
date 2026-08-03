import { Injectable } from '@nestjs/common';
import type { UserRole } from '@vps-template/contracts/auth';
import { PrismaService } from '../../platform/prisma.service.js';
import type { StoredUser } from './auth.types.js';

function toStoredUser(user: {
  id: string;
  email: string;
  role: UserRole;
  passwordHash: string;
}): StoredUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    passwordHash: user.passwordHash,
  };
}

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<StoredUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? toStoredUser(user) : null;
  }

  async findById(id: string): Promise<StoredUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toStoredUser(user) : null;
  }

  async create(email: string, passwordHash: string, role: UserRole): Promise<StoredUser> {
    const user = await this.prisma.user.create({
      data: { email, passwordHash, role },
    });

    return toStoredUser(user);
  }
}
