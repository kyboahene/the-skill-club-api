import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
 
import { BetterAuthController } from './better-auth/auth.controller';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { SmsModule } from './sms/sms.module';
import { PaginationModule } from './pagination/pagination.module';
import { SendEmailsModule } from './send-emails/send-emails.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { CompaniesModule } from './companies/companies.module';
import { EventsModule } from './events/events.module';
import { TalentsModule } from './talents/talents.module';
import { JobsModule } from './jobs/jobs.module';
import { CandidateSessionsModule } from './candidate-sessions/candidate-sessions.module';
import { CandidateManagementModule } from './candidate-management/candidate-management.module';
import { TestsModule } from './tests/tests.module';
import { SkillsModule } from './skills/skills.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { PdfModule } from './pdf/pdf.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    SharedModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        // Gmail: secure=true for 465, secure=false for 587 (STARTTLS)
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASS,
        },
        // Relax TLS in local dev to avoid self-signed/CA issues
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: `${process.env.APP_NAME ?? 'The Skill Club'} <${process.env.EMAIL_ADDRESS}>`,
      },
      template: {
        dir: join(__dirname, '..', 'mail-templates'),
        adapter: new HandlebarsAdapter()
      }
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SmsModule,
    PaginationModule,
    SendEmailsModule,
    PermissionsModule,
    RolesModule,
    AssessmentsModule,
    CompaniesModule,
    EventsModule,
    TalentsModule,
    JobsModule,
    SkillsModule,
    CandidateSessionsModule,
    CandidateManagementModule,
    TestsModule,
    FileUploadModule,
    PdfModule
  ],
  controllers: [AppController, BetterAuthController],
  providers: [AppService],
})
export class AppModule {}
