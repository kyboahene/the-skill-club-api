import { PartialType } from '@nestjs/swagger';
import { CreateCompanyAssessmentDto } from './company-assessments.dto';

export class UpdateCompanyAssessmentDto  extends PartialType(CreateCompanyAssessmentDto){
  
}