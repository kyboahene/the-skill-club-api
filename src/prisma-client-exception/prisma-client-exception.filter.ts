import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import {
  formatUniqueConstraintError,
  formatForeignKeyError,
  formatRecordNotFoundError,
  formatValueTooLongError,
  formatNullConstraintError,
  formatMissingRequiredError,
  formatInvalidIdError,
  formatQueryInterpretationError,
  formatTableNotExistError,
  formatColumnNotExistError,
  formatForbiddenErrorMessage
} from '@/utils/format-error-messages';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status: HttpStatus;
    let message: string;
    let error: string;

    // Log the error for debugging
    console.log(`Prisma Error Code: ${exception.code}`);
    console.log('Exception Meta:', exception.meta);

    switch (exception.code) {
      case 'P2000': // Value too long for column
        status = HttpStatus.BAD_REQUEST;
        message = formatValueTooLongError(exception);
        error = 'Bad Request';
        break;

      case 'P2002': // Unique constraint violation
        status = HttpStatus.CONFLICT;
        message = formatUniqueConstraintError(exception);
        error = 'Conflict';
        break;

      case 'P2003': // Foreign key constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = formatForeignKeyError(exception);
        error = 'Bad Request';
        break;

      case 'P2011': // Null constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = formatNullConstraintError(exception);
        error = 'Bad Request';
        break;

      case 'P2012': // Missing required value
        status = HttpStatus.BAD_REQUEST;
        message = formatMissingRequiredError(exception);
        error = 'Bad Request';
        break;

      case 'P2014': // Invalid ID
        status = HttpStatus.BAD_REQUEST;
        message = formatInvalidIdError(exception);
        error = 'Bad Request';
        break;

      case 'P2016': // Query interpretation error
        status = HttpStatus.BAD_REQUEST;
        message = formatQueryInterpretationError(exception);
        error = 'Bad Request';
        break;

      case 'P2021': // Table does not exist
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = formatTableNotExistError(exception);
        error = 'Internal Server Error';
        break;

      case 'P2022': // Column does not exist
        status = HttpStatus.BAD_REQUEST;
        message = formatColumnNotExistError(exception);
        error = 'Bad Request';
        break;

      case 'P2025': // Record not found
        status = HttpStatus.NOT_FOUND;
        message = formatRecordNotFoundError(exception);
        error = 'Not Found';
        break;

      default:
        // For unhandled Prisma errors, use the default handler
        console.log(`Unhandled Prisma error code: ${exception.code}`);
        super.catch(exception, host);
        return;
    }

    // Send structured error response
    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}