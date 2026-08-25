import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { AuthTokenResponse, AuthUser } from '@vps-template/contracts/auth';
import { loginInputSchema, registerInputSchema } from '@vps-template/contracts/auth';
import bcrypt from 'bcryptjs';
import { APP_CONFIG } from '../../platform/app-config.token.js';
import { AppError } from '../../platform/app-error.js';
import type { AppConfig } from '../../platform/config.js';
import { AuthRepository } from './auth.repository.js';
import { TokenService } from './token.service.js';
import type { StoredUser } from './auth.types.js';

function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    externalId: user.externalId,
  };
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokens: TokenService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async onModuleInit() {
    await this.seedDevelopmentAdmin();
  }

  async register(input: unknown): Promise<AuthTokenResponse> {
    const parsed = registerInputSchema.parse(input);
    const existing = await this.repository.findByEmail(parsed.email);

    if (existing) {
      throw new AppError(409, 'AUTH_EMAIL_ALREADY_REGISTERED', 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const user = toAuthUser(await this.repository.create(parsed.email, passwordHash, 'customer'));

    return {
      accessToken: this.tokens.sign(user),
      user,
    };
  }

  async login(input: unknown): Promise<AuthTokenResponse> {
    const parsed = loginInputSchema.parse(input);
    const user = await this.repository.findByEmail(parsed.email);

    if (!user || !(await bcrypt.compare(parsed.password, user.passwordHash))) {
      throw new AppError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid credentials');
    }

    const authUser = toAuthUser(user);

    return {
      accessToken: this.tokens.sign(authUser),
      user: authUser,
    };
  }

  async profile(userId: string): Promise<AuthUser> {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new AppError(401, 'AUTH_UNAUTHENTICATED', 'Authentication is required');
    }

    return toAuthUser(user);
  }

  private async seedDevelopmentAdmin() {
    const { adminSeedEmail, adminSeedPassword } = this.config;

    if (!adminSeedEmail || !adminSeedPassword) {
      return;
    }

    const parsed = registerInputSchema.parse({
      email: adminSeedEmail,
      password: adminSeedPassword,
    });
    const existing = await this.repository.findByEmail(parsed.email);

    if (existing) {
      return;
    }

    await this.repository.create(parsed.email, await bcrypt.hash(parsed.password, 12), 'admin');
  }
}
