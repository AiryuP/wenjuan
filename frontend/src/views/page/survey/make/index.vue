<template>
  <div class="survey-make-container">
    <!-- 顶部搜索区域 -->
    <div class="header-panel">
      <div class="panel-header">
        <el-icon><Search /></el-icon> 搜索条件
      </div>
      <el-form :model="queryForm" ref="queryFormRef" layout="inline" class="search-form">
        <div class="form-items">
          <el-form-item label="问卷名称">
            <el-input
              v-model="queryForm.title"
              placeholder="搜索问卷名称"
              clearable
              class="form-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="问卷分类">
            <el-select v-model="queryForm.categoryId" placeholder="选择分类" clearable class="form-select">
              <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <div style="display: flex; align-items: center;">
                  <el-icon style="margin-right: 8px; color: #409EFF;"><Folder /></el-icon>
                  {{ item.name }}
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="问卷状态">
            <el-select v-model="queryForm.status" placeholder="选择状态" clearable class="form-select">
              <el-option :value="0" label="草稿"></el-option>
              <el-option :value="1" label="已发布"></el-option>
              <el-option :value="2" label="已关闭"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="收集状态">
            <el-select v-model="queryForm.isCollecting" placeholder="收集状态" clearable class="form-select">
              <el-option :value="true" label="正在收集"></el-option>
              <el-option :value="false" label="已停止收集"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="queryForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            ></el-date-picker>
          </el-form-item>
        </div>
        
        <div class="form-buttons">
          <el-button type="primary" @click="handleQuery" :loading="loading">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><RefreshLeft /></el-icon> 重置
          </el-button>
          <el-button type="success" @click="createSurvey">
            <el-icon><Plus /></el-icon> 创建问卷
          </el-button>
        </div>
      </el-form>
    </div>
    
    <!-- 问卷列表表格视图 -->
    <div class="table-container">
      <div class="panel-header">
        <el-icon><List /></el-icon> 问卷列表
        <span class="result-count">共 {{ total }} 条记录</span>
      </div>
      
      <el-table
        :data="surveyList"
        style="width: 100%"
        v-loading="loading"
        border
        stripe
        highlight-current-row
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
      >
        <el-table-column prop="title" label="问卷名称" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <div class="title-cell">
              <el-icon><Document /></el-icon>
              <span class="title-text">{{ scope.row.title }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="categoryId" label="分类" >
          <template #default="scope">
            <div class="cell-with-icon">
              <el-icon><Folder /></el-icon>
              <span>{{ getCategoryName(scope.row.categoryId) }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态"  align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="light" round>
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="isCollecting" label="收集状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isCollecting ? 'success' : 'info'" effect="light" round>
              <el-icon class="status-icon">
                <VideoPlay v-if="scope.row.isCollecting" />
                <Mute v-else />
              </el-icon>
              {{ scope.row.isCollecting ? '收集中' : '已停止' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="respondentCount" label="回复数"  align="center">
          <template #default="scope">
            <div class="response-count">
              <span class="count-number">{{ scope.row.respondentCount }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" >
          <template #default="scope">
            <div class="cell-with-icon">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(scope.row.createdAt) }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="360" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-tooltip content="编辑问卷" placement="top">
                <el-button size="small" type="primary" plain @click="editSurvey(scope.row)">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
              </el-tooltip>
              
              <el-tooltip content="预览问卷" placement="top">
                <el-button size="small" type="info" plain @click="previewSurvey(scope.row)">
                  <el-icon><View /></el-icon> 预览
                </el-button>
              </el-tooltip>
              
              <el-tooltip :content="scope.row.isCollecting ? '停止收集' : '开始收集'" placement="top">
                <el-button 
                  size="small" 
                  :type="scope.row.isCollecting ? 'warning' : 'success'"
                  plain
                  @click="toggleCollectStatus(scope.row)"
                >
                  <el-icon>
                    <Mute v-if="scope.row.isCollecting" />
                    <VideoPlay v-else />
                  </el-icon>
                  {{ scope.row.isCollecting ? '停止' : '开始' }}
                </el-button>
              </el-tooltip>
              
              <el-tooltip content="删除问卷" placement="top">
                <el-button size="small" type="danger" plain @click="confirmDelete(scope.row)">
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty 
        v-if="surveyList.length === 0 && !loading" 
        description="暂无数据，请尝试调整筛选条件或新建问卷"
        :image-size="200"
      >
        <template #image>
          <el-icon style="font-size: 60px; color: #909399;"><DocumentRemove /></el-icon>
        </template>
        <el-button type="primary" @click="createSurvey">创建问卷</el-button>
      </el-empty>
    </div>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      ></el-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { 
  Search, 
  Plus, 
  Edit, 
  View, 
  Delete, 
  Folder, 
  User, 
  Calendar, 
  RefreshLeft,
  ArrowDown,
  VideoPlay,
  Mute,
  Document,
  DocumentRemove,
  List
} from '@element-plus/icons-vue'

const router = useRouter()
const queryFormRef = ref()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10) // 修改默认显示数量适合表格视图
const total = ref(0)

// 分类选项
interface Category {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

interface SurveyItem {
  id: number;
  title: string;
  categoryId: number;
  status: number;
  isCollecting: boolean;
  respondentCount: number;
  createdAt: string;
  tags: number[];
}

// 分类选项
const categoryOptions = ref<Category[]>([])

// 标签选项
const tagOptions = ref([
  { id: 1, name: '市场调研' },
  { id: 2, name: '产品反馈' },
  { id: 3, name: '满意度调查' },
  { id: 4, name: '活动评估' },
  { id: 5, name: '教育培训' },
  { id: 6, name: '内部测评' }
])

// 查询条件
const queryForm = reactive({
  title: '',
  categoryId: '',
  status: '',
  tags: [],
  dateRange: [],
  isCollecting: '',
  pageNum: 1,
  pageSize: 10
})

// 问卷列表数据
const surveyList = ref<SurveyItem[]>([])

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// 获取分类列表
const fetchCategories = () => {
  axios.get('/api/survey-categories')
    .then(response => {
      // 适配各种可能的响应结构
      let categoriesData = null;
      if (response.data && response.data.data) {
        // 如果响应格式是 { code: 200, data: [...], message: '...' }
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // 如果响应直接是数组
        categoriesData = response.data;
      } else if (response.data) {
        // 其他情况
        categoriesData = response.data;
      }
      
      if (Array.isArray(categoriesData)) {
        categoryOptions.value = categoriesData;
      } else {
        categoryOptions.value = [];
      }
    })
    .catch(err => {
      console.error('获取分类失败', err);
      ElMessage.error('获取分类失败');
      categoryOptions.value = [];
    });
};

// 生成模拟的分类数据，防止API未就绪时页面出错
const generateMockCategories = () => {
  return [
    { id: 1, name: '市场调研', description: '用于市场调研的问卷', isActive: true },
    { id: 2, name: '客户反馈', description: '用于收集客户反馈的问卷', isActive: true },
    { id: 3, name: '产品评测', description: '用于产品评测的问卷', isActive: true }
  ];
};

// 获取问卷列表
const fetchSurveys = () => {
  loading.value = true
  
  const params = {
    title: queryForm.title || undefined,
    categoryId: queryForm.categoryId || undefined,
    status: queryForm.status !== '' ? queryForm.status : undefined,
    tags: queryForm.tags.length > 0 ? queryForm.tags.join(',') : undefined,
    startDate: queryForm.dateRange && queryForm.dateRange[0] ? queryForm.dateRange[0] : undefined,
    endDate: queryForm.dateRange && queryForm.dateRange[1] ? queryForm.dateRange[1] : undefined,
    isCollecting: queryForm.isCollecting !== '' ? queryForm.isCollecting : undefined,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  }
   
  
  // 模拟API调用（后续接入真实API）
  setTimeout(() => {
    try {
      // 模拟数据
      const mockData = Array(total.value > pageSize.value ? pageSize.value : total.value).fill(0).map((_, index) => ({
        id: index + 1,
        title: `测试问卷${index + 1}`,
        categoryId: Math.floor(Math.random() * 3) + 1,
        status: Math.floor(Math.random() * 3),
        isCollecting: Math.random() > 0.5,
        respondentCount: Math.floor(Math.random() * 500),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
        tags: [Math.floor(Math.random() * 6) + 1]
      }))
      
      surveyList.value = mockData
      loading.value = false
    } catch (error) {
      console.error('处理数据时出错:', error);
      loading.value = false;
      surveyList.value = [];
    }
  }, 500)
}

// 查询
const handleQuery = () => {
  currentPage.value = 1
  fetchSurveys()
}

// 重置查询条件
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  currentPage.value = 1
  fetchSurveys()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchSurveys()
}

// 每页条数变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchSurveys()
}

// 创建问卷
const createSurvey = () => {
  router.push('/survey/editor')
}

// 编辑问卷
const editSurvey = (row: any) => {
  router.push(`/survey/editor/${row.id}`)
}

// 预览问卷
const previewSurvey = (row: any) => {
  window.open(`/survey/preview/${row.id}`, '_blank')
}

// 切换收集状态
const toggleCollectStatus = (row: any) => {
  const newStatus = !row.isCollecting
  ElMessage.success(`问卷已${newStatus ? '开始' : '停止'}收集`)
  // 实际应调用API更新状态
  row.isCollecting = newStatus
}

// 确认删除
const confirmDelete = (row: any) => {
  ElMessageBox.confirm(
    '确定要删除该问卷吗？删除后不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际应调用API删除问卷
    ElMessage.success('删除成功')
    fetchSurveys()
  }).catch(() => {})
}

// 获取分类名称
const getCategoryName = (categoryId: number) => {
  if (!categoryOptions.value || !Array.isArray(categoryOptions.value) || categoryOptions.value.length === 0) {
    return '-';
  }
  const category = categoryOptions.value.find(c => c && c.id === categoryId);
  return category ? category.name : '-';
}

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '草稿',
    1: '已发布',
    2: '已关闭'
  }
  return statusMap[status] || '未知'
}

// 获取状态标签类型
const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'warning'
  }
  return typeMap[status] || 'info'
}

onMounted(() => {
  // 先设置一些模拟分类数据，以防API调用失败
  categoryOptions.value = generateMockCategories();
  
  // 尝试从API获取真实分类数据
  fetchCategories();
  
  // 设置模拟的总数量并获取问卷列表
  total.value = 35;
  fetchSurveys();
});
</script>

<style lang="scss" scoped>
.survey-make-container {
  padding: 20px;
  background-color: #f5f7fa;
  // min-height: 100vh;
  height: 100%;
  
  .page-title {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    
    h2 {
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      
      .el-icon {
        margin-right: 8px;
        font-size: 24px;
        color: #409EFF;
      }
    }
    
    .title-desc {
      font-size: 14px;
      color: #606266;
    }
  }
  
  .header-panel {
    margin-bottom: 20px;
    background-color: #fff;
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    
    .panel-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #ebeef5;
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      
      .el-icon {
        margin-right: 8px;
        color: #409EFF;
      }
    }
    
    .search-form {
      display: flex;
      flex-direction: column;
      padding: 20px;
      
      .form-items {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 16px;
        gap: 16px;
        
        .el-form-item {
          margin-bottom: 0;
          margin-right: 0;
        }
        
        .form-input, .form-select {
          width: 200px;
        }
      }
      
      .form-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        
        .el-button {
          min-width: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .el-icon {
            margin-right: 8px;
          }
        }
      }
    }
  }
  
  .table-container {
    background-color: #fff;
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;
    overflow: hidden;
    height: calc(100% - 250px);
    display: flex;
    flex-direction: column;
    
    .panel-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #ebeef5;
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      
      .el-icon {
        margin-right: 8px;
        color: #409EFF;
      }
      
      .result-count {
        margin-left: auto;
        font-size: 13px;
        font-weight: normal;
        color: #606266;
      }
    }
    
    .title-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-icon {
        color: #409EFF;
      }
      
      .title-text {
        font-weight: 500;
      }
    }
    
    .cell-with-icon {
      display: flex;
      align-items: center;
      gap: 6px;
      
      .el-icon {
        font-size: 14px;
        color: #409EFF;
      }
    }
    
    .status-icon {
      margin-right: 4px;
    }
    
    .response-count {
      .count-number { 
        border-radius: 10px;
        padding: 4px 8px;
        font-size: 12px; 
        display: inline-block;
        min-width: 24px;
        text-align: center;
      }
      
      .el-badge__content {
        font-size: 12px;
        padding: 4px 8px;
      }
    }
    
    .table-actions {
      display: flex;
      flex-wrap: nowrap;
      gap: 8px;
      
      .el-button {
        .el-icon {
          margin-right: 4px;
        }
      }
    }
    
    :deep(.el-table) {
      flex: 1;
      overflow-y: auto;
      height: 100%;
      
      .el-table__body-wrapper {
        overflow-y: auto;
      }
      
      .el-table__row {
        transition: all 0.3s;
        
        &:hover {
          background-color: #f0f7ff !important;
        }
      }
    }
    
    .el-empty {
      padding: 40px 0;
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding: 16px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }
}
</style>

