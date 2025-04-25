import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateSurveyCategoryDto {
  @IsString()
  @MaxLength(100, { message: '分类名称不能超过100个字符' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '分类描述不能超过500个字符' })
  description?: string;
}

export class UpdateSurveyCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: '分类名称不能超过100个字符' })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '分类描述不能超过500个字符' })
  description?: string;
}