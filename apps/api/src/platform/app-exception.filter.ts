import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException, HttpException, UnauthorizedException } from '@nestjs/common';
import { ZodError } from 'zod';
import { AppError, type FieldErrors } from './app-error.js';

function zodFieldErrors(error: ZodError): FieldErrors {
  return error.issues.reduce<FieldErrors>((fieldErrors, issue) => {
    const field = issue.path.join('.') || 'body';
    fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
    return fieldErrors;
  }, {});
}

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof AppError) {
      return response.status(exception.statusCode).send({
        code: exception.code,
        message: exception.message,
        ...(exception.fieldErrors ? { fieldErrors: exception.fieldErrors } : {}),
      });
    }

    if (exception instanceof ZodError) {
      return response.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        fieldErrors: zodFieldErrors(exception),
      });
    }

    if (exception instanceof UnauthorizedException) {
      return response.status(401).send({
        code: 'AUTH_UNAUTHENTICATED',
        message: 'Authentication is required',
      });
    }

    if (exception instanceof ForbiddenException) {
      return response.status(403).send({
        code: 'AUTH_FORBIDDEN',
        message: 'Administrator access is required',
      });
    }

    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).send({
        code: 'HTTP_ERROR',
        message: exception.message,
      });
    }

    return response.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error',
    });
  }
}
