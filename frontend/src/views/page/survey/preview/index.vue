<template>
  <div class="survey-preview-container">
    <!-- 整体问卷面板 -->
    <div class="survey-paper">
      <!-- 顶部标题区域 -->
      <div class="preview-header">
        <h1 class="survey-title">{{ survey.title }}</h1>
        <div class="survey-meta" v-if="survey.categoryName">
          <el-tag size="small" effect="plain" class="category-tag">
            <el-icon><Folder /></el-icon>
            <span>{{ survey.categoryName }}</span>
          </el-tag>
        </div>
        <div class="survey-description" v-if="survey.description">
          {{ survey.description }}
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="preview-content">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
        
        <div v-else-if="!survey.questions || survey.questions.length === 0" class="no-questions">
          <el-empty description="该问卷暂无题目">
            <template #image>
              <el-icon class="empty-icon"><DocumentRemove /></el-icon>
            </template>
          </el-empty>
        </div>
        
        <div v-else>
          <!-- 问题列表 -->
          <div class="questions-list">
            <div v-for="(question, index) in survey.questions" :key="question.id" class="question-item">
              <div class="question-title">
                <span class="question-index">Q{{ index + 1 }}</span>
                <span class="question-text">{{ question.title }}</span>
                <el-tag v-if="question.required" size="small" type="danger" class="required-tag">必答</el-tag>
                <el-tag v-else size="small" type="info" class="required-tag">选答</el-tag>
              </div>
              
              <div class="question-body">
                <!-- 单选题 -->
                <template v-if="question.type === 'radio'">
                  <el-radio-group v-model="answers[question.id]" class="radio-options-group">
                    <div v-for="option in question.options" :key="option.value" class="option-item radio-option">
                      <el-radio :label="option.value">{{ option.label }}</el-radio>
                    </div>
                  </el-radio-group>
                </template>
                
                <!-- 多选题 -->
                <template v-else-if="question.type === 'checkbox'">
                  <el-checkbox-group v-model="answers[question.id]" class="checkbox-options-group">
                    <div v-for="option in question.options" :key="option.value" class="option-item checkbox-option">
                      <el-checkbox :label="option.value">{{ option.label }}</el-checkbox>
                    </div>
                  </el-checkbox-group>
                </template>
                
                <!-- 填空题 -->
                <template v-else-if="question.type === 'text'">
                  <el-input
                    v-model="answers[question.id]"
                    type="textarea"
                    :rows="3"
                    :placeholder="question.placeholder || '请输入您的回答'"
                  ></el-input>
                </template>
                
                <!-- 评分题 -->
                <template v-else-if="question.type === 'rate'">
                  <div class="rate-container">
                    <el-rate 
                      v-model="answers[question.id]" 
                      :max="question.max || 5"
                      show-score
                    ></el-rate>
                    <span class="rate-text" v-if="answers[question.id]">{{ answers[question.id] }} 分</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮区域 -->
          <div class="survey-actions">
            <el-button type="primary" @click="submitSurvey" :loading="submitting">
              <el-icon><Check /></el-icon> 提交问卷
            </el-button>
            <el-button @click="resetAnswers" type="info">
              <el-icon><RefreshRight /></el-icon> 重置
            </el-button>
            <el-button @click="goBack">
              <el-icon><Back /></el-icon> 返回
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import { Check, RefreshRight, Back, Folder, DocumentRemove } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const surveyId = route.params.id;
const loading = ref(true);
const submitting = ref(false);

// 添加类型定义
interface SurveyOption {
  value: string;
  label: string;
}

interface SurveyQuestion {
  id: string;
  type: string;
  title: string;
  required: boolean;
  options?: SurveyOption[];
  placeholder?: string;
  max?: number;
  defaultValue?: number;
}

interface SurveyData {
  id: string;
  title: string;
  description: string;
  categoryId?: string | number;
  categoryName?: string;
  isPublished?: boolean;
  status?: number;
  isCollecting?: boolean;
  respondentCount?: number;
  category?: { id: number; name: string; };
  questions: SurveyQuestion[];
}

// 问卷数据
const survey = reactive<SurveyData>({
  id: '',
  title: '',
  description: '',
  categoryId: '',
  categoryName: '',
  questions: []
});

// 用户答案
const answers = reactive<Record<string, any>>({});

// 获取问卷数据
const fetchSurvey = () => {
  loading.value = true;
  
  // 判断是从本地存储中获取预览数据还是从API获取
  if (route.path === '/survey/preview') {
    const previewData = localStorage.getItem('preview_survey');
    if (previewData) {
      try {
        const data = JSON.parse(previewData);
        Object.assign(survey, data);
        
        // 如果有分类ID但没有分类名称，尝试获取分类名称
        if (survey.categoryId && !survey.categoryName) {
          fetchCategoryName(survey.categoryId);
        } else {
          loading.value = false;
        }
        
        initAnswers();
      } catch (e) {
        ElMessage.error('无法解析预览数据');
        loading.value = false;
      }
    } else {
      ElMessage.warning('没有找到预览数据');
      goBack();
      loading.value = false;
    }
  } else {
    // 从API获取数据
    axios.get(`/api/surveys/${surveyId}`)
      .then(res => {
        if (res.data && res.data.code === 200) {
          Object.assign(survey, res.data.data);
          
          // 如果有分类ID但没有分类名称，尝试获取分类名称
          if (survey.categoryId && !survey.categoryName && survey.category) {
            survey.categoryName = survey.category.name;
            loading.value = false;
          } else if (survey.categoryId && !survey.categoryName) {
            fetchCategoryName(survey.categoryId);
          } else {
            loading.value = false;
          }
          
          initAnswers();
        } else {
          ElMessage.error(res.data?.message || '获取问卷数据失败');
          loading.value = false;
        }
      })
      .catch(err => {
        console.error('获取问卷数据失败', err);
        ElMessage.error(err.response?.data?.message || '获取问卷数据失败');
        loading.value = false;
      });
  }
};

// 获取分类名称
const fetchCategoryName = (categoryId: string | number) => {
  axios.get(`/api/survey-categories/${categoryId}`)
    .then(res => {
      const data = res.data;
      if (data && data.code === 200 && data.data) {
        survey.categoryName = data.data.name;
      }
    })
    .catch(err => {
      console.error('获取分类名称失败', err);
    })
    .finally(() => {
      // 完成请求后设置loading状态
      loading.value = false;
    });
};

// 初始化答案对象
const initAnswers = () => {
  if (survey.questions && Array.isArray(survey.questions)) {
    survey.questions.forEach(question => {
      if (question.type === 'checkbox') {
        answers[question.id] = [];
      } else if (question.type === 'rate') {
        answers[question.id] = question.defaultValue || 0;
      } else {
        answers[question.id] = '';
      }
    });
  }
};

// 验证答案
const validateAnswers = () => {
  if (!survey.questions || !Array.isArray(survey.questions)) {
    return false;
  }
  
  const requiredQuestions = survey.questions.filter(q => q.required);
  
  for (const question of requiredQuestions) {
    const answer = answers[question.id];
    
    if (question.type === 'checkbox' && (!answer || answer.length === 0)) {
      ElMessage.warning(`题目 "${question.title}" 为必答题，请填写`);
      return false;
    } else if (!answer && answer !== 0) {
      ElMessage.warning(`题目 "${question.title}" 为必答题，请填写`);
      return false;
    }
  }
  
  return true;
};

// 提交问卷
const submitSurvey = () => {
  if (!validateAnswers()) {
    return;
  }
  
  submitting.value = true;
  
  // 构建提交数据
  const submitData = {
    surveyId: Number(survey.id), // 确保ID是数字类型
    answers: Object.entries(answers).map(([questionId, answer]) => {
      return {
        questionId,
        answer
      };
    })
  };
  
  // 如果是从编辑器预览，则直接显示结果
  if (route.path === '/survey/preview') {
    submitting.value = false;
    ElMessageBox.alert('预览模式下，答案不会被提交，以下是收集到的答案:\n\n' + JSON.stringify(submitData, null, 2), '预览结果', {
      confirmButtonText: '确定'
    });
    return;
  }
  
  // 提交到API
  axios.post('/api/surveys/responses', submitData)
    .then(res => {
      if (res.data && res.data.code === 200) {
        ElMessage.success('提交成功，感谢您的参与！');
        resetAnswers();
        setTimeout(() => {
          goBack();
        }, 1500);
      } else {
        ElMessage.error(res.data?.message || '提交失败');
      }
    })
    .catch(err => {
      console.error('提交问卷失败', err);
      ElMessage.error(err.response?.data?.message || '提交问卷失败');
    })
    .finally(() => {
      // 完成请求后设置submitting状态
      submitting.value = false;
    });
};

// 重置答案
const resetAnswers = () => {
  initAnswers();
  ElMessage.info('已重置所有答案');
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchSurvey();
});
</script>

<style lang="scss" scoped>
.survey-preview-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  
  .survey-paper {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #409EFF, #67C23A);
    }
  }
  
  .preview-header {
    padding: 20px 24px;
    border-bottom: 1px solid #ebeef5;
    
    .survey-title {
      font-size: 22px;
      font-weight: bold;
      margin: 0 0 12px;
      color: #303133;
    }
    
    .survey-meta {
      margin-bottom: 10px;
      
      .category-tag {
        display: inline-flex;
        align-items: center;
        
        .el-icon {
          margin-right: 4px;
        }
      }
    }
    
    .survey-description {
      color: #606266;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
    }
  }
  
  .preview-content {
    padding: 0 24px 24px;
    
    .loading-container {
      padding: 24px 0;
    }
    
    .no-questions {
      padding: 40px 0;
      text-align: center;
      
      .empty-icon {
        font-size: 48px;
        color: #909399;
        margin-bottom: 12px;
      }
    }
    
    .questions-list {
      .question-item {
        padding: 16px 0;
        border-bottom: 1px dashed #ebeef5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .question-title {
          display: flex;
          align-items: flex-start;
          margin-bottom: 14px;
          
          .question-index {
            font-weight: bold;
            margin-right: 8px;
            color: #409EFF;
            font-size: 15px;
            min-width: 28px;
          }
          
          .question-text {
            font-size: 15px;
            font-weight: 500;
            flex: 1;
            margin-right: 8px;
            line-height: 1.5;
          }
          
          .required-tag {
            font-size: 12px;
            margin-top: 2px;
          }
        }
        
        .question-body {
          padding-left: 36px;
          
          .option-item {
            margin-bottom: 10px;
            
            &:last-child {
              margin-bottom: 0;
            }
          }
          
          .radio-options-group, .checkbox-options-group {
            display: flex;
            flex-direction: column;
            
            .radio-option, .checkbox-option {
              margin-bottom: 10px;
              
              :deep(.el-radio), :deep(.el-checkbox) {
                display: flex;
                align-items: flex-start;
                margin-right: 0;
                height: auto;
                line-height: 1.5;
                
                .el-radio__input, .el-checkbox__input {
                  margin-top: 2px;
                }
                
                .el-radio__label, .el-checkbox__label {
                  padding-left: 8px;
                  white-space: normal;
                  word-break: break-word;
                }
              }
            }
          }
          
          .rate-container {
            display: flex;
            align-items: center;
            
            .rate-text {
              margin-left: 12px;
              color: #F7BA2A;
              font-weight: bold;
            }
          }
        }
      }
    }
    
    .survey-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #ebeef5;
      
      .el-button {
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          margin-right: 4px;
        }
      }
    }
  }
}
</style> 