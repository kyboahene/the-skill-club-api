import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to NestJS Starter Kit API! Visit /docs for API documentation.';
  }
}
