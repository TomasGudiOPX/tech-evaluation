import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { AppError } from './app-error.js';
import { AppExceptionFilter } from './app-exception.filter.js';

function createHost() {
  const send = vi.fn();
  const status = vi.fn(() => ({ send }));

  return {
    response: { status, send },
    host: {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    },
  };
}

describe('AppExceptionFilter', () => {
  it('returns validation field errors', () => {
    const { host, response } = createHost();
    const error = z.object({ email: z.string().email() }).safeParse({ email: 'bad' }).error;

    new AppExceptionFilter().catch(error, host as never);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.status.mock.results[0].value.send).toHaveBeenCalledWith({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      fieldErrors: { email: [expect.any(String)] },
    });
  });

  it('maps unauthenticated and forbidden responses to stable codes', () => {
    const unauthenticated = createHost();
    const forbidden = createHost();
    const filter = new AppExceptionFilter();

    filter.catch(new UnauthorizedException(), unauthenticated.host as never);
    filter.catch(new ForbiddenException(), forbidden.host as never);

    expect(unauthenticated.response.status.mock.results[0].value.send).toHaveBeenCalledWith({
      code: 'AUTH_UNAUTHENTICATED',
      message: 'Authentication is required',
    });
    expect(forbidden.response.status.mock.results[0].value.send).toHaveBeenCalledWith({
      code: 'AUTH_FORBIDDEN',
      message: 'Administrator access is required',
    });
  });

  it('hides unexpected error details', () => {
    const { host, response } = createHost();

    new AppExceptionFilter().catch(new Error('database stack trace'), host as never);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.status.mock.results[0].value.send).toHaveBeenCalledWith({
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error',
    });
  });

  it('preserves domain error envelopes', () => {
    const { host, response } = createHost();

    new AppExceptionFilter().catch(
      new AppError(409, 'AUTH_EMAIL_ALREADY_REGISTERED', 'Email is already registered'),
      host as never,
    );

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.status.mock.results[0].value.send).toHaveBeenCalledWith({
      code: 'AUTH_EMAIL_ALREADY_REGISTERED',
      message: 'Email is already registered',
    });
  });
});
