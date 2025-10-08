import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCompanyAssessmentDto } from './company-assessments.dto';

// Omit ownerCompanyId and createdBy from updates - these are set during creation
export class UpdateCompanyAssessmentDto extends PartialType(
  OmitType(CreateCompanyAssessmentDto, ['ownerCompanyId', 'createdBy'] as const)
) {}