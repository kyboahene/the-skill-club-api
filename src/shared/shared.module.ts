import { Global, Module } from '@nestjs/common';
import { IpUtilsService } from './utils/ip-utils.service';

@Global()
@Module({
  providers: [IpUtilsService],
  exports: [IpUtilsService],
})
export class SharedModule {}
