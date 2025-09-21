# Enhanced Role System Documentation

## Overview

The enhanced role system provides a flexible, context-aware authorization framework that eliminates the need for separate Admin and CompanyUser models. Instead, it uses a unified User model with dynamic role assignments across different contexts.

## Key Features

### 1. Context-Aware Roles
Roles can be assigned in different contexts:
- **PLATFORM**: Global platform roles (super_admin, platform_admin)
- **COMPANY**: Company-specific roles (company_admin, recruiter, hr_manager)
- **TALENT**: Talent-specific roles (verified_talent, premium_talent)

### 2. Unified User Model
- Single User model for all user types
- Dynamic role assignments
- Multi-company support through CompanyMembership
- Enhanced user status and preferences

### 3. Flexible Permission System
- Granular permissions with categories
- Role templates for easy replication
- Custom company-specific roles

## Database Schema Changes

### Modified Models

#### User Model
```prisma
model User {
  id              String     @id @default(cuid())
  email           String     @unique
  name            String?
  phone           String?
  password        String?
  status          UserStatus @default(ACTIVE)
  refreshToken    String?
  lastLoginAt     DateTime?
  emailVerified   Boolean    @default(false)
  emailVerifiedAt DateTime?
  preferences     Json?      // User preferences, settings
  
  // Dynamic role system
  roles           Role[]
  
  // Profile Relations
  talent          Talent?
  
  // Company Relations
  companyMemberships CompanyMembership[]
}
```

#### Enhanced Role Model
```prisma
model Role {
  id          String       @id @default(uuid())
  name        String
  description String?
  context     RoleContext? // Defines where this role applies
  contextId   String?      // ID of the context (companyId for company roles)
  isSystem    Boolean      @default(false) // System roles vs custom roles
  
  users       User[]
  permissions Permission[]
  
  @@unique([name, context, contextId]) // Allow same role name in different contexts
}
```

#### Enhanced Permission Model
```prisma
model Permission {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  category    String?  // Group permissions (e.g., "jobs", "assessments", "users")
  
  roles       Role[]
}
```

#### CompanyMembership Model
```prisma
model CompanyMembership {
  id          String    @id @default(cuid())
  userId      String
  companyId   String
  invitedBy   String?
  invitedAt   DateTime?
  joinedAt    DateTime? // When they accepted invitation
  leftAt      DateTime? // When they left the company
  isActive    Boolean   @default(true)
  metadata    Json?     // Company-specific user data, preferences
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  company     Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  inviter     User?     @relation("InvitedBy", fields: [invitedBy], references: [id], onDelete: SetNull)
  
  @@unique([userId, companyId])
}
```

### Removed Models
- `Admin` model (replaced by platform roles)
- `CompanyUser` model (replaced by CompanyMembership)

### New Enums
```prisma
enum RoleContext {
  PLATFORM    // Global platform roles
  COMPANY     // Company-specific roles
  TALENT      // Talent-specific roles
}

enum UserStatus {
  ACTIVE
  INACTIVE
  PENDING
  SUSPENDED
}
```

## Role System Usage

### 1. System Roles (Seeded)

#### Platform Roles
- **super_admin**: Full platform access (all permissions)
- **platform_admin**: Platform administration (role/permission management)

#### Company Role Templates
- **company_admin**: Company administrator template
- **recruiter**: Recruiter role template
- **hr_manager**: HR manager role template

#### Talent Roles
- **verified_talent**: Basic talent permissions
- **premium_talent**: Enhanced talent features

### 2. RoleService Helper Methods

```typescript
// Check permission in specific context
await roleService.hasPermission(userId, 'manage_jobs', {
  type: 'COMPANY',
  id: companyId
});

// Add user to company with role
await roleService.addUserToCompany(userId, companyId, 'company_admin', inviterId);

// Get user's company roles
await roleService.getUserCompanyRoles(userId, companyId);

// Create custom company role
await roleService.createCompanyRole(companyId, 'custom_role', 'Description', ['permission1', 'permission2']);
```

### 3. Enhanced Authentication Decorators

```typescript
// Platform admin only
@PlatformAuth(['manage_companies'])
@Get('admin/companies')
async getAllCompanies() {}

// Company admin or user with specific permissions
@CompanyAuth(['manage_jobs', 'view_candidates'])
@Get('company/:companyId/jobs')
async getCompanyJobs(@Param('companyId') companyId: string) {}

// Talent with specific permissions
@TalentAuth(['apply_to_jobs'])
@Post('jobs/:jobId/apply')
async applyToJob(@Param('jobId') jobId: string) {}

// Flexible permissions (OR logic)
@EnhancedAuth({
  permissions: ['view_job'],
  requireAllPermissions: false
})
@Get('jobs/:id')
async getJob(@Param('id') id: string) {}
```

## Migration Guide

### From Old System to New System

1. **User Migration**:
   - Remove `role` field from User
   - Add new fields: `emailVerified`, `emailVerifiedAt`, `preferences`
   - Migrate existing roles to new role assignments

2. **Role Assignment**:
   - Admin users → Platform roles (super_admin/platform_admin)
   - Company users → Company-specific roles + CompanyMembership
   - Talent users → Talent roles + optional CompanyMembership

3. **Permission Updates**:
   - Update all `@Auth` decorators to use new `@EnhancedAuth` system
   - Replace hardcoded role checks with permission-based checks
   - Update services to use RoleService helper methods

## Benefits

1. **Flexibility**: Users can have multiple roles across different contexts
2. **Scalability**: Easy to add new role types and contexts
3. **Maintainability**: Unified user model reduces complexity
4. **Multi-tenancy**: Native support for users across multiple companies
5. **Granular Control**: Fine-grained permission system
6. **Extensibility**: Easy to create custom roles and permissions

## Example Workflows

### Adding a User to Multiple Companies
```typescript
// User can be admin in Company A and recruiter in Company B
await roleService.addUserToCompany(userId, companyAId, 'company_admin');
await roleService.addUserToCompany(userId, companyBId, 'recruiter');
```

### Creating Custom Company Roles
```typescript
// Create a custom "Lead Developer" role for a specific company
await roleService.createCompanyRole(
  companyId,
  'lead_developer',
  'Senior technical role with code review permissions',
  ['manage_jobs', 'view_candidates', 'conduct_technical_interviews']
);
```

### Permission Checking
```typescript
// Check if user can manage jobs in specific company
const canManageJobs = await roleService.hasPermission(
  userId,
  'manage_jobs',
  { type: 'COMPANY', id: companyId }
);

// Check platform-level permissions
const isPlatformAdmin = await roleService.hasPermission(
  userId,
  'manage_companies',
  { type: 'PLATFORM' }
);
```

## Database Seeds

The system comes with pre-seeded data:
- **Super Admin**: admin@example.com / admin123
- **Talent User**: user@example.com / user123  
- **Company Admin**: admin@techcorp.com / companyadmin123
- **Sample Company**: Tech Corp

## Next Steps

1. Update existing controllers to use new authentication decorators
2. Migrate existing permission checks to use RoleService
3. Create custom roles as needed for specific business requirements
4. Implement role-based UI components in the frontend
5. Add role management interfaces for platform and company admins
