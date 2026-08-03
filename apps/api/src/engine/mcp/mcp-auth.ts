import { timingSafeEqual } from 'node:crypto';
import type { FastifyRequest } from 'fastify';

export function hasValidBearerToken(request: FastifyRequest, expectedToken: string) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return false;
  }

  const providedToken = Buffer.from(authorization.slice('Bearer '.length));
  const expectedTokenBuffer = Buffer.from(expectedToken);

  return (
    providedToken.length === expectedTokenBuffer.length &&
    timingSafeEqual(providedToken, expectedTokenBuffer)
  );
}
