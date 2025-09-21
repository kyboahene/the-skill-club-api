import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class UpdateInvitationDto {
    @IsString()
    invitationId: string;
  
    @IsOptional()
    @IsEnum(['sent', 'opened', 'started', 'completed', 'expired', 'cancelled'])
    status?: 'sent' | 'opened' | 'started' | 'completed' | 'expired' | 'cancelled';
  
    @IsOptional()
    @IsString()
    sentAt?: string;
  
    @IsOptional()
    @IsString()
    expiresAt?: string;
  
    @IsOptional()
    @IsNumber()
    maxAttempts?: number;
  
    @IsOptional()
    @IsString()
    lastReminderSent?: string;
  
    @IsOptional()
    @IsNumber()
    remindersSent?: number;
  
    @IsOptional()
    @IsEnum(['pending', 'sent', 'delivered', 'failed', 'bounced'])
    emailDeliveryStatus?: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  
    @IsOptional()
    @IsString()
    updatedAt?: string;
  }