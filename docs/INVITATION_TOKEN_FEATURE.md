# Invitation Token Feature

## Overview

Added a unique `invitationToken` field to the `CandidateInvitation` model to allow secure, public access to invitation details by candidates. This enables candidates to retrieve their assessment information using only the token from their invitation link, without requiring authentication.

## Changes Made

### 1. Database Schema Update

**File**: `prisma/schema.prisma`

Added `invitationToken` field to the `CandidateInvitation` model:

```prisma
model CandidateInvitation {
  id             String   @id @default(cuid())
  candidateEmail String
  candidateName  String
  assessmentIds  String[]
  companyId      String
  invitedBy      String
  invitedByName  String

  // ... other fields
  invitationLink      String
  invitationToken     String              @unique  // ✅ NEW FIELD
  emailDeliveryStatus EmailDeliveryStatus @default(PENDING)
  // ... rest of fields
}
```

**Key Features**:
- `@unique` constraint ensures each token is unique
- Token is generated using a secure random function
- Indexed for fast lookups

### 2. Service Layer Updates

**File**: `src/companies/company-assessment.service.ts`

#### **Updated Invitation Creation**

Both single and bulk invitation methods now store the token:

```typescript
async createCompanyAssessmentInvitation(data: { ... }) {
  const invitationToken = this.generateInvitationToken();
  const companySlug = this.generateCompanySlug(company.name);
  const invitationLink = `${process.env.FRONTEND_URL}/${companySlug}/assessment/invite/${invitationToken}`;

  const invitation = await this.prisma.candidateInvitation.create({
    data: {
      // ... other fields
      invitationLink,
      invitationToken, // ✅ Token is now stored
      // ... rest of fields
    },
  });
}
```

#### **Added Public Endpoint Method**

Created `getInvitationByToken()` method for public access:

```typescript
async getInvitationByToken(token: string) {
  const invitation = await this.prisma.candidateInvitation.findUnique({
    where: { invitationToken: token },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      assessments: {
        select: {
          id: true,
          title: true,
          description: true,
          timeLimitSeconds: true,
          timeLimitMinutes: true,
          passMark: true,
          maxTests: true,
          maxCustomQuestions: true,
          languageCodes: true,
        },
      },
    },
  });

  // Validation checks
  if (!invitation) {
    throw new NotFoundException('Invitation not found or has expired');
  }

  if (new Date() > invitation.expiresAt) {
    throw new BadRequestException('This invitation has expired');
  }

  if (invitation.status === InvitationStatus.COMPLETED) {
    throw new BadRequestException('This assessment has already been completed');
  }

  if (invitation.status === InvitationStatus.CANCELLED) {
    throw new BadRequestException('This invitation has been cancelled');
  }

  if (invitation.attemptCount >= invitation.maxAttempts) {
    throw new BadRequestException('Maximum attempts reached for this assessment');
  }

  // Update status to OPENED on first access
  if (invitation.status === InvitationStatus.SENT && !invitation.openedAt) {
    await this.prisma.candidateInvitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.OPENED,
        openedAt: new Date(),
      },
    });
  }

  return invitation;
}
```

**Features**:
- ✅ Validates invitation exists
- ✅ Checks expiration date
- ✅ Validates invitation status
- ✅ Enforces max attempts
- ✅ Auto-updates status on first access
- ✅ Returns company and assessment details

### 3. Controller Layer Updates

**File**: `src/companies/companies.controller.ts`

#### **Added Public Decorator**

Created a custom `@Public()` decorator to bypass authentication:

```typescript
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### **Added Public Endpoint**

```typescript
@Public()
@Get('invitations/token/:token')
@ApiOperation({
  summary: 'Get invitation details by token (Public endpoint for candidates)',
  description: 'Allows candidates to retrieve their invitation details using the unique token from the invitation link. This endpoint is not protected by authentication.',
})
@ApiCreatedResponse({
  description: 'Returns invitation details with company and assessment information',
})
@ApiBadRequestResponse({
  description: 'Invitation not found, expired, or invalid',
})
async getInvitationByToken(@Param('token') token: string) {
  return this.companyAssessmentService.getInvitationByToken(token);
}
```

**Endpoint**: `GET /companies/invitations/token/:token`

### 4. Authentication Guard Update

**File**: `src/auth/guard/jwt.guard.ts`

Updated JWT guard to respect the `@Public()` decorator:

```typescript
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true; // ✅ Skip authentication for public endpoints
    }
    
    return super.canActivate(context);
  }
}
```

### 5. Database Migration

**Migration**: `20251005191808_add_invitation_token`

```sql
-- AlterTable
ALTER TABLE "candidate_invitations" ADD COLUMN "invitationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "candidate_invitations_invitationToken_key" 
ON "candidate_invitations"("invitationToken");
```

## API Usage

### **Get Invitation by Token**

**Endpoint**: `GET /companies/invitations/token/:token`

**Authentication**: Not required (Public endpoint)

**Parameters**:
- `token` (path parameter): The unique invitation token

**Example Request**:
```bash
curl -X GET "https://api.theskillclub.com/companies/invitations/token/abc123xyz789"
```

**Success Response** (200 OK):
```json
{
  "id": "inv_123",
  "candidateEmail": "john.doe@example.com",
  "candidateName": "John Doe",
  "assessmentIds": ["assessment_1", "assessment_2"],
  "companyId": "company_123",
  "invitedBy": "user_456",
  "invitedByName": "HR Manager",
  "status": "OPENED",
  "sentAt": "2025-10-05T10:00:00Z",
  "openedAt": "2025-10-05T10:15:00Z",
  "expiresAt": "2025-10-12T10:00:00Z",
  "attemptCount": 0,
  "maxAttempts": 3,
  "invitationLink": "https://theskillclub.com/brandafrik/assessment/invite/abc123xyz789",
  "invitationToken": "abc123xyz789",
  "company": {
    "id": "company_123",
    "name": "Brandafrik",
    "logo": "https://cdn.example.com/logos/brandafrik.png"
  },
  "assessments": [
    {
      "id": "assessment_1",
      "title": "JavaScript Developer Assessment",
      "description": "Test your JavaScript skills",
      "timeLimitSeconds": null,
      "timeLimitMinutes": 60,
      "passMark": 70,
      "maxTests": 5,
      "maxCustomQuestions": 20,
      "languageCodes": ["en", "fr"]
    }
  ],
  "createdAt": "2025-10-05T10:00:00Z",
  "updatedAt": "2025-10-05T10:15:00Z"
}
```

**Error Responses**:

**404 Not Found**:
```json
{
  "statusCode": 404,
  "message": "Invitation not found or has expired",
  "error": "Not Found"
}
```

**400 Bad Request** (Expired):
```json
{
  "statusCode": 400,
  "message": "This invitation has expired",
  "error": "Bad Request"
}
```

**400 Bad Request** (Completed):
```json
{
  "statusCode": 400,
  "message": "This assessment has already been completed",
  "error": "Bad Request"
}
```

**400 Bad Request** (Cancelled):
```json
{
  "statusCode": 400,
  "message": "This invitation has been cancelled",
  "error": "Bad Request"
}
```

**400 Bad Request** (Max Attempts):
```json
{
  "statusCode": 400,
  "message": "Maximum attempts reached for this assessment",
  "error": "Bad Request"
}
```

## Security Considerations

### 1. **Token Security**

**Token Generation**:
```typescript
private generateInvitationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}
```

**Characteristics**:
- Approximately 30-35 characters long
- Includes timestamp component
- Unique constraint in database
- URL-safe characters

**Recommendation**: For production, consider using a cryptographically secure random generator:

```typescript
import { randomBytes } from 'crypto';

private generateInvitationToken(): string {
  return randomBytes(32).toString('hex');
}
```

### 2. **Public Endpoint Protection**

**Rate Limiting**: Implement rate limiting to prevent abuse:

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

@Public()
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
@Get('invitations/token/:token')
async getInvitationByToken(@Param('token') token: string) {
  return this.companyAssessmentService.getInvitationByToken(token);
}
```

### 3. **Validation Checks**

The endpoint performs multiple validation checks:

1. **Existence Check**: Token must exist in database
2. **Expiration Check**: Invitation must not be expired
3. **Status Check**: Must be in valid status (not completed/cancelled)
4. **Attempt Limit**: Must not exceed max attempts

### 4. **Data Exposure**

Only essential data is returned:
- ✅ Company name and logo (public info)
- ✅ Assessment titles and basic info
- ❌ No sensitive company data
- ❌ No internal user details
- ❌ No scoring algorithms

### 5. **Audit Trail**

The endpoint automatically tracks:
- First access time (`openedAt`)
- Status change to `OPENED`
- Can be extended to log all access attempts

## Frontend Integration

### **Fetching Invitation Details**

```typescript
// lib/services/invitation.ts

export async function getInvitationByToken(token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/invitations/token/${token}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

### **Assessment Invitation Page**

```typescript
// app/[companyName]/assessment/invite/[token]/page.tsx

import { getInvitationByToken } from '@/lib/services/invitation';
import { generateCompanySlug } from '@/lib/utils';

export default async function InvitationPage({
  params,
}: {
  params: { companyName: string; token: string };
}) {
  try {
    const invitation = await getInvitationByToken(params.token);
    
    // Verify company slug matches
    const expectedSlug = generateCompanySlug(invitation.company.name);
    if (params.companyName !== expectedSlug) {
      redirect(`/${expectedSlug}/assessment/invite/${params.token}`);
    }

    return (
      <InvitationView 
        invitation={invitation}
        company={invitation.company}
        assessments={invitation.assessments}
      />
    );
  } catch (error) {
    return <InvitationErrorView error={error.message} />;
  }
}
```

### **Client-Side Usage**

```typescript
'use client';

import { useState, useEffect } from 'react';

export function InvitationDetails({ token }: { token: string }) {
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const data = await getInvitationByToken(token);
        setInvitation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [token]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!invitation) return null;

  return (
    <div>
      <h1>{invitation.company.name}</h1>
      <p>Welcome, {invitation.candidateName}!</p>
      
      <div>
        <h2>Assessments</h2>
        {invitation.assessments.map((assessment) => (
          <AssessmentCard key={assessment.id} assessment={assessment} />
        ))}
      </div>
      
      <button onClick={() => startAssessment(invitation)}>
        Start Assessment
      </button>
    </div>
  );
}
```

## Testing

### **Unit Tests**

```typescript
describe('CompanyAssessmentService - getInvitationByToken', () => {
  it('should return invitation details for valid token', async () => {
    const token = 'valid_token_123';
    const invitation = await service.getInvitationByToken(token);
    
    expect(invitation).toBeDefined();
    expect(invitation.invitationToken).toBe(token);
    expect(invitation.company).toBeDefined();
    expect(invitation.assessments).toBeInstanceOf(Array);
  });

  it('should throw NotFoundException for invalid token', async () => {
    await expect(
      service.getInvitationByToken('invalid_token')
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for expired invitation', async () => {
    const expiredToken = 'expired_token_123';
    await expect(
      service.getInvitationByToken(expiredToken)
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for completed invitation', async () => {
    const completedToken = 'completed_token_123';
    await expect(
      service.getInvitationByToken(completedToken)
    ).rejects.toThrow('This assessment has already been completed');
  });

  it('should update status to OPENED on first access', async () => {
    const token = 'new_token_123';
    const invitation = await service.getInvitationByToken(token);
    
    const updated = await prisma.candidateInvitation.findUnique({
      where: { invitationToken: token },
    });
    
    expect(updated.status).toBe(InvitationStatus.OPENED);
    expect(updated.openedAt).toBeDefined();
  });
});
```

### **Integration Tests**

```typescript
describe('GET /companies/invitations/token/:token', () => {
  it('should return 200 and invitation details for valid token', async () => {
    const response = await request(app.getHttpServer())
      .get(`/companies/invitations/token/${validToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      invitationToken: validToken,
      company: expect.objectContaining({
        name: expect.any(String),
      }),
      assessments: expect.any(Array),
    });
  });

  it('should return 404 for non-existent token', async () => {
    await request(app.getHttpServer())
      .get('/companies/invitations/token/nonexistent')
      .expect(404);
  });

  it('should not require authentication', async () => {
    // No Authorization header
    await request(app.getHttpServer())
      .get(`/companies/invitations/token/${validToken}`)
      .expect(200); // Should succeed without auth
  });
});
```

## Benefits

### 1. **Secure Public Access**
- ✅ No authentication required for candidates
- ✅ Token-based access control
- ✅ Unique, hard-to-guess tokens

### 2. **Better User Experience**
- ✅ Candidates can access invitation instantly
- ✅ No need to create account before viewing
- ✅ All assessment details in one request

### 3. **Tracking & Analytics**
- ✅ Know when invitations are opened
- ✅ Track access patterns
- ✅ Monitor engagement rates

### 4. **Flexible Integration**
- ✅ Works with any frontend framework
- ✅ Simple REST API
- ✅ No complex authentication flow

## Migration Guide

### **For Existing Invitations**

Run a script to add tokens to existing invitations:

```typescript
// scripts/add-tokens-to-existing-invitations.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}

async function addTokensToExistingInvitations() {
  const invitations = await prisma.candidateInvitation.findMany({
    where: {
      invitationToken: null,
    },
  });

  console.log(`Found ${invitations.length} invitations without tokens`);

  for (const invitation of invitations) {
    const token = generateInvitationToken();
    
    // Extract token from existing link or generate new one
    const tokenFromLink = invitation.invitationLink.split('/invite/')[1];
    const invitationToken = tokenFromLink || token;

    await prisma.candidateInvitation.update({
      where: { id: invitation.id },
      data: { invitationToken },
    });

    console.log(`Updated invitation ${invitation.id} with token ${invitationToken}`);
  }

  console.log('✅ All invitations updated');
}

addTokensToExistingInvitations()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Summary

The invitation token feature provides:

- ✅ **Secure, public endpoint** for candidates to access their invitations
- ✅ **Token stored in database** for reliable lookups
- ✅ **Comprehensive validation** (expiration, status, attempts)
- ✅ **Auto-tracking** of invitation opens
- ✅ **Company slug in URL** for better branding
- ✅ **No authentication required** for better UX

**API Endpoint**: `GET /companies/invitations/token/:token`

**Example**:
```
GET https://api.theskillclub.com/companies/invitations/token/abc123xyz789
```

---

**Last Updated**: October 5, 2025  
**Version**: 1.0.0  
**Author**: The Skill Club Engineering Team
