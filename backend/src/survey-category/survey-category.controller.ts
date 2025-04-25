import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { SurveyCategoryService } from './survey-category.service';
import { SurveyCategory } from './survey-category.entity';
import { CreateSurveyCategoryDto, UpdateSurveyCategoryDto } from './dto/survey-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

@Controller('survey-categories')
export class SurveyCategoryController {
  constructor(private readonly surveyCategoryService: SurveyCategoryService) {}

  @Get()
  async findAll(): Promise<ApiResponse<SurveyCategory[]>> {
    const data = await this.surveyCategoryService.findAll();
    return {
      code: 200,
      data,
      message: '获取分类列表成功'
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<SurveyCategory>> {
    const data = await this.surveyCategoryService.findOne(+id);
    if (!data) {
      throw new NotFoundException(`ID为${id}的分类不存在`);
    }
    return {
      code: 200,
      data,
      message: '获取分类详情成功'
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCategoryDto: CreateSurveyCategoryDto): Promise<ApiResponse<SurveyCategory>> {
    console.log('收到的分类创建数据:', createCategoryDto);
    
    try {
      const data = await this.surveyCategoryService.create(createCategoryDto);
      return {
        code: 200,
        data,
        message: '创建分类成功'
      };
    } catch (error) {
      console.error('创建分类失败:', error);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateSurveyCategoryDto,
  ): Promise<ApiResponse<SurveyCategory>> {
    const data = await this.surveyCategoryService.update(+id, updateCategoryDto);
    return {
      code: 200,
      data,
      message: '更新分类成功'
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    // 检查记录是否存在
    const category = await this.surveyCategoryService.findOne(+id);
    if (!category) {
      throw new NotFoundException(`ID为${id}的分类不存在`);
    }
    await this.surveyCategoryService.remove(+id);
    return {
      code: 200,
      data: null,
      message: '删除分类成功'
    };
  }
}