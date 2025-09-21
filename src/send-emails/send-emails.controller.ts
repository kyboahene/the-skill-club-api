import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';

import { SendEmailsService } from './send-emails.service';
import { Auth } from '@/auth/decorator';
import { SendNotificationDto } from './dto/send-notification.dto';

@ApiTags('Send Notifications')
@Controller('send-notification')
export class SendEmailsController {
  constructor(private readonly sendEmailsService: SendEmailsService) {}

  @Auth(['send_notifications'])
  @ApiOperation({
    summary: 'send notifications to members either via email or sms or both',
    description: 'Required permissions: "send_notifications"',
  })
  @Post()
  batchUpload(
    @Body() data: SendNotificationDto
  ) {
    return this.sendEmailsService.sendNotifications(data);
  }
}
