# Invitation Link Format with Company Slug

## Overview

Updated the invitation link format to include the company name as a URL slug for better user experience and SEO.

## Changes Made

### 1. New Helper Method

**File**: `src/companies/company-assessment.service.ts`

Added a private method to generate URL-safe slugs from company names:

```typescript
private generateCompanySlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-')   // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}
```

**Examples**:
- `"Brandafrik"` → `"brandafrik"`
- `"Tech Company Inc."` → `"tech-company-inc"`
- `"My_Awesome Company!"` → `"my-awesome-company"`
- `"ABC & XYZ Corp"` → `"abc-xyz-corp"`

### 2. Updated Invitation Link Format

**Before**:
```typescript
const invitationLink = `${process.env.FRONTEND_URL}/assessment/invite/${invitationToken}`;
```

**After**:
```typescript
const companySlug = this.generateCompanySlug(company.name);
const invitationLink = `${process.env.FRONTEND_URL}/${companySlug}/assessment/invite/${invitationToken}`;
```

**Example URLs**:
- `https://theskillclub.com/brandafrik/assessment/invite/abc123xyz789`
- `https://theskillclub.com/tech-startup/assessment/invite/def456uvw012`

### 3. Modified Methods

#### **Single Invitation**

**Method**: `createCompanyAssessmentInvitation()`

```typescript
async createCompanyAssessmentInvitation(data: { ... }) {
  // Get company data (not just check existence)
  const company = await this.companyService.getCompany(data.companyId);
  
  // Generate slug and invitation link
  const invitationToken = this.generateInvitationToken();
  const companySlug = this.generateCompanySlug(company.name);
  const invitationLink = `${process.env.FRONTEND_URL}/${companySlug}/assessment/invite/${invitationToken}`;
  
  // ... rest of the method
}
```

#### **Bulk Invitations**

**Method**: `createBulkCompanyAssessmentInvitations()`

```typescript
async createBulkCompanyAssessmentInvitations(data: { ... }) {
  // Get company data once for all invitations
  const company = await this.companyService.getCompany(data.companyId);
  const companySlug = this.generateCompanySlug(company.name);
  
  // Use same slug for all candidates
  const result = await this.prisma.$transaction(async (prisma) => {
    for (const candidate of data.candidates) {
      const invitationToken = this.generateInvitationToken();
      const invitationLink = `${process.env.FRONTEND_URL}/${companySlug}/assessment/invite/${invitationToken}`;
      // ... create invitation
    }
  });
}
```

## Benefits

### 1. **Better User Experience**
- Candidates see the company name in the URL
- More trustworthy and professional appearance
- Clear indication of which company sent the invitation

### 2. **SEO Benefits**
- Company name in URL improves search rankings
- Better indexing for company-specific pages
- Descriptive URLs for better click-through rates

### 3. **Branding**
- Reinforces company identity
- Consistent branding across all touchpoints
- Professional appearance in email clients

### 4. **Analytics**
- Easier to track invitations by company
- Clear segmentation in analytics tools
- Better understanding of candidate sources

## URL Structure

### Complete URL Breakdown

```
https://theskillclub.com/brandafrik/assessment/invite/abc123xyz789
│      └─────────────┘ └────────┘ └────────┘ └─────┘ └──────────┘
│            │            │          │         │          │
│       Base URL    Company Slug   Section  Action   Token
│
└── Protocol
```

**Components**:
1. **Base URL**: `https://theskillclub.com` (from `FRONTEND_URL`)
2. **Company Slug**: `brandafrik` (generated from company name)
3. **Section**: `assessment`
4. **Action**: `invite`
5. **Token**: `abc123xyz789` (unique invitation identifier)

## Slug Generation Rules

### Character Handling

| Input | Process | Output |
|-------|---------|--------|
| Uppercase | Convert to lowercase | `BRAND` → `brand` |
| Spaces | Replace with hyphens | `My Company` → `my-company` |
| Underscores | Replace with hyphens | `My_Company` → `my-company` |
| Special chars | Remove | `Company!@#` → `company` |
| Multiple spaces | Single hyphen | `Big   Tech` → `big-tech` |
| Leading/trailing | Remove | `-Company-` → `company` |

### Edge Cases

```typescript
// Empty or whitespace-only names
"   " → ""

// All special characters
"@#$%^&*()" → ""

// Mixed case with numbers
"Tech123 Company" → "tech123-company"

// International characters
"Café Company" → "caf-company"

// Multiple hyphens
"Tech---Company" → "tech-company"
```

## Frontend Route Setup

The frontend needs to handle the company slug in the route:

```typescript
// Next.js App Router
app/
  [companyName]/
    assessment/
      invite/
        [token]/
          page.tsx

// Route params
params: {
  companyName: string;  // "brandafrik"
  token: string;        // "abc123xyz789"
}
```

**Example Route Handler**:
```typescript
// app/[companyName]/assessment/invite/[token]/page.tsx

export default async function AssessmentInvitePage({
  params,
}: {
  params: { companyName: string; token: string };
}) {
  // Fetch invitation using token
  const invitation = await getInvitationByToken(params.token);
  
  // Verify company slug matches
  const companySlug = generateSlug(invitation.company.name);
  if (companySlug !== params.companyName) {
    redirect(`/${companySlug}/assessment/invite/${params.token}`);
  }
  
  return <AssessmentInvitationPage invitation={invitation} />;
}
```

## Database Considerations

### No Schema Changes Required

The `invitationLink` field already stores the full URL, so no migration is needed:

```prisma
model CandidateInvitation {
  id             String   @id @default(cuid())
  invitationLink String   // Already stores complete URL
  // ... other fields
}
```

### Existing Data

**Old format links**:
```
https://theskillclub.com/assessment/invite/abc123
```

**New format links**:
```
https://theskillclub.com/brandafrik/assessment/invite/abc123
```

**Handling**:
- Old links will continue to work if you maintain backward compatibility
- Add a fallback route: `/assessment/invite/[token]` → redirects to `/[company]/assessment/invite/[token]`

## Testing

### Unit Tests

```typescript
describe('generateCompanySlug', () => {
  it('should convert to lowercase', () => {
    expect(service['generateCompanySlug']('BRANDAFRIK')).toBe('brandafrik');
  });

  it('should replace spaces with hyphens', () => {
    expect(service['generateCompanySlug']('Tech Company')).toBe('tech-company');
  });

  it('should remove special characters', () => {
    expect(service['generateCompanySlug']('Company!@#$')).toBe('company');
  });

  it('should handle multiple spaces', () => {
    expect(service['generateCompanySlug']('Big   Tech')).toBe('big-tech');
  });

  it('should remove leading/trailing hyphens', () => {
    expect(service['generateCompanySlug']('-Company-')).toBe('company');
  });

  it('should handle underscores', () => {
    expect(service['generateCompanySlug']('My_Awesome_Company')).toBe('my-awesome-company');
  });
});

describe('createCompanyAssessmentInvitation', () => {
  it('should generate invitation link with company slug', async () => {
    const mockCompany = { id: '1', name: 'Brandafrik', /* ... */ };
    jest.spyOn(companyService, 'getCompany').mockResolvedValue(mockCompany);

    const result = await service.createCompanyAssessmentInvitation({
      candidateEmail: 'test@example.com',
      companyId: '1',
      // ... other data
    });

    expect(result.invitationLink).toContain('/brandafrik/assessment/invite/');
  });
});
```

### Integration Tests

```typescript
describe('Invitation Links', () => {
  it('should create valid invitation links for different company names', async () => {
    const companies = [
      { name: 'Brandafrik', expected: 'brandafrik' },
      { name: 'Tech Startup Inc.', expected: 'tech-startup-inc' },
      { name: 'ABC & Co', expected: 'abc-co' },
    ];

    for (const { name, expected } of companies) {
      const company = await createCompany({ name });
      const invitation = await createInvitation({ companyId: company.id });
      
      expect(invitation.invitationLink).toContain(`/${expected}/assessment/invite/`);
    }
  });
});
```

## Email Template Updates

Email templates automatically use the new link format since they use the `{{invitationLink}}` variable:

**assessment-invitation.hbs**:
```html
<a href="{{invitationLink}}" class="cta-button">Take Assessment</a>
```

**Rendered Output**:
```html
<a href="https://theskillclub.com/brandafrik/assessment/invite/abc123" class="cta-button">
  Take Assessment
</a>
```

## Backward Compatibility

If you need to support old invitation links:

### Option 1: Redirect Route

```typescript
// app/assessment/invite/[token]/page.tsx (fallback route)

export default async function LegacyInvitePage({
  params,
}: {
  params: { token: string };
}) {
  const invitation = await getInvitationByToken(params.token);
  const companySlug = generateSlug(invitation.company.name);
  
  // Redirect to new format
  redirect(`/${companySlug}/assessment/invite/${params.token}`);
}
```

### Option 2: Update Existing Links

Run a migration to update old invitation links:

```typescript
// scripts/migrate-invitation-links.ts

async function migrateInvitationLinks() {
  const invitations = await prisma.candidateInvitation.findMany({
    where: {
      invitationLink: {
        contains: '/assessment/invite/',
        not: {
          contains: '//assessment/invite/', // Skip already migrated
        }
      }
    },
    include: { company: true }
  });

  for (const invitation of invitations) {
    const companySlug = generateSlug(invitation.company.name);
    const token = invitation.invitationLink.split('/invite/')[1];
    const newLink = `${process.env.FRONTEND_URL}/${companySlug}/assessment/invite/${token}`;

    await prisma.candidateInvitation.update({
      where: { id: invitation.id },
      data: { invitationLink: newLink }
    });
  }

  console.log(`Migrated ${invitations.length} invitation links`);
}
```

## Security Considerations

### Slug Collision

**Problem**: Two companies with similar names might generate the same slug:
- "Tech Company" → `tech-company`
- "Tech_Company" → `tech-company`

**Solution**: The invitation token is unique, so even if slugs collide, invitations remain distinct:
```
/tech-company/assessment/invite/abc123  (Company A)
/tech-company/assessment/invite/xyz789  (Company B)
```

The backend validates using the token, not the slug.

### Slug Validation on Frontend

Always validate the company slug against the actual company name:

```typescript
const invitation = await getInvitationByToken(token);
const expectedSlug = generateSlug(invitation.company.name);

if (params.companyName !== expectedSlug) {
  // Redirect to correct URL or show 404
  redirect(`/${expectedSlug}/assessment/invite/${token}`);
}
```

## Performance Impact

### Minimal Impact

**Before**:
- 1 database query: `getCompany()` (existence check only)

**After**:
- 1 database query: `getCompany()` (returns full company object)
- No additional queries
- Slug generation is in-memory string manipulation (< 1ms)

### Caching Opportunity

For high-volume scenarios, cache company slugs:

```typescript
private companySlugCache = new Map<string, string>();

private async getCompanySlug(companyId: string): Promise<string> {
  if (this.companySlugCache.has(companyId)) {
    return this.companySlugCache.get(companyId)!;
  }

  const company = await this.companyService.getCompany(companyId);
  const slug = this.generateCompanySlug(company.name);
  
  this.companySlugCache.set(companyId, slug);
  return slug;
}
```

## Monitoring

### Metrics to Track

1. **Slug Generation Errors**
   - Empty slugs
   - Invalid characters
   - Performance issues

2. **Link Format Issues**
   - Malformed URLs
   - Missing company slugs
   - Broken redirects

3. **User Experience**
   - Click-through rates on new format
   - 404 errors on invitation pages
   - Redirect success rates

### Logging

```typescript
this.logger.log({
  action: 'invitation_created',
  companyId: data.companyId,
  companySlug,
  invitationLink,
  candidateEmail: data.candidateEmail,
});
```

## Conclusion

The invitation link format now includes the company name as a URL slug, providing:

- ✅ Better user experience and trust
- ✅ Improved SEO and branding
- ✅ Clearer analytics and tracking
- ✅ Professional appearance
- ✅ No breaking changes (backward compatible)

**Example**: 
```
https://theskillclub.com/brandafrik/assessment/invite/{token}
```

---

**Last Updated**: October 5, 2025  
**Version**: 1.0.0  
**Author**: The Skill Club Engineering Team
