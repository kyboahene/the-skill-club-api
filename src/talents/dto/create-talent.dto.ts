import { AcademicYear, Profession, WorkMode } from '@prisma/client';
import { IsString, IsOptional, IsArray, IsObject, IsEnum } from 'class-validator';

export class CreateTalentDto {  
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  country?: string;
  
  @IsString()
  @IsOptional()
  gitPortWebsite?: string;
  
  @IsString()
  @IsOptional()
  resume?: string;

   @IsString()
   @IsOptional()
   linkedIn?: string;

   @IsOptional()
   @IsEnum(Profession)
   profession?: Profession;

   @IsString()
   @IsOptional()
   university?: string;
   
   @IsOptional()
   @IsEnum(AcademicYear)
   year?: AcademicYear;

   @IsOptional()
   @IsEnum(WorkMode)
   mode?: WorkMode[];
}