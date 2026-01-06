import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { AccessTokenRevalidate } from '../errors/access-token-revalidate.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: { status: (code: number) => { json: (body: any) => void } } = ctx.getResponse();
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';

    // 1. BadRequestException (400)
    if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      message = this.extractMessage(exception);
    }
    // 2. ForbiddenException (403)->400
    else if (exception instanceof ForbiddenException) {
      status = HttpStatus.BAD_REQUEST;
      message = this.extractMessage(exception);
    }
    // 3. NotFoundException (404)
    else if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = this.extractMessage(exception);
    }
    // 4. ConflictException (409) (e.g., duplicate entries), global filter -> 400
    else if (exception instanceof ConflictException) {
      status = HttpStatus.BAD_REQUEST;
      message = this.extractMessage(exception);
    }
    // 5 & 6. InternalServerErrorException, config/missing keys (500)
    else if (exception instanceof InternalServerErrorException) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = this.extractMessage(exception);
    }
    // 7. Native JS Error (500)
    else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
    }
    // 8. Custom error object (AccessTokenRevalidate) (401)
    if (exception instanceof AccessTokenRevalidate) {
      status = HttpStatus.UNAUTHORIZED;
      message = exception.message;
    }
    // Fallback for HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = this.extractMessage(exception);
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
    }

    // Check if headersSent is available and true before sending a response
    if ('headersSent' in response && response.headersSent) return;
    response.status(status).json({
      status,
      message,
    });
  }

  private extractMessage(exception: HttpException): string {
    const res = exception.getResponse();
    if (typeof res === 'string') return res;
    if (typeof res === 'object' && res !== null) {
      const resObj = res as { message?: string; error?: string };
      if (typeof resObj.message === 'string') return resObj.message;
      if (typeof resObj.error === 'string') return resObj.error;
    }
    return typeof exception.message === 'string' ? exception.message : 'Unknown error';
  }
}
