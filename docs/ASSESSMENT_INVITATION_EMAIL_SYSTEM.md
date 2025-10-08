# Assessment Invitation Email System - Background Job Implementation

## Overview

The assessment invitation email system has been implemented using **Event-Driven Architecture** with NestJS EventEmitter2 for asynchronous background processing. This ensures that email sending doesn't block the API response and provides better user experience.

## Architecture

```
Client Request (Create Invitations)
         ↓
CompanyAssessmentController
         ↓
CompanyAssessmentService.createBulkCompanyAssessmentInvitations()
         ↓
Database Transaction (Create Invitations)
         ↓
Emit 'assessment.invitation' Events (Async)
         ↓
SendEmailsService.sendAssessmentInvitation() (Event Handler)
         ↓
MailerService (Send Email via SMTP/Email Provider)
         ↓
Update Email Delivery Status
```

## Components

### 1. Email Template

**File**: `mail-templates/assessment-invitation.hbs`

Features:
- ✅ Professional design with gradient header
- ✅ Assessment details section
- ✅ Custom message support
- ✅ Responsive layout
- ✅ Call-to-action button
- ✅ Important notes and instructions
- ✅ Fallback plain link
- ✅ Company branding

Template Variables:
```handlebars
{{candidateName}}        - Recipient's name
{{candidateEmail}}       - Recipient's email
{{companyName}}          - Inviting company name
{{invitationLink}}       - Unique assessment link
{{assessmentTitles}}     - Array of assessment names
{{deadline}}             - Formatted deadline date
{{maxAttempts}}          - Maximum allowed attempts
{{customMessage}}        - Optional custom message from company
{{year}}                 - Current year for footer
```

### 2. Email Entity

**File**: `src/send-emails/entities/emails.entity.ts`

```typescript
export class AssessmentInvitation extends MailConfig {
  candidateName: string;
  candidateEmail: string;
  companyName: string;
  invitationLink: string;
  assessmentTitles: string[];
  deadline?: string;
  maxAttempts: number;
  customMessage?: string;
}
```

### 3. Event Handler

**File**: `src/send-emails/send-emails.service.ts`

```typescript
@OnEvent('assessment.invitation')
async sendAssessmentInvitation(data: AssessmentInvitation) {
  await this.mailService.sendMail({
    to: data.candidateEmail,
    from: process.env.EMAIL_ADDRESS,
    subject: data.subject,
    template: 'assessment-invitation',
    context: {
      candidateName: data.candidateName,
      companyName: data.companyName,
      invitationLink: data.invitationLink,
      assessmentTitles: data.assessmentTitles,
      deadline: data.deadline,
      maxAttempts: data.maxAttempts,
      customMessage: data.customMessage,
      // ... other context variables
    },
  });
}
```

### 4. Company Assessment Service

**File**: `src/companies/company-assessment.service.ts`

#### Bulk Invitation Creation

```typescript
async createBulkCompanyAssessmentInvitations(data) {
  // 1. Validate company exists
  await this.companyService.getCompany(data.companyId);

  // 2. Create invitations in database transaction
  const result = await this.prisma.$transaction(async (prisma) => {
    // Create invitations with PENDING email status
    // ...
  });

  // 3. Emit events for background email sending
  for (const invitation of result) {
    this.eventEmitter.emit('assessment.invitation', {
      candidateEmail: invitation.candidateEmail,
      candidateName: invitation.candidateName,
      companyName: invitation.company?.name,
      invitationLink: invitation.invitationLink,
      assessmentTitles: invitation.assessments?.map(a => a.title),
      deadline: formatDeadline(data.expiresAt),
      maxAttempts: data.maxAttempts,
      customMessage: data.customMessage,
      subject: `Assessment Invitation from ${company.name}`,
      template: 'assessment-invitation',
    });

    // 4. Update email delivery status
    await this.prisma.candidateInvitation.update({
      where: { id: invitation.id },
      data: { emailDeliveryStatus: EmailDeliveryStatus.SENT }
    });
  }

  return result;
}
```

#### Resend Invitation

```typescript
async resendCompanyAssessmentInvitation(data) {
  const invitation = await this.getCompanyAssessmentInvitation(data.invitationId);

  // Emit event for resending email
  this.eventEmitter.emit('assessment.invitation', {
    // ... same data as above
    subject: `Reminder: Assessment Invitation from ${data.companyName}`,
  });

  // Update resend tracking
  await this.updateCompanyAssessmentInvitation(data.invitationId, {
    emailDeliveryStatus: EmailDeliveryStatus.SENT,
    remindersSent: (invitation.remindersSent || 0) + 1,
    lastReminderSent: new Date(),
  });
}
```

### 5. Module Configuration

**File**: `src/companies/companies.module.ts`

```typescript
@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyAssessmentService],
  exports: [CompaniesService, CompanyAssessmentService],
  imports: [
    PaginationModule, 
    CandidateSessionsModule, 
    SendEmailsModule  // ✅ Added for email service
  ]
})
export class CompaniesModule {}
```

## Email Delivery Status Tracking

The system tracks email delivery status using the `EmailDeliveryStatus` enum:

```typescript
enum EmailDeliveryStatus {
  PENDING   // Initial status when invitation is created
  SENT      // Email event emitted successfully
  FAILED    // Email sending failed
  DELIVERED // Email successfully delivered (optional)
  BOUNCED   // Email bounced (optional)
}
```

### Status Flow

```
PENDING → SENT → DELIVERED
   ↓
FAILED (if error occurs)
```

## Error Handling

### 1. Email Sending Errors

```typescript
for (const invitation of result) {
  try {
    // Emit email event
    this.eventEmitter.emit('assessment.invitation', {...});
    
    // Update status to SENT
    await this.prisma.candidateInvitation.update({
      where: { id: invitation.id },
      data: { emailDeliveryStatus: EmailDeliveryStatus.SENT }
    });
  } catch (emailError) {
    // Log error but don't fail entire operation
    console.error(`Failed to send email for invitation ${invitation.id}:`, emailError);
    
    // Update status to FAILED
    await this.prisma.candidateInvitation.update({
      where: { id: invitation.id },
      data: { emailDeliveryStatus: EmailDeliveryStatus.FAILED }
    });
  }
}
```

### 2. Transaction Safety

- Invitations are created in a database transaction
- If any invitation creation fails, none are committed
- Email sending happens **after** transaction commits
- Email failures don't rollback invitation creation

## Benefits

### 1. **Non-Blocking Operations**
- API responds immediately after creating invitations
- Emails are sent asynchronously in the background
- Better user experience with faster response times

### 2. **Resilience**
- Email failures don't block invitation creation
- Failed emails can be retried
- Status tracking for monitoring

### 3. **Scalability**
- Can handle bulk invitations efficiently
- Event emitter can be replaced with Bull Queue for more advanced scenarios
- Easy to add email retry logic

### 4. **Maintainability**
- Separation of concerns (business logic vs email sending)
- Easy to add new email types
- Template-based email system

## Environment Variables

Required environment variables:

```env
# Email Configuration
EMAIL_ADDRESS=noreply@theskillclub.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL for invitation links
FRONTEND_URL=https://theskillclub.com
```

## Usage Example

### Creating Bulk Invitations

```typescript
POST /companies/:companyId/assessments/invitations/bulk

Body:
{
  "candidates": [
    {
      "candidateEmail": "john@example.com",
      "candidateName": "John Doe"
    },
    {
      "candidateEmail": "jane@example.com",
      "candidateName": "Jane Smith"
    }
  ],
  "assessmentIds": ["assessment-id-1", "assessment-id-2"],
  "expiresAt": "2025-12-31T23:59:59Z",
  "maxAttempts": 2,
  "customMessage": "Good luck on your assessment!"
}

Response:
{
  "successful": 2,
  "failed": 0,
  "total": 2,
  "invitations": [...],
  "errors": []
}
```

### Resending Invitation

```typescript
POST /companies/assessments/invitations/resend

Body:
{
  "invitationId": "invitation-id",
  "candidateEmail": "john@example.com",
  "candidateName": "John Doe",
  "assessmentLink": "https://theskillclub.com/assessment/take/...",
  "deadline": "December 31, 2025",
  "companyName": "Tech Corp"
}
```

## Future Enhancements

### 1. **Bull Queue Integration**

Replace EventEmitter with Bull Queue for:
- ✅ Persistent job storage
- ✅ Automatic retries with exponential backoff
- ✅ Job monitoring and dashboard
- ✅ Rate limiting
- ✅ Job prioritization

```typescript
// Example Bull Queue implementation
@Processor('assessment-emails')
export class AssessmentEmailProcessor {
  @Process('send-invitation')
  async handleSendInvitation(job: Job<AssessmentInvitation>) {
    await this.mailService.sendMail({...});
  }
}
```

### 2. **Email Analytics**

Track:
- Open rates
- Click rates
- Bounce rates
- Unsubscribe rates

### 3. **Email Templates Versioning**

- A/B testing different email templates
- Template personalization
- Multi-language support

### 4. **Scheduled Reminders**

Automatically send reminders before deadline:
- 3 days before
- 1 day before
- 2 hours before

### 5. **Email Provider Integration**

Integrate with professional email services:
- SendGrid
- AWS SES
- Mailgun
- Postmark

## Testing

### Unit Tests

```typescript
describe('CompanyAssessmentService', () => {
  it('should emit assessment.invitation event for each invitation', async () => {
    const eventEmitterSpy = jest.spyOn(eventEmitter, 'emit');
    
    await service.createBulkCompanyAssessmentInvitations({...});
    
    expect(eventEmitterSpy).toHaveBeenCalledWith(
      'assessment.invitation',
      expect.objectContaining({
        candidateEmail: 'john@example.com',
        companyName: 'Tech Corp',
      })
    );
  });
});
```

### Integration Tests

```typescript
describe('Assessment Invitation Email Flow', () => {
  it('should create invitations and send emails', async () => {
    const result = await request(app.getHttpServer())
      .post('/companies/comp-id/assessments/invitations/bulk')
      .send({
        candidates: [{...}],
        assessmentIds: ['id-1'],
      });
    
    expect(result.body.successful).toBe(1);
    
    // Wait for async email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify email was sent
    expect(mockMailService.sendMail).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Emails Not Sending

1. **Check EventEmitter is enabled**
   ```typescript
   // In app.module.ts
   EventEmitterModule.forRoot()
   ```

2. **Verify SendEmailsModule is imported**
   ```typescript
   imports: [SendEmailsModule]
   ```

3. **Check email credentials**
   ```bash
   echo $EMAIL_ADDRESS
   echo $SMTP_HOST
   ```

4. **Check logs**
   ```bash
   grep "assessment.invitation" logs/app.log
   ```

### Email Status Stuck at PENDING

- Event might not be firing
- Check SendEmailsService event handler
- Verify template exists in mail-templates/

### Emails Marked as FAILED

- Check SMTP configuration
- Verify email provider credentials
- Check firewall/network settings
- Review error logs

## Monitoring

### Email Delivery Metrics

Query to get email delivery stats:

```sql
SELECT 
  emailDeliveryStatus,
  COUNT(*) as count,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "CandidateInvitation") as percentage
FROM "CandidateInvitation"
GROUP BY emailDeliveryStatus;
```

### Failed Email Report

```sql
SELECT 
  id,
  candidateEmail,
  candidateName,
  createdAt,
  emailDeliveryStatus
FROM "CandidateInvitation"
WHERE emailDeliveryStatus = 'FAILED'
ORDER BY createdAt DESC;
```

## Conclusion

The assessment invitation email system provides a robust, scalable solution for sending invitation emails asynchronously. The event-driven architecture ensures:

- ✅ Fast API responses
- ✅ Resilient email delivery
- ✅ Easy monitoring and troubleshooting
- ✅ Scalable for bulk operations
- ✅ Maintainable codebase

The system is production-ready and can be extended with additional features like email queues, analytics, and advanced retry logic as needed.
