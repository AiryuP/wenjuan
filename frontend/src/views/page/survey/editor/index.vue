<template>
  <div class="survey-editor-container">
    <!-- 顶部工具栏 -->
    <div class="editor-header">
      <!-- 输入内容区域 -->
      <div class="content-section">
        <!-- 标题和元数据区域 -->
        <div class="title-meta-row">
          <el-input
            v-model="surveyInfo.title"
            placeholder="请输入问卷标题"
            class="title-input"
          />
          
          <div class="meta-controls">
            <div class="category-section">
              <span class="label">问卷分类：</span>
              <el-select 
                v-model="surveyInfo.categoryId" 
                placeholder="请选择分类" 
                clearable
                filterable
                :loading="categoryLoading"
                class="category-select"
              >
                <el-option
                  v-for="category in categoryOptions"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                >
                  <div style="display: flex; align-items: center;">
                    <el-icon style="margin-right: 8px; color: #409EFF;"><Folder /></el-icon>
                    {{ category.name }}
                  </div>
                </el-option>
              </el-select>
            </div>
            
            <div class="publish-section">
              <span class="label">是否发布：</span>
              <el-switch
                v-model="surveyInfo.isPublished"
                inline-prompt
                :active-value="true"
                :inactive-value="false"
                style="margin-right: 10px;"
              />
              <el-tooltip 
                content="发布后将生成链接供用户填写，可随时取消发布" 
                placement="top" 
                effect="light"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
        </div>
        
        <!-- 描述区域 -->
        <div class="description-area">
          <el-input
            v-model="surveyInfo.description"
            type="textarea"
            :rows="2"
            placeholder="请输入问卷描述（选填）"
            class="description-input"
          />
        </div>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="action-section">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
        <el-button @click="previewSurvey" type="info">
          <el-icon><View /></el-icon> 预览
        </el-button>
        <el-button type="primary" @click="saveSurvey">
          <el-icon><Document /></el-icon> 保存
        </el-button>
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
              <el-icon><component :is="type.icon" /></el-icon>
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
            <el-icon class="big-icon"><Plus /></el-icon>
            <h3>当前问卷还没有题目</h3>
            <p class="tip-desc">请选择以下题型添加到问卷中</p>
            
            <div class="empty-actions">
              <el-button type="primary" @click="addNewQuestion('radio')">
                <el-icon><Check /></el-icon> 单选题
              </el-button>
              <el-button type="primary" @click="addNewQuestion('checkbox')">
                <el-icon><Tickets /></el-icon> 多选题
              </el-button>
              <el-button type="primary" @click="addNewQuestion('text')">
                <el-icon><Edit /></el-icon> 填空题
              </el-button>
              <el-button type="primary" @click="addNewQuestion('rate')">
                <el-icon><Star /></el-icon> 评分题
              </el-button>
            </div>
            
            <div class="drag-tip">
              <el-divider>
                <span>或</span>
              </el-divider>
              <p>从左侧拖拽题型到此区域</p>
            </div>
          </div>

          <VueDraggable 
            v-model="questions" 
            v-bind="dragOptions"
            class="questions-list"
            item-key="id"
            @start="onDragStart"
            @end="onDragEnd"
            v-else
          >
            <template #item="{element: question, index}">
              <div class="question-item" :class="{ 'is-active': activeQuestionIndex === index }">
                <div class="question-drag-handle" @mousedown="selectQuestion(index)">
                  <el-icon><Rank /></el-icon>
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
                          <el-icon><ArrowUp /></el-icon>
                        </el-button>
                        <el-button size="small" type="primary" plain @click="moveQuestion(index, 1)" :disabled="index === questions.length - 1">
                          <el-icon><ArrowDown /></el-icon>
                        </el-button>
                        <el-button size="small" type="danger" plain @click="removeQuestion(index)">
                          <el-icon><Delete /></el-icon>
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
                          circle
                          @click="removeOption(question, optIndex)"
                          v-if="isQuestionActive(index) && question.options.length > 2"
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
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
                          circle
                          @click="removeOption(question, optIndex)"
                          v-if="isQuestionActive(index) && question.options.length > 2"
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
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
                  
                  <!-- 添加下一题按钮 -->
                  <div class="add-next-question" v-if="isQuestionActive(index)">
                    <el-divider content-position="center">
                      <el-dropdown @command="addQuestionAfter($event, index)">
                        <el-button type="primary" size="small" plain>
                          添加下一题 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item v-for="type in questionTypes" :key="type.type" :command="type.type">
                              <el-icon><component :is="type.icon" /></el-icon> {{ type.label }}
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </el-divider>
                  </div>
                </div>
              </div>
            </template>
          </VueDraggable>
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
              <el-select 
                v-model="surveyInfo.categoryId" 
                placeholder="请选择分类"
                filterable
                :loading="categoryLoading"
              >
                <el-option
                  v-for="category in categoryOptions"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                >
                  <div style="display: flex; align-items: center;">
                    <el-icon style="margin-right: 8px; color: #409EFF;"><Folder /></el-icon>
                    {{ category.name }}
                  </div>
                </el-option>
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
import { ref, reactive, computed, onMounted, defineComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
// 使用组件导入方式
import VueDraggable from 'vuedraggable';
// 导入Element Plus图标
import { 
  Check, 
  Tickets, 
  Edit, 
  Star, 
  Delete, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Rank,
  Folder,
  View,
  Document,
  ArrowLeft,
  QuestionFilled
} from '@element-plus/icons-vue';

// 类型定义
interface QuestionType {
  type: string;
  label: string;
  icon: any; // 修改为组件引用
}

interface QuestionOption {
  value: string;
  label: string;
}

interface BaseQuestion {
  id: string;
  type: string;
  title: string;
  required: boolean;
  showIndex: boolean;
}

interface RadioQuestion extends BaseQuestion {
  type: 'radio';
  options: QuestionOption[];
}

interface CheckboxQuestion extends BaseQuestion {
  type: 'checkbox';
  options: QuestionOption[];
}

interface TextQuestion extends BaseQuestion {
  type: 'text';
  placeholder: string;
}

interface RateQuestion extends BaseQuestion {
  type: 'rate';
  max: number;
  defaultValue: number;
}

type Question = RadioQuestion | CheckboxQuestion | TextQuestion | RateQuestion;

interface Category {
  id: string;
  name: string;
}

interface SurveyInfo {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  isPublished: boolean;
}

// 定义问卷题型
const questionTypes: QuestionType[] = [
  { type: 'radio', label: '单选题', icon: Check },
  { type: 'checkbox', label: '多选题', icon: Tickets },
  { type: 'text', label: '填空题', icon: Edit },
  { type: 'rate', label: '评分题', icon: Star }
];

const router = useRouter();
const route = useRoute();
const surveyId = route.params.id as string;
const isEdit = !!surveyId;

// 问卷基本信息
const surveyInfo = reactive<SurveyInfo>({
  id: surveyId || '',
  title: '',
  description: '',
  categoryId: '',
  isPublished: false
});

// 分类选项
const categoryOptions = ref<Category[]>([]);

// 新增变量
const categoryLoading = ref(false);

// 问题列表
const questions = ref<Question[]>([]);

// 当前活动的问题索引
const activeQuestionIndex = ref<number>(-1);
const activeQuestion = computed<Question | null>(() => {
  if (activeQuestionIndex.value >= 0 && activeQuestionIndex.value < questions.value.length) {
    return questions.value[activeQuestionIndex.value];
  }
  return null;
});

// 拖拽配置
const dragOptions = {
  animation: 200,
  handle: '.question-drag-handle',
  ghostClass: 'ghost-question',
  chosenClass: 'chosen-question'
};

// 是否正在拖拽
const isDragging = ref(false);

// 获取分类列表
const fetchCategories = () => {
  categoryLoading.value = true;
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
        categoryOptions.value = categoriesData as Category[];
        
        // 如果是新建模式，并且有分类，自动选择第一个分类
        if (!isEdit && categoryOptions.value.length > 0 && !surveyInfo.categoryId) {
          surveyInfo.categoryId = categoryOptions.value[0].id;
        }
      } else {
        console.error('无法识别的分类列表格式');
        categoryOptions.value = [];
      }
      categoryLoading.value = false;
    })
    .catch(err => {
      console.error('获取分类失败', err);
      ElMessage.error('获取分类失败');
      categoryOptions.value = [];
      categoryLoading.value = false;
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
            questions.value = surveyData.questions as Question[];
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
    
    // 不再自动创建默认题目，让用户自己选择添加
    questions.value = [];
  }
};

// 创建一个新问题
const addNewQuestion = (type: string) => {
  const newQuestion = createQuestionByType(type);
  questions.value.push(newQuestion);
  // 自动选中新添加的问题
  activeQuestionIndex.value = questions.value.length - 1;
};

// 根据类型创建问题
const createQuestionByType = (type: string): Question => {
  const baseQuestion: BaseQuestion = {
    id: uuidv4(),
    type,
    title: '',
    required: true,
    showIndex: true,
  };
  
  switch (type) {
    case 'radio':
      return {
        ...baseQuestion,
        type: 'radio',
        options: [
          { value: '1', label: '选项1' },
          { value: '2', label: '选项2' }
        ]
      };
    case 'checkbox':
      return {
        ...baseQuestion,
        type: 'checkbox',
        options: [
          { value: '1', label: '选项1' },
          { value: '2', label: '选项2' }
        ]
      };
    case 'text':
      return {
        ...baseQuestion,
        type: 'text',
        placeholder: '请输入'
      };
    case 'rate':
      return {
        ...baseQuestion,
        type: 'rate',
        max: 5,
        defaultValue: 0
      };
    default:
      // 默认返回单选题
      return {
        ...baseQuestion,
        type: 'radio',
        options: [
          { value: '1', label: '选项1' },
          { value: '2', label: '选项2' }
        ]
      };
  }
};

// 选择问题
const selectQuestion = (index: number) => {
  if (!isDragging.value) {
    activeQuestionIndex.value = index;
  }
};

// 判断问题是否被选中
const isQuestionActive = (index: number) => {
  return activeQuestionIndex.value === index;
};

// 移除问题
const removeQuestion = (index: number) => {
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
const moveQuestion = (index: number, direction: number) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= questions.value.length) return;
  
  const temp = questions.value[index];
  questions.value[index] = questions.value[newIndex];
  questions.value[newIndex] = temp;
  
  // 更新活动问题索引
  activeQuestionIndex.value = newIndex;
};

// 添加选项
const addOption = (question: RadioQuestion | CheckboxQuestion) => {
  if (!question.options) question.options = [];
  const newOptionIndex = question.options.length + 1;
  question.options.push({
    value: String(newOptionIndex),
    label: `选项${newOptionIndex}`
  });
};

// 移除选项
const removeOption = (question: RadioQuestion | CheckboxQuestion, optionIndex: number) => {
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

// 在指定位置后添加问题
const addQuestionAfter = (type: string, index: number) => {
  const newQuestion = createQuestionByType(type);
  // 在指定位置后插入新问题
  questions.value.splice(index + 1, 0, newQuestion);
  // 自动选中新添加的问题
  activeQuestionIndex.value = index + 1;
};

// 拖拽相关方法
const handleDragStart = (event: DragEvent, typeInfo: QuestionType) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('type', typeInfo.type);
  }
};

const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer) {
    const type = event.dataTransfer.getData('type');
    if (type) {
      addNewQuestion(type);
    }
  }
};

// 拖拽开始事件
const onDragStart = () => {
  isDragging.value = true;
};

// 拖拽结束事件
const onDragEnd = () => {
  isDragging.value = false;
  // 更新活动索引，因为题目顺序可能已经变化
  if (activeQuestion.value) {
    const newIndex = questions.value.findIndex(q => q.id === activeQuestion.value?.id);
    if (newIndex !== -1) {
      activeQuestionIndex.value = newIndex;
    }
  }
};

onMounted(() => {
  fetchCategories();
  initSurveyData();
});
</script>

<style lang="scss" scoped>
.survey-editor-container {
  height: 100%;
  overflow: hidden;
  background-color: #f5f7fa;
}

.editor-header {
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.content-section {
  margin-bottom: 12px;
}

.title-meta-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 16px;
  
  .title-input {
    flex: 1;
    font-size: 16px;
    max-width: 38%;
  }
  
  .meta-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
}

.category-section, .publish-section {
  display: flex;
  align-items: center;
}

.category-select {
  width: 180px;
}

.label {
  margin-right: 8px;
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
}

.description-area {
  margin-bottom: 0;
}

.action-section {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.editor-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(100% - 174px); /* 调整高度计算以适应新的顶部布局 */
  
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
          
          .el-icon {
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
        height: 400px;
        background-color: #fff;
        border: 2px dashed #dcdfe6;
        border-radius: 8px;
        color: #606266;
        padding: 20px;
        
        .big-icon {
          font-size: 56px;
          margin-bottom: 24px;
          color: #409EFF;
        }
        
        h3 {
          font-size: 18px;
          font-weight: 500;
          margin: 0 0 8px;
          color: #303133;
        }
        
        .tip-desc {
          margin: 0 0 24px;
          font-size: 14px;
          color: #909399;
        }
        
        .empty-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
          margin-bottom: 32px;
          
          .el-button {
            min-width: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .el-icon {
              margin-right: 4px;
            }
          }
        }
        
        .drag-tip {
          width: 80%;
          text-align: center;
          
          p {
            margin-top: 12px;
            font-size: 14px;
            color: #909399;
          }
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
          
          .el-icon {
            font-size: 16px;
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
      
      .add-next-question {
        margin-top: 12px;
        text-align: center;
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

/* 拖拽相关样式 */
.ghost-question {
  opacity: 0.5;
  background: #c8ebfb;
  border: 1px dashed #409EFF;
}

.chosen-question {
  box-shadow: 0 0 10px 0 rgba(64, 158, 255, 0.5);
}

.questions-list {
  width: 100%;
  min-height: 10px; /* 确保空列表也有空间可以拖放 */
}
</style>
