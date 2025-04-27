import { CreateSurveyDto } from './create-survey.dto';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateSurveyDto extends CreateSurveyDto {
  @IsNumber()
  @IsOptional()
  status?: number;
  
  @IsBoolean()
  @IsOptional()
  isCollecting?: boolean;
} 