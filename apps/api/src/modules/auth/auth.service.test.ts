import { describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { AppError } from '../../platform/app-error.js';
import { AuthService } from './auth.service.js';
import type { AuthRepository } from './auth.repository.js';
import type { TokenService } from './token.service.js';
import type { AppConfig } from '../../platform/config.js';
import type { StoredUser } from './auth.types.js';

function createService(users: StoredUser[] = []) {
  const repository = {
    findByEmail: vi.fn(async (email: string) => users.find((user) => user.email === email) ?? null),
    findById: vi.fn(async (id: string) => users.find((user) => user.id === id) ?? null),
    create: vi.fn(async (email: string, passwordHash: string, role: 'customer' | 'admin') => {
      const user = { id: `${users.length + 1}`, email, passwordHash, role };
      users.push(user);
      return user;
    }),
  } satisfies Pick<AuthRepository, 'findByEmail' | 'findById' | 'create'>;

  const tokens = {
    sign: vi.fn((user) => `token:${user.id}:${user.role}`),
  } satisfies Pick<TokenService, 'sign'>;

  const config: AppConfig = {
    adminSeedEmail: undefined,
    adminSeedPassword: undefined,
    corsOrigin: false,
    databaseUrl: 'postgresql://test:test@localhost:5432/test',
    jwtSecret: 'test-secret',
    mcpApiToken: undefined,
    nodeEnv: 'test',
    port: 3000,
  };

  return {
    repository,
    service: new AuthService(repository as unknown as AuthRepository, tokens as unknown as TokenService, config),
    tokens,
    users,
  };
}

describe('AuthService', () => {
  it('registers a customer and hashes the password', async () => {
    const { repository, service } = createService();

    const result = await service.register({
      email: 'USER@example.com',
      password: 'correct-password',
    });

    expect(result.user).toMatchObject({ email: 'user@example.com', role: 'customer' });
    expect(result.accessToken).toBe('token:1:customer');
    expect(repository.create).toHaveBeenCalledWith('user@example.com', expect.not.stringContaining('correct-password'), 'customer');
    await expect(bcrypt.compare('correct-password', repository.create.mock.calls[0][1])).resolves.toBe(true);
  });

  it('does not allow public registration to create an admin', async () => {
    const { repository, service } = createService();

    await service.register({
      email: 'user@example.com',
      password: 'correct-password',
      role: 'admin',
      isAdmin: true,
    });

    expect(repository.create).toHaveBeenCalledWith('user@example.com', expect.any(String), 'customer');
  });

  it('logs in with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 12);
    const { service } = createService([
      { id: 'user-1', email: 'user@example.com', passwordHash, role: 'customer' },
    ]);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'correct-password',
      }),
    ).resolves.toMatchObject({
      accessToken: 'token:user-1:customer',
      user: { id: 'user-1', email: 'user@example.com', role: 'customer' },
    });
  });

  it('returns the same stable error for unknown email and wrong password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 12);
    const { service } = createService([
      { id: 'user-1', email: 'user@example.com', passwordHash, role: 'customer' },
    ]);

    await expect(service.login({ email: 'missing@example.com', password: 'wrong' })).rejects.toMatchObject({
      code: 'AUTH_INVALID_CREDENTIALS',
    } satisfies Partial<AppError>);
    await expect(service.login({ email: 'user@example.com', password: 'wrong' })).rejects.toMatchObject({
      code: 'AUTH_INVALID_CREDENTIALS',
    } satisfies Partial<AppError>);
  });
});
