import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PostsModule } from './posts/posts.module';
import { SmsModule } from './sms/sms.module';
import { PaginationModule } from './pagination/pagination.module';
import { SendEmailsModule } from './send-emails/send-emails.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          pass: process.env.EMAIL_PASS,
          user: process.env.EMAIL_ADDRESS,
        },
      },
      defaults: {
        from: {
          name: "Starter Kit",
          address: process.env.EMAIL_ADDRESS
        },
      },
      template: {
        dir: join(__dirname, '..', 'mail-templates'),
        adapter: new HandlebarsAdapter()
      }
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    SmsModule,
    PaginationModule,
    SendEmailsModule,
    PermissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
