import { ExceptionFilter, Catch, ArgumentsHost, ConflictException, BadRequestException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const message = exception.message;

    // PostgreSQL unique constraint violation code
    if (exception.driverError && (exception.driverError as any).code === '23505') {
      if (message.includes('UQ_')) {
        // Extract column name from constraint name (e.g., UQ_batch_code -> batch_code)
        const constraintName = message.match(/UQ_(\w+)/);
        if (constraintName && constraintName[1]) {
          const field = constraintName[1].replace('_', '.').replace('batch.', 'batch_').split('.').pop(); // Tries to get the field name
          if (field === 'code') {
            return response.status(409).json({
              statusCode: 409,
              message: `A batch with this code already exists.`,
              error: 'Conflict',
            });
          }
        }
      }
      return response.status(409).json({
        statusCode: 409,
        message: 'A duplicate entry already exists.',
        error: 'Conflict',
      });
    }

    // Default to BadRequest or InternalServerError for other query failures
    return response.status(400).json({
      statusCode: 400,
      message: message,
      error: 'Bad Request',
    });
  }
}
