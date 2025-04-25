<template>
  <div class="survey-preview-container">
    <div class="preview-header">
      <h1 class="survey-title">{{ survey.title }}</h1>
      <p class="survey-description">{{ survey.description }}</p>
    </div>
    
    <div class="preview-content">
      <div v-if="!survey.questions || survey.questions.length === 0" class="no-questions">
        <el-empty description="该问卷暂无题目"></el-empty>
      </div>
      
      <div v-else class="questions-list">
        <div v-for="(question, index) in survey.questions" :key="question.id" class="question-item">
          <div class="question-header">
            <span class="question-index">{{ index + 1 }}.</span>
            <span class="question-title">{{ question.title }}</span>
            <span v-if="question.required" class="required-mark">*</span>
          </div>
          
          <div class="question-body">
            <!-- 单选题 -->
            <template v-if="question.type === 'radio'">
              <el-radio-group v-model="answers[question.id]">
                <div v-for="option in question.options" :key="option.id" class="option-item">
                  <el-radio :label="option.id">{{ option.content }}</el-radio>
                </div>
              </el-radio-group>
            </template>
            
            <!-- 多选题 -->
            <template v-else-if="question.type === 'checkbox'">
              <el-checkbox-group v-model="answers[question.id]">
                <div v-for="option in question.options" :key="option.id" class="option-item">
                  <el-checkbox :label="option.id">{{ option.content }}</el-checkbox>
                </div>
              </el-checkbox-group>
            </template>
            
            <!-- 填空题 -->
            <template v-else-if="question.type === 'text'">
              <el-input
                v-model="answers[question.id]"
                :type="question.multiline ? 'textarea' : 'text'"
                :rows="4"
                :placeholder="question.placeholder || '请输入您的回答'"
              ></el-input>
            </template>
            
            <!-- 评分题 -->
            <template v-else-if="question.type === 'rate'">
              <el-rate 
                v-model="answers[question.id]" 
                :max="question.max || 5"
                :texts="['1星', '2星', '3星', '4星', '5星']"
                show-text
              ></el-rate>
            </template>
          </div>
        </div>
      </div>
    </div>
    
    <div class="preview-footer">
      <el-button type="primary" @click="submitSurvey" :loading="submitting">提交问卷</el-button>
      <el-button @click="goBack">返回</el-button>
      <el-button type="info" @click="resetAnswers">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const surveyId = route.params.id;
const loading = ref(false);
const submitting = ref(false);

// 问卷数据
const survey = reactive({
  id: '',
  title: '',
  description: '',
  questions: []
});

// 用户答案
const answers = reactive({});

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
        initAnswers();
      } catch (e) {
        ElMessage.error('无法解析预览数据');
      }
    } else {
      ElMessage.warning('没有找到预览数据');
      goBack();
    }
    loading.value = false;
  } else {
    // 从API获取数据
    axios.get(`/api/surveys/${surveyId}`)
      .then(res => {
        const data = res.data;
        if (data && data.code === 200) {
          Object.assign(survey, data.data);
          initAnswers();
        } else {
          ElMessage.error('获取问卷数据失败');
        }
      })
      .catch(err => {
        console.error('获取问卷数据失败', err);
        ElMessage.error('获取问卷数据失败');
      })
      .then(() => {
        // 相当于 finally，但是使用 .then 替代以避免 TypeScript 兼容性问题
        loading.value = false;
      });
  }
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
      ElMessage.warning(`第 ${survey.questions.indexOf(question) + 1} 题是必答题`);
      return false;
    } else if (!answer && answer !== 0) {
      ElMessage.warning(`第 ${survey.questions.indexOf(question) + 1} 题是必答题`);
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
    surveyId: survey.id,
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
  axios.post('/api/survey-responses', submitData)
    .then(res => {
      ElMessage.success('提交成功，感谢您的参与！');
      resetAnswers();
      setTimeout(() => {
        goBack();
      }, 1500);
    })
    .catch(err => {
      console.error('提交问卷失败', err);
      ElMessage.error('提交问卷失败');
    })
    .then(() => {
      // 相当于 finally，但是使用 .then 替代以避免 TypeScript 兼容性问题
      submitting.value = false;
    });
};

// 重置答案
const resetAnswers = () => {
  initAnswers();
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
  
  .preview-header {
    margin-bottom: 30px;
    text-align: center;
    
    .survey-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .survey-description {
      color: #666;
      white-space: pre-wrap;
    }
  }
  
  .preview-content {
    margin-bottom: 30px;
    
    .no-questions {
      padding: 40px 0;
    }
    
    .questions-list {
      .question-item {
        margin-bottom: 30px;
        padding: 20px;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        
        .question-header {
          margin-bottom: 15px;
          font-size: 16px;
          
          .question-index {
            font-weight: bold;
            margin-right: 8px;
            color: #409EFF;
          }
          
          .question-title {
            font-weight: 500;
          }
          
          .required-mark {
            color: #F56C6C;
            margin-left: 4px;
          }
        }
        
        .question-body {
          .option-item {
            margin-bottom: 10px;
          }
        }
      }
    }
  }
  
  .preview-footer {
    display: flex;
    justify-content: center;
    gap: 10px;
    padding: 20px 0;
  }
}
</style> 