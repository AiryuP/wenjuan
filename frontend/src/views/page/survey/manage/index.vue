<template>
  <div class="survey-category-container">
    <div class="header">
      <h2>问卷分类管理</h2>
      <el-button type="primary" @click="handleAdd">新增分类</el-button>
    </div>

    <!-- 分类列表 -->
    <el-table :data="categoryList" border style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="description" label="分类描述" show-overflow-tooltip />
      <el-table-column prop="isActive" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
            {{ scope.row.isActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="scope">
          {{ new Date(scope.row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-popconfirm
            title="确定删除该分类吗？"
            @confirm="handleDelete(scope.row.id)"
          >
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入分类描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import http from '@/utils/http'

interface CategoryItem {
  id: number
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 列表数据
const categoryList = ref<CategoryItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表单数据
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  name: '',
  description: '',
  isActive: true
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 100, message: '分类名称不能超过100个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '分类描述不能超过500个字符', trigger: 'blur' }
  ]
}

// 获取分类列表
const fetchCategoryList = () => {
  loading.value = true
  const api = `/api/survey-categories`
  
  http.get(api)
    .then((res) => {
      categoryList.value = res.data || []
      total.value = res.data?.length || 0
      loading.value = false
    })
    .catch((error) => {
      console.error('获取分类列表失败', error)
      ElMessage.error('获取分类列表失败')
      loading.value = false
    })
}

// 新增分类
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row: CategoryItem) => {
  isEdit.value = true
  resetForm()
  Object.assign(form, {
    id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.isActive
  })
  dialogVisible.value = true
}

// 删除分类
const handleDelete = (id: number) => {
  http.delete(`/api/survey-categories/${id}`)
    .then(() => {
      ElMessage.success('删除成功')
      fetchCategoryList()
    })
    .catch((error) => {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    })
}

// 提交表单
const submitForm = () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      
      if (isEdit.value) {
        // 编辑
        http.patch(`/api/survey-categories/${form.id}`, {
          name: form.name,
          description: form.description,
          isActive: form.isActive
        })
        .then(() => {
          ElMessage.success('更新成功')
          dialogVisible.value = false
          fetchCategoryList()
          submitting.value = false
        })
        .catch((error) => {
          console.error('提交失败', error)
          ElMessage.error('提交失败')
          submitting.value = false
        })
      } else {
        // 新增
        const postData = {
          name: form.name,
          description: form.description,
          isActive: form.isActive
        }
        console.log('提交的新增数据:', postData)
        
        http.post('/api/survey-categories', postData)
        .then((res) => {
          console.log('新增成功响应:', res)
          ElMessage.success('创建成功')
          dialogVisible.value = false
          fetchCategoryList()
          submitting.value = false
        })
        .catch((error) => {
          console.error('新增失败详细信息:', error)
          if (error.response) {
            console.error('错误响应数据:', error.response.data)
            console.error('错误状态码:', error.response.status)
          }
          ElMessage.error(error.message || '提交失败')
          submitting.value = false
        })
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  form.id = 0
  form.name = ''
  form.description = ''
  form.isActive = true
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 分页切换
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchCategoryList()
}

onMounted(() => {
  fetchCategoryList()
})
</script>

<style lang="scss" scoped>
.survey-category-container {
  padding: 20px;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 20px;
    }
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>