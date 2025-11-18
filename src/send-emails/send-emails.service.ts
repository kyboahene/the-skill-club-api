import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';

import { NOTIFICATION_QUEUE } from '@/constants';

import { SmsService } from '@/sms/sms.service';
import { UsersService } from '@/users/users.service';

import { SendNotificationDto } from './dto/send-notification.dto';

import {
  GeneralInformation,
  MemberDetail,
  PasswordReset,
  RequestReview,
  EmailVerification,
  AssessmentInvitation,
} from './entities/emails.entity';

type SendTextMessage = {
  recipient: string, message: string
}

@Injectable()
export class SendEmailsService {
  constructor(
    private mailService: MailerService,
    private smsService: SmsService,
    private userService: UsersService,
    @InjectQueue(NOTIFICATION_QUEUE) private sendNotificationQueue: Queue
  ) { }

  private renderTemplate(templateName: string, context: Record<string, any>) {
    const templatePath = path.join(__dirname, '..', '..', 'mail-templates', `${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(source);
    return compiled(context);
  }

  private async sendTemplateEmail(to: string, subject: string, template: string, context: Record<string, any>) {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const html = this.renderTemplate(template, context);
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_ADDRESS || 'no-reply@skillclub.dev',
          to,
          subject,
          html,
        })
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Resend send failed: ${resp.status} ${text}`);
      }
      return;
    }
    await this.mailService.sendMail({
      to,
      from: process.env.EMAIL_ADDRESS,
      subject,
      template,
      context,
    });
  }

  @OnEvent('member.created')
  async sendMemberDetails(data: MemberDetail) {
    await this.sendTemplateEmail(data.to, data.subject, data.template, {
      email: data.to,
      name: data.name,
      title: data.subject,
      password: data.password,
      baseURL: process.env.BASE_URL,
      year: new Date().getFullYear(),
    });
  }

  @OnEvent('password.reset')
  async sendResetPasswordLink(data: PasswordReset) {
    await this.sendTemplateEmail(data.to, data.subject, data.template, {
      name: data.name,
      resetLink: data.resetLink,
      email: data.to,
      year: new Date().getFullYear(),
      title: data.subject,
      baseURL: process.env.BASE_URL,
    });
  }

  @OnEvent('email.verification')
  async sendEmailVerification(data: EmailVerification) {
    await this.sendTemplateEmail(data.to, data.subject, data.template, {
      name: data.name,
      verificationLink: data.verificationLink,
      email: data.to,
      year: new Date().getFullYear(),
      title: data.subject,
      baseURL: process.env.BASE_URL,
    });
  }

  @OnEvent('approval.process.notice')
  async sendDisapprovalNotification(data: RequestReview) {
    await this.sendTemplateEmail(data.to, data.subject, data.template, {
      name: data.name,
      title: data.subject,
      year: new Date().getFullYear(),
      baseURL: process.env.BASE_URL,
      requestType: data?.requestType,
    });
  }

  @OnEvent('general.email.notice')
  async sendGeneralNotification(data: GeneralInformation) {
    await this.sendTemplateEmail(data.to, data.subject, data.template, {
      name: data.name,
      title: data.subject,
      message: data.message,
      baseURL: process.env.BASE_URL,
      year: new Date().getFullYear(),
    });
  }

  @OnEvent('send.text.message')
  async sendTextMessage(data: SendTextMessage) {
    console.log('At the event:', { data });

    await this.smsService.sendSMS(data.recipient, data.message);
  }

  @OnEvent('assessment.invitation')
  async sendAssessmentInvitation(data: AssessmentInvitation) {
    await this.sendTemplateEmail(data.candidateEmail, data.subject, data.template, {
      candidateName: data.candidateName,
      candidateEmail: data.candidateEmail,
      companyName: data.companyName,
      invitationLink: data.invitationLink,
      assessmentTitles: data.assessmentTitles,
      deadline: data.deadline,
      maxAttempts: data.maxAttempts,
      customMessage: data.customMessage,
      title: data.subject,
      year: new Date().getFullYear(),
      baseURL: process.env.BASE_URL,
    });
  }

  async sendNotifications(data: SendNotificationDto) {
    const users = await this.userService.findUsers(1, 1, true, undefined);

    const phoneNumbers = users.data.map((user) => user.phone).filter(phoneNumber => !phoneNumber);

    const emailNotifications = users.data.map((user) => ({
      to: user.email,
      name: user.name,
      subject: data.subject,
      message: data.message,
      template: 'general-information',
    }));

    const notificationPromises = [];

    if (data.medium.includes('email')) {
      notificationPromises.push(
        this.sendNotificationQueue.add('send-bulk-email-notifications', {
          emailNotifications
        })
      );
    }

    if (data.medium.includes('sms')) {
      notificationPromises.push(
        this.sendNotificationQueue.add('send-bulk-text-messages', {
          phoneNumbers,
          message: data.message,
        })
      );
    }

    await Promise.all(notificationPromises);
  }
}
