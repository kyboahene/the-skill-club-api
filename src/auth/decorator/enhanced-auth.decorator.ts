import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RoleContext } from '@prisma/client';
import { JwtGuard } from '../guard';
import { EnhancedPermissionGuard } from '../guard/enhanced-permission.guard';

export interface AuthOptions {
  permissions?: string[];
  context?: RoleContext;
  requireCompanyMembership?: boolean;
  requireAllPermissions?: boolean; // true = AND logic, false = OR logic
}

export const ENHANCED_AUTH_KEY = 'enhanced_auth';

export function EnhancedAuth(options: AuthOptions = {}) {
  return applyDecorators(
    SetMetadata(ENHANCED_AUTH_KEY, options),
    UseGuards(JwtGuard, EnhancedPermissionGuard), // Add your enhanced permission guard here
    ApiBearerAuth()
  );
}

// Convenience decorators for specific contexts
export function PlatformAuth(permissions: string[] = []) {
  return EnhancedAuth({
    permissions,
    context: 'PLATFORM'
  });
}

export function CompanyAuth(permissions: string[] = [], requireMembership = true) {
  return EnhancedAuth({
    permissions,
    context: 'COMPANY',
    requireCompanyMembership: requireMembership
  });
}

export function TalentAuth(permissions: string[] = []) {
  return EnhancedAuth({
    permissions,
    context: 'TALENT'
  });
}

// Usage examples:
/*
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

// Multiple contexts (user needs ANY of these)
@EnhancedAuth({
  permissions: ['view_job'],
  requireAllPermissions: false
})
@Get('jobs/:id')
async getJob(@Param('id') id: string) {}
*/
