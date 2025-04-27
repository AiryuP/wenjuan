import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerItem {
  @IsNotEmpty()
  questionId: string;

  // 答案可以是字符串、数字、布尔值或数组
  answer: any;
}

export class CreateSurveyResponseDto {
  @IsNumber()
  @IsNotEmpty()
  surveyId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItem)
  answers: AnswerItem[];
} 