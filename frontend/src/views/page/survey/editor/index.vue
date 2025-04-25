<template>
  <div class="survey-editor-container">
    <!-- 顶部工具栏 -->
    <div class="editor-header">
      <div class="title-section">
        <el-input
          v-model="surveyInfo.title"
          placeholder="请输入问卷标题"
          class="title-input"
        />
        <el-input
          v-model="surveyInfo.description"
          type="textarea"
          :rows="2"
          placeholder="请输入问卷描述（选填）"
          class="description-input"
        />
      </div>
      <div class="button-group">
        <el-button type="primary" @click="saveSurvey">保存</el-button>
        <el-button @click="previewSurvey">预览</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <!-- 主要编辑区域 -->
    <div class="editor-main">
      <!-- 左侧组件面板 -->
      <div class="component-panel">
        <h3>题型组件</h3>
        <div class="component-list">
          <div 
            v-for="type in questionTypes" 
            :key="type.type" 
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, type)"
          >
            <div class="component-item-inner">
              <i :class="type.icon"></i>
              <span>{{ type.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间问卷内容区域 -->
      <div 
        class="question-area"
        @dragover.prevent
        @drop="handleDrop"
      >
        <div class="question-area-inner">
          <div v-if="questions.length === 0" class="empty-tip">
            <i class="el-icon-plus"></i>
            <p>从左侧拖拽组件到此处，或点击添加题目</p>
            <el-button type="primary" size="small" @click="addNewQuestion('radio')">添加单选题</el-button>
          </div>

          <div v-for="(question, index) in questions" :key="question.id" class="question-item" :class="{ 'is-active': activeQuestionIndex === index }">
            <div class="question-drag-handle" @mousedown="selectQuestion(index)">
              <i class="el-icon-rank"></i>
            </div>
            <div class="question-content">
              <div class="question-header">
                <div class="question-title">
                  <span class="question-index">Q{{ index + 1 }}</span>
                  <el-input 
                    v-model="question.title" 
                    placeholder="请输入题目标题"
                    :disabled="!isQuestionActive(index)"
                  />
                  <el-tag size="small" :type="question.required ? 'danger' : 'info'">
                    {{ question.required ? '必答' : '选答' }}
                  </el-tag>
                </div>
                <div class="question-actions">
                  <el-button-group>
                    <el-button size="small" type="primary" plain @click="moveQuestion(index, -1)" :disabled="index === 0">
                      <i class="el-icon-arrow-up"></i>
                    </el-button>
                    <el-button size="small" type="primary" plain @click="moveQuestion(index, 1)" :disabled="index === questions.length - 1">
                      <i class="el-icon-arrow-down"></i>
                    </el-button>
                    <el-button size="small" type="danger" plain @click="removeQuestion(index)">
                      <i class="el-icon-delete"></i>
                    </el-button>
                  </el-button-group>
                </div>
              </div>

              <!-- 根据题型显示不同的内容编辑组件 -->
              <div class="question-body">
                <!-- 单选题 -->
                <template v-if="question.type === 'radio'">
                  <div
                    v-for="(option, optIndex) in question.options"
                    :key="optIndex"
                    class="question-option"
                  >
                    <el-radio disabled :label="option.value">
                      <el-input 
                        v-model="option.label" 
                        placeholder="请输入选项"
                        :disabled="!isQuestionActive(index)"
                      />
                    </el-radio>
                    <el-button
                      size="mini"
                      type="danger"
                      icon="el-icon-delete"
                      circle
                      @click="removeOption(question, optIndex)"
                      v-if="isQuestionActive(index) && question.options.length > 2"
                    ></el-button>
                  </div>
                  <div class="option-actions" v-if="isQuestionActive(index)">
                    <el-button size="small" type="primary" plain @click="addOption(question)">
                      添加选项
                    </el-button>
                  </div>
                </template>

                <!-- 多选题 -->
                <template v-else-if="question.type === 'checkbox'">
                  <div
                    v-for="(option, optIndex) in question.options"
                    :key="optIndex"
                    class="question-option"
                  >
                    <el-checkbox disabled :label="option.value">
                      <el-input 
                        v-model="option.label" 
                        placeholder="请输入选项"
                        :disabled="!isQuestionActive(index)"
                      />
                    </el-checkbox>
                    <el-button
                      size="mini"
                      type="danger"
                      icon="el-icon-delete"
                      circle
                      @click="removeOption(question, optIndex)"
                      v-if="isQuestionActive(index) && question.options.length > 2"
                    ></el-button>
                  </div>
                  <div class="option-actions" v-if="isQuestionActive(index)">
                    <el-button size="small" type="primary" plain @click="addOption(question)">
                      添加选项
                    </el-button>
                  </div>
                </template>

                <!-- 填空题 -->
                <template v-else-if="question.type === 'text'">
                  <el-input
                    type="textarea"
                    :rows="3"
                    disabled
                    placeholder="此处填写答案"
                  ></el-input>
                </template>

                <!-- 评分题 -->
                <template v-else-if="question.type === 'rate'">
                  <div class="rate-preview">
                    <el-rate 
                      v-model="question.defaultValue" 
                      :max="question.max || 5"
                      :disabled="!isQuestionActive(index)"
                    ></el-rate>
                  </div>
                  <div class="rate-config" v-if="isQuestionActive(index)">
                    <el-form-item label="最高分">
                      <el-input-number v-model="question.max" :min="3" :max="10"></el-input-number>
                    </el-form-item>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="properties-panel">
        <div v-if="activeQuestion">
          <h3>题目属性</h3>
          <el-form label-position="top">
            <el-form-item label="题目类型">
              <el-select v-model="activeQuestion.type" @change="handleTypeChange">
                <el-option
                  v-for="type in questionTypes"
                  :key="type.type"
                  :label="type.label"
                  :value="type.type"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="题目标题">
              <el-input v-model="activeQuestion.title" placeholder="请输入题目标题"></el-input>
            </el-form-item>
            <el-form-item label="是否必答">
              <el-switch v-model="activeQuestion.required"></el-switch>
            </el-form-item>
            <el-form-item label="是否显示序号">
              <el-switch v-model="activeQuestion.showIndex"></el-switch>
            </el-form-item>
          </el-form>
        </div>
        <div v-else>
          <h3>问卷属性</h3>
          <el-form label-position="top">
            <el-form-item label="问卷标题">
              <el-input v-model="surveyInfo.title" placeholder="请输入问卷标题"></el-input>
            </el-form-item>
            <el-form-item label="问卷描述">
              <el-input
                v-model="surveyInfo.description"
                type="textarea"
                :rows="3"
                placeholder="请输入问卷描述（选填）"
              ></el-input>
            </el-form-item>
            <el-form-item label="问卷分类">
              <el-select v-model="surveyInfo.categoryId" placeholder="请选择分类">
                <el-option
                  v-for="category in categoryOptions"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="是否发布">
              <el-switch v-model="surveyInfo.isPublished"></el-switch>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// 定义问卷题型
const questionTypes = [
  { type: 'radio', label: '单选题', icon: 'el-icon-circle-check' },
  { type: 'checkbox', label: '多选题', icon: 'el-icon-tickets' },
  { type: 'text', label: '填空题', icon: 'el-icon-edit-outline' },
  { type: 'rate', label: '评分题', icon: 'el-icon-star-on' }
];

const router = useRouter();
const route = useRoute();
const surveyId = route.params.id as string;
const isEdit = !!surveyId;

// 问卷基本信息
const surveyInfo = reactive({
  id: surveyId || '',
  title: '',
  description: '',
  categoryId: '',
  isPublished: false
});

// 分类选项
const categoryOptions = ref([]);

// 问题列表
const questions = ref([]);

// 当前活动的问题索引
const activeQuestionIndex = ref(-1);
const activeQuestion = computed(() => {
  if (activeQuestionIndex.value >= 0 && activeQuestionIndex.value < questions.value.length) {
    return questions.value[activeQuestionIndex.value];
  }
  return null;
});

// 获取分类列表
const fetchCategories = () => {
  axios.get('/api/survey-categories')
    .then(response => {
      let categoriesData = null;
      if (response.data && response.data.data) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data) {
        categoriesData = response.data;
      }
      
      if (Array.isArray(categoriesData)) {
        categoryOptions.value = categoriesData;
      } else {
        console.error('无法识别的分类列表格式');
        categoryOptions.value = [];
      }
    })
    .catch(err => {
      console.error('获取分类失败', err);
      ElMessage.error('获取分类失败');
      categoryOptions.value = [];
    });
};

// 初始化问卷数据
const initSurveyData = () => {
  if (isEdit) {
    // 编辑模式，获取问卷数据
    axios.get(`/api/surveys/${surveyId}`)
      .then(res => {
        const data = res.data;
        if (data && data.code === 200) {
          const surveyData = data.data;
          // 填充问卷基本信息
          surveyInfo.title = surveyData.title || '';
          surveyInfo.description = surveyData.description || '';
          surveyInfo.categoryId = surveyData.categoryId || '';
          surveyInfo.isPublished = surveyData.isPublished || false;
          
          // 填充问题列表
          if (Array.isArray(surveyData.questions)) {
            questions.value = surveyData.questions;
          }
        }
      })
      .catch(err => {
        console.error('获取问卷数据失败', err);
        ElMessage.error('获取问卷数据失败');
      });
  } else {
    // 新建模式，使用默认数据
    surveyInfo.title = '未命名问卷';
    surveyInfo.description = '';
    surveyInfo.isPublished = false;
    
    // 创建一个默认问题
    addNewQuestion('radio');
  }
};

// 创建一个新问题
const addNewQuestion = (type) => {
  const newQuestion = createQuestionByType(type);
  questions.value.push(newQuestion);
  // 自动选中新添加的问题
  activeQuestionIndex.value = questions.value.length - 1;
};

// 根据类型创建问题
const createQuestionByType = (type) => {
  const baseQuestion = {
    id: uuidv4(),
    type,
    title: '',
    required: true,
    showIndex: true,
  };
  
  switch (type) {
    case 'radio':
    case 'checkbox':
      return {
        ...baseQuestion,
        options: [
          { value: '1', label: '选项1' },
          { value: '2', label: '选项2' }
        ]
      };
    case 'text':
      return {
        ...baseQuestion,
        placeholder: '请输入'
      };
    case 'rate':
      return {
        ...baseQuestion,
        max: 5,
        defaultValue: 0
      };
    default:
      return baseQuestion;
  }
};

// 选择问题
const selectQuestion = (index) => {
  activeQuestionIndex.value = index;
};

// 判断问题是否被选中
const isQuestionActive = (index) => {
  return activeQuestionIndex.value === index;
};

// 移除问题
const removeQuestion = (index) => {
  ElMessageBox.confirm('确定要删除此题目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    questions.value.splice(index, 1);
    if (activeQuestionIndex.value === index) {
      activeQuestionIndex.value = -1;
    } else if (activeQuestionIndex.value > index) {
      activeQuestionIndex.value--;
    }
    ElMessage.success('删除成功');
  }).catch(() => {});
};

// 移动问题位置
const moveQuestion = (index, direction) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= questions.value.length) return;
  
  const temp = questions.value[index];
  questions.value[index] = questions.value[newIndex];
  questions.value[newIndex] = temp;
  
  // 更新活动问题索引
  activeQuestionIndex.value = newIndex;
};

// 添加选项
const addOption = (question) => {
  if (!question.options) question.options = [];
  const newOptionIndex = question.options.length + 1;
  question.options.push({
    value: String(newOptionIndex),
    label: `选项${newOptionIndex}`
  });
};

// 移除选项
const removeOption = (question, optionIndex) => {
  if (question.options.length <= 2) {
    ElMessage.warning('至少保留两个选项');
    return;
  }
  question.options.splice(optionIndex, 1);
};

// 处理题型变更
const handleTypeChange = () => {
  if (!activeQuestion.value) return;
  
  // 保存当前题目的基本信息
  const { id, title, required, showIndex } = activeQuestion.value;
  const type = activeQuestion.value.type;
  
  // 根据新的类型创建问题
  const newQuestion = createQuestionByType(type);
  
  // 恢复基本信息
  newQuestion.id = id;
  newQuestion.title = title;
  newQuestion.required = required;
  newQuestion.showIndex = showIndex;
  
  // 替换当前问题
  questions.value[activeQuestionIndex.value] = newQuestion;
};

// 保存问卷
const saveSurvey = () => {
  if (!surveyInfo.title) {
    ElMessage.warning('请输入问卷标题');
    return;
  }
  
  if (questions.value.length === 0) {
    ElMessage.warning('请至少添加一个问题');
    return;
  }
  
  const surveyData = {
    ...surveyInfo,
    questions: questions.value
  };
  
  const api = isEdit ? `/api/surveys/${surveyId}` : '/api/surveys';
  const method = isEdit ? 'patch' : 'post';
  
  axios[method](api, surveyData)
    .then(res => {
      ElMessage.success(isEdit ? '问卷更新成功' : '问卷创建成功');
      if (!isEdit && res.data && res.data.data && res.data.data.id) {
        // 新建成功后，重定向到编辑模式
        router.replace(`/survey/editor/${res.data.data.id}`);
      }
    })
    .catch(err => {
      console.error('保存问卷失败', err);
      ElMessage.error('保存问卷失败');
    });
};

// 预览问卷
const previewSurvey = () => {
  // 保存当前状态到本地存储，用于预览
  localStorage.setItem('preview_survey', JSON.stringify({
    ...surveyInfo,
    questions: questions.value
  }));
  window.open('/survey/preview', '_blank');
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 拖拽相关方法
const handleDragStart = (event, typeInfo) => {
  event.dataTransfer.setData('type', typeInfo.type);
};

const handleDrop = (event) => {
  const type = event.dataTransfer.getData('type');
  if (type) {
    addNewQuestion(type);
  }
};

onMounted(() => {
  fetchCategories();
  initSurveyData();
});
</script>

<style lang="scss" scoped>
.survey-editor-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fa;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  z-index: 10;
  
  .title-section {
    width: 60%;
    
    .title-input {
      margin-bottom: 8px;
      font-size: 18px;
      font-weight: bold;
    }
    
    .description-input {
      width: 100%;
    }
  }
  
  .button-group {
    display: flex;
    gap: 10px;
  }
}

.editor-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  
  .component-panel {
    width: 200px;
    padding: 16px;
    background-color: #fff;
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
    
    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 16px;
      color: #333;
    }
    
    .component-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      
      .component-item {
        cursor: grab;
        
        &-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background-color: #f9f9f9;
          transition: all 0.2s;
          
          &:hover {
            background-color: #f0f0f0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          i {
            font-size: 20px;
            margin-bottom: 4px;
            color: #409EFF;
          }
          
          span {
            font-size: 12px;
            color: #606266;
          }
        }
      }
    }
  }
  
  .question-area {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    
    &-inner {
      max-width: 800px;
      margin: 0 auto;
      
      .empty-tip {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        background-color: #fff;
        border: 2px dashed #dcdfe6;
        border-radius: 4px;
        color: #909399;
        
        i {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        p {
          margin-bottom: 16px;
        }
      }
      
      .question-item {
        display: flex;
        margin-bottom: 16px;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        transition: all 0.3s;
        
        &.is-active {
          box-shadow: 0 0 0 2px #409EFF, 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }
        
        .question-drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          background-color: #f5f7fa;
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
          cursor: move;
          
          i {
            color: #909399;
          }
        }
        
        .question-content {
          flex: 1;
          padding: 16px;
          
          .question-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
            
            .question-title {
              display: flex;
              align-items: center;
              width: 80%;
              
              .question-index {
                font-weight: bold;
                margin-right: 8px;
                color: #409EFF;
              }
              
              .el-input {
                margin-right: 8px;
              }
            }
          }
          
          .question-body {
            .question-option {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
              
              .el-radio,
              .el-checkbox {
                margin-right: 8px;
                width: 100%;
                
                .el-input {
                  margin-left: 8px;
                  width: 90%;
                }
              }
            }
            
            .option-actions {
              margin-top: 12px;
            }
            
            .rate-preview {
              margin-bottom: 16px;
            }
          }
        }
      }
    }
  }
  
  .properties-panel {
    width: 280px;
    padding: 16px;
    background-color: #fff;
    box-shadow: -2px 0 6px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
    
    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 16px;
      color: #333;
    }
  }
}
</style>
