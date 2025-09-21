import {
  CallHandler,
  NestInterceptor,
  UseInterceptors,
  ExecutionContext,
  applyDecorators,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export function Serialize<T>(classType: ClassConstructor<T>) {
  return applyDecorators(UseInterceptors(new SerializerInterceptor(classType)));
}

export class SerializerInterceptor implements NestInterceptor {
  constructor(private readonly classType: ClassConstructor<any>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.classType, data, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        });
      }),
    );
  }
}
