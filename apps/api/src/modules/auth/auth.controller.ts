import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.types.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() body: unknown) {
    return this.auth.register(body);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: unknown) {
    return this.auth.login(body);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() request: AuthenticatedRequest) {
    return { user: request.user };
  }
}
