import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ErrorResponseBody = {
  statusCode: number;
  message: string;
  error?: string;
  path?: string;
  timestamp?: string;
  details?: unknown;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, body } = this.buildResponse(exception, request?.url);
    response.status(statusCode).json(body);
  }

  private buildResponse(
    exception: unknown,
    path?: string,
  ): { statusCode: number; body: ErrorResponseBody } {
    // HttpException (includes ValidationPipe errors)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resUnknown = exception.getResponse() as unknown;
      const res = this.normalizeHttpExceptionResponse(resUnknown);
      const message =
        (Array.isArray(res?.message) ? res.message.join(', ') : res?.message) ||
        exception.message;
      return {
        statusCode: status,
        body: {
          statusCode: status,
          message,
          error: res?.error,
          path,
          timestamp: new Date().toISOString(),
          details: res,
        },
      };
    }

    // Prisma known request errors
    if (this.isPrismaKnownError(exception)) {
      const prismaError = exception;
      const code = prismaError.code;
      if (code === 'P2002') {
        // Unique constraint failed
        return this.make(
          HttpStatus.CONFLICT,
          'Unique constraint failed',
          path,
          {
            code,
            meta: prismaError.meta,
          },
        );
      }
      if (code === 'P2025') {
        // Record not found
        return this.make(HttpStatus.NOT_FOUND, 'Record not found', path, {
          code,
          meta: prismaError.meta,
        });
      }
      return this.make(HttpStatus.BAD_REQUEST, 'Database request error', path, {
        code,
        meta: prismaError.meta,
      });
    }

    // Fallback
    const message = (exception as Error)?.message || 'Internal server error';
    return this.make(HttpStatus.INTERNAL_SERVER_ERROR, message, path);
  }

  private make(
    statusCode: number,
    message: string,
    path?: string,
    details?: unknown,
  ) {
    return {
      statusCode,
      body: {
        statusCode,
        message,
        path,
        timestamp: new Date().toISOString(),
        details,
      },
    };
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isPrismaKnownError(
    exception: unknown,
  ): exception is { code: string; meta?: unknown } {
    if (!this.isObject(exception)) return false;
    const obj = exception;
    return typeof obj.code === 'string';
  }

  private normalizeHttpExceptionResponse(res: unknown): {
    message?: string | string[];
    error?: string;
    [k: string]: unknown;
  } {
    if (this.isObject(res)) {
      return res as {
        message?: string | string[];
        error?: string;
        [k: string]: unknown;
      };
    }
    if (typeof res === 'string') {
      return { message: res };
    }
    return {};
  }
}
