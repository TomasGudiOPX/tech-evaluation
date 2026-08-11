import { Inject, Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import type { AuthUser } from '@vps-template/contracts/auth';
import { APP_CONFIG } from '../../platform/app-config.token.js';
import type { AppConfig } from '../../platform/config.js';
import type { JwtClaims } from './auth.types.js';

@Injectable()
export class TokenService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  sign(user: AuthUser): string {
    return jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      this.config.jwtSecret,
      {
        expiresIn: '1h',
        subject: user.id,
      },
    );
  }

  verify(token: string): JwtClaims {
    const decoded = jwt.verify(token, this.config.jwtSecret);

    if (
      typeof decoded === 'string' ||
      !decoded.sub ||
      typeof decoded.email !== 'string' ||
      (decoded.role !== 'customer' && decoded.role !== 'admin')
    ) {
      throw new Error('Invalid token claims');
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  }
}
