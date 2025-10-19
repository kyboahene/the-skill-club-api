import { IsArray, IsDateString, IsNumber, IsString, IsOptional, IsObject } from "class-validator";

export class AnswerDto {
    @IsString()
    questionId: string;

    @IsString()
    response: string;

    @IsNumber()
    timeSpent: number;

    @IsDateString()
    submittedAt: Date
}

export class AssessmentSubmissionDto {
    @IsString()
    assessmentId: string;

    @IsString()
    sessionId: string;

    @IsArray()
    answers: AnswerDto[];

    @IsNumber()
    totalTimeSpent: number;

    @IsOptional()
    @IsArray()
    violations?: any[];

    @IsOptional()
    @IsObject()
    deviceInfo?: any;

    @IsOptional()
    @IsObject()
    sessionBehavior?: any;

    @IsOptional()
    @IsArray()
    trackingData?: any[];
}
