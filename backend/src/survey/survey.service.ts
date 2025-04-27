import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { Survey } from '../entities/survey.entity';
import { SurveyResponse } from '../entities/survey-response.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';
import { QuerySurveyDto } from './dto/query-survey.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(SurveyResponse)
    private surveyResponseRepository: Repository<SurveyResponse>,
  ) {}

  // 创建问卷
  async create(createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const survey = this.surveyRepository.create(createSurveyDto);
    
    if (createSurveyDto.isPublished) {
      survey.status = 1; // 已发布
      survey.isCollecting = true;
    } else {
      survey.status = 0; // 草稿
      survey.isCollecting = false;
    }
    
    return this.surveyRepository.save(survey);
  }

  // 获取问卷列表
  async findAll(queryDto: QuerySurveyDto): Promise<{ items: Survey[]; total: number }> {
    const { title, categoryId, status, isCollecting, tags, startDate, endDate, pageNum = 1, pageSize = 10 } = queryDto;
    
    const skip = (pageNum - 1) * pageSize;
    const take = pageSize;
    
    const whereConditions: FindOptionsWhere<Survey> = {};
    
    if (title) {
      whereConditions.title = Like(`%${title}%`);
    }
    
    if (categoryId !== undefined) {
      whereConditions.categoryId = categoryId;
    }
    
    if (status !== undefined) {
      whereConditions.status = status;
    }
    
    if (isCollecting !== undefined) {
      whereConditions.isCollecting = isCollecting;
    }
    
    // 日期范围查询
    if (startDate && endDate) {
      whereConditions.createdAt = Between(new Date(startDate), new Date(endDate));
    }
    
    // 查询并返回分页结果
    const [items, total] = await this.surveyRepository.findAndCount({
      where: whereConditions,
      order: { createdAt: 'DESC' },
      skip,
      take,
      relations: ['category'],
    });
    
    return { items, total };
  }

  // 获取单个问卷
  async findOne(id: number): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    
    if (!survey) {
      throw new NotFoundException(`问卷ID ${id} 不存在`);
    }
    
    return survey;
  }

  // 更新问卷
  async update(id: number, updateSurveyDto: UpdateSurveyDto): Promise<Survey> {
    // 先检查问卷是否存在
    const survey = await this.findOne(id);
    
    // 更新isPublished时同步更新status和isCollecting
    if (updateSurveyDto.isPublished !== undefined) {
      if (updateSurveyDto.isPublished) {
        updateSurveyDto.status = 1; // 已发布
        updateSurveyDto.isCollecting = true;
      } else {
        updateSurveyDto.status = 0; // 草稿
        updateSurveyDto.isCollecting = false;
      }
    }
    
    // 合并更新数据
    this.surveyRepository.merge(survey, updateSurveyDto);
    
    return this.surveyRepository.save(survey);
  }

  // 删除问卷
  async remove(id: number): Promise<void> {
    const result = await this.surveyRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`问卷ID ${id} 不存在`);
    }
  }

  // 切换问卷收集状态
  async toggleCollectStatus(id: number): Promise<Survey> {
    const survey = await this.findOne(id);
    
    // 只有已发布的问卷才能切换收集状态
    if (survey.status !== 1) {
      throw new BadRequestException('只有已发布的问卷才能切换收集状态');
    }
    
    survey.isCollecting = !survey.isCollecting;
    
    return this.surveyRepository.save(survey);
  }

  // 创建问卷回复
  async createResponse(
    createResponseDto: CreateSurveyResponseDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SurveyResponse> {
    // 检查问卷是否存在
    const survey = await this.findOne(createResponseDto.surveyId);
    
    // 检查问卷是否处于可收集状态
    if (survey.status !== 1 || !survey.isCollecting) {
      throw new BadRequestException('该问卷当前不可回答');
    }
    
    // 创建回复记录
    const response = this.surveyResponseRepository.create({
      surveyId: createResponseDto.surveyId,
      answers: createResponseDto.answers,
      ipAddress,
      userAgent,
    });
    
    // 保存回复并增加问卷的回复计数
    const savedResponse = await this.surveyResponseRepository.save(response);
    
    // 更新问卷的回复计数
    survey.respondentCount += 1;
    await this.surveyRepository.save(survey);
    
    return savedResponse;
  }

  // 获取问卷回复列表
  async getResponses(surveyId: number): Promise<SurveyResponse[]> {
    // 先检查问卷是否存在
    await this.findOne(surveyId);
    
    return this.surveyResponseRepository.find({
      where: { surveyId },
      order: { createdAt: 'DESC' },
    });
  }

  // 获取问卷回复统计分析
  async getResponseAnalysis(surveyId: number): Promise<any> {
    // 先检查问卷是否存在
    const survey = await this.findOne(surveyId);
    
    // 获取所有回复
    const responses = await this.surveyResponseRepository.find({
      where: { surveyId },
    });
    
    if (responses.length === 0) {
      return {
        surveyInfo: {
          id: survey.id,
          title: survey.title,
          respondentCount: 0,
        },
        questionStats: [],
        timeDistribution: [],
      };
    }
    
    // 解析问卷问题
    const questions = survey.questions || [];
    
    // 初始化问题统计数据
    const questionStats = questions.map(question => {
      const stats = {
        id: question.id,
        title: question.title,
        type: question.type,
      };
      
      // 根据问题类型初始化数据
      switch (question.type) {
        case 'radio':
        case 'checkbox':
          stats['options'] = {};
          question.options.forEach(opt => {
            stats['options'][opt.value] = {
              label: opt.label,
              count: 0
            };
          });
          break;
        case 'text':
          stats['answers'] = [];
          break;
        case 'rate':
          stats['rateDistribution'] = {};
          for (let i = 1; i <= (question.max || 5); i++) {
            stats['rateDistribution'][i] = 0;
          }
          stats['averageRate'] = 0;
          break;
      }
      
      return stats;
    });
    
    // 时间分布数据
    const timeDistribution = {};
    
    // 处理每个回复
    let totalRate = {};
    let rateCount = {};
    
    responses.forEach(response => {
      // 时间分布
      const date = new Date(response.createdAt).toISOString().split('T')[0];
      timeDistribution[date] = (timeDistribution[date] || 0) + 1;
      
      // 处理问题答案
      response.answers.forEach(answer => {
        const { questionId, answer: answerValue } = answer;
        
        // 查找对应问题的统计数据
        const questionStat = questionStats.find(q => q.id === questionId);
        if (!questionStat) return;
        
        // 根据问题类型处理答案
        switch (questionStat.type) {
          case 'radio':
            if (answerValue && questionStat.options[answerValue]) {
              questionStat.options[answerValue].count++;
            }
            break;
          case 'checkbox':
            if (Array.isArray(answerValue)) {
              answerValue.forEach(val => {
                if (questionStat.options[val]) {
                  questionStat.options[val].count++;
                }
              });
            }
            break;
          case 'text':
            if (answerValue && typeof answerValue === 'string') {
              questionStat.answers.push(answerValue);
            }
            break;
          case 'rate':
            if (typeof answerValue === 'number' && answerValue > 0) {
              questionStat.rateDistribution[answerValue]++;
              
              // 计算平均分
              totalRate[questionId] = (totalRate[questionId] || 0) + answerValue;
              rateCount[questionId] = (rateCount[questionId] || 0) + 1;
            }
            break;
        }
      });
    });
    
    // 计算评分题的平均分
    questionStats.forEach(stat => {
      if (stat.type === 'rate' && rateCount[stat.id]) {
        stat.averageRate = Number((totalRate[stat.id] / rateCount[stat.id]).toFixed(1));
      }
    });
    
    // 转换时间分布为数组格式
    const timeDistributionArray = Object.entries(timeDistribution).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      surveyInfo: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        respondentCount: responses.length,
      },
      questionStats,
      timeDistribution: timeDistributionArray,
    };
  }
} 