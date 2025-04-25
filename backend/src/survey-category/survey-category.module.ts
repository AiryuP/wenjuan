import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyCategory } from './survey-category.entity';
import { SurveyCategoryController } from './survey-category.controller';
import { SurveyCategoryService } from './survey-category.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SurveyCategory]),
    AuthModule
  ],
  controllers: [SurveyCategoryController],
  providers: [SurveyCategoryService],
  exports: [SurveyCategoryService],
})
export class SurveyCategoryModule {}