import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { NOTIFICATION_QUEUE } from '@/constants';

import { SmsModule } from '@/sms/sms.module';
import { UsersModule } from '@/users/users.module';

import { SendEmailsService } from './send-emails.service';
import { SendEmailsController } from './send-emails.controller';

@Module({
  controllers: [SendEmailsController],
  providers: [SendEmailsService],
  imports: [
    SmsModule,
    UsersModule,
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),
  ],
  exports: [SendEmailsService]
})
export class SendEmailsModule { }
