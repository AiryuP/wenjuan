import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionOption {
  @IsString()
  value: string;

  @IsString()
  label: string;
}

class BaseQuestion {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsBoolean()
  required: boolean;

  @IsBoolean()
  @IsOptional()
  showIndex?: boolean;
}

class RadioQuestion extends BaseQuestion {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOption)
  options: QuestionOption[];
}

class CheckboxQuestion extends BaseQuestion {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOption)
  options: QuestionOption[];
}

class TextQuestion extends BaseQuestion {
  @IsString()
  @IsOptional()
  placeholder?: string;
}

class RateQuestion extends BaseQuestion {
  @IsNumber()
  @IsOptional()
  max?: number;

  @IsNumber()
  @IsOptional()
  defaultValue?: number;
}

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BaseQuestion, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: RadioQuestion, name: 'radio' },
        { value: CheckboxQuestion, name: 'checkbox' },
        { value: TextQuestion, name: 'text' },
        { value: RateQuestion, name: 'rate' },
      ],
    },
  })
  questions: (RadioQuestion | CheckboxQuestion | TextQuestion | RateQuestion)[];

  @IsArray()
  @IsOptional()
  tags?: number[];
} 