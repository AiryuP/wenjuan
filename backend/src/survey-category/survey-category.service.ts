import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyCategory } from './survey-category.entity';

@Injectable()
export class SurveyCategoryService {
  constructor(
    @InjectRepository(SurveyCategory)
    private surveyCategoryRepository: Repository<SurveyCategory>,
  ) {}

  async findAll(): Promise<SurveyCategory[]> {
    return this.surveyCategoryRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number): Promise<SurveyCategory | null> {
    return this.surveyCategoryRepository.findOne({ where: { id, isActive: true } });
  }

  async create(categoryData: Partial<SurveyCategory>): Promise<SurveyCategory> {
    const category = this.surveyCategoryRepository.create(categoryData);
    return this.surveyCategoryRepository.save(category);
  }

  async update(id: number, categoryData: Partial<SurveyCategory>): Promise<SurveyCategory> {
    await this.surveyCategoryRepository.update(id, categoryData);
    const updatedCategory = await this.findOne(id);
    if (!updatedCategory) {
      throw new NotFoundException(`分类ID为${id}的记录不存在`);
    }
    return updatedCategory;
  }

  async remove(id: number): Promise<void> {
    // 软删除，只是将isActive设置为false
    await this.surveyCategoryRepository.update(id, { isActive: false });
  }
}