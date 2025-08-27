import { Controller, Post, Body } from '@nestjs/common';
import { SmsService } from './sms.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

class SendSmsDto {
  recipient: string;
  message: string;
}

@ApiTags('SMS')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send SMS message' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: SendSmsDto })
  async sendSms(@Body() body: SendSmsDto) {
    return this.smsService.sendSMS(body.recipient, body.message);
  }
}
