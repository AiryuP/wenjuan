<template>
  <div class="survey-query-container">
    
    <!-- 查询条件表单 -->
    <el-form :model="queryForm" ref="queryFormRef" label-width="100px" class="query-form">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="问卷名称">
            <el-input v-model="queryForm.title" placeholder="请输入问卷名称关键词" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="问卷分类">
            <el-select v-model="queryForm.categoryId" placeholder="请选择问卷分类" clearable style="width: 100%">
              <el-option
                v-for="item in categoryOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="问卷状态">
            <el-select v-model="queryForm.status" placeholder="请选择问卷状态" clearable style="width: 100%">
              <el-option :value="0" label="草稿"></el-option>
              <el-option :value="1" label="已发布"></el-option>
              <el-option :value="2" label="已关闭"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="标签">
            <el-select
              v-model="queryForm.tags"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择标签"
              style="width: 100%"
            >
              <el-option
                v-for="item in tagOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="queryForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="是否收集">
            <el-select v-model="queryForm.isCollecting" placeholder="请选择" clearable style="width: 100%">
              <el-option :value="true" label="正在收集"></el-option>
              <el-option :value="false" label="已停止收集"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row>
        <el-col :span="24" class="query-buttons">
          <el-button type="primary" @click="handleQuery" :loading="loading">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="success" @click="createSurvey">创建问卷</el-button>
        </el-col>
      </el-row>
    </el-form>
    
    <!-- 查询结果表格 -->
    <el-table
      :data="surveyList"
      border
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="问卷名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="120">
        <template #default="scope">
          {{ getCategoryName(scope.row.categoryId) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isCollecting" label="收集状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isCollecting ? 'success' : 'info'">
            {{ scope.row.isCollecting ? '收集中' : '已停止' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="respondentCount" label="回复数" width="90" />
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="scope">
          {{ new Date(scope.row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="editSurvey(scope.row)">编辑</el-button>
          <el-button size="small" type="primary" @click="previewSurvey(scope.row)">预览</el-button>
          <el-button 
            size="small" 
            :type="scope.row.isCollecting ? 'warning' : 'success'"
            @click="toggleCollectStatus(scope.row)"
          >
            {{ scope.row.isCollecting ? '停止收集' : '开始收集' }}
          </el-button>
          <el-button size="small" type="danger" @click="confirmDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const queryFormRef = ref()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
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
      const mockData = Array(total.value > 20 ? 20 : total.value).fill(0).map((_, index) => ({
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
.survey-query-container {
  padding: 20px;
  
  .query-header {
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 20px;
    }
  }
  
  .query-form {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
  }
  
  .query-buttons {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    
    .el-button {
      margin: 0 10px;
    }
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

