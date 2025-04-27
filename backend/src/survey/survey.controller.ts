import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';
import { QuerySurveyDto } from './dto/query-survey.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)  // 临时注释认证守卫进行测试
  create(@Body() createSurveyDto: CreateSurveyDto) {
    return this.surveyService.create(createSurveyDto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard)  // 临时注释认证守卫进行测试
  findAll(@Query() queryDto: QuerySurveyDto) {
    return this.surveyService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surveyService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateSurveyDto: UpdateSurveyDto) {
    return this.surveyService.update(+id, updateSurveyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.surveyService.remove(+id);
  }

  @Post(':id/toggle-collect')
  @UseGuards(JwtAuthGuard)
  toggleCollectStatus(@Param('id') id: string) {
    return this.surveyService.toggleCollectStatus(+id);
  }

  @Post('responses')
  createResponse(@Body() createResponseDto: CreateSurveyResponseDto, @Req() req: Request) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.surveyService.createResponse(createResponseDto, ipAddress, userAgent);
  }

  @Get(':id/responses')
  @UseGuards(JwtAuthGuard)
  getResponses(@Param('id') id: string) {
    return this.surveyService.getResponses(+id);
  }
  
  @Get(':id/analysis')
  @UseGuards(JwtAuthGuard)
  async getResponseAnalysis(@Param('id') id: string) {
    const data = await this.surveyService.getResponseAnalysis(+id);
    return {
      code: 200,
      data,
      message: '获取问卷分析数据成功'
    };
  }
} 