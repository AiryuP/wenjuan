<template>
  <div class="survey-analysis-container">
    <!-- 顶部标题区域 -->
    <div class="header-panel">
      <div class="panel-header">
        <el-icon><DataLine /></el-icon> 问卷数据分析 - {{ surveyInfo.title }}
      </div>
      <div class="survey-info">
        <div class="info-item">
          <span class="label">问卷ID:</span>
          <span class="value">{{ surveyInfo.id }}</span>
        </div>
        <div class="info-item">
          <span class="label">回复数量:</span>
          <span class="value highlight">{{ surveyInfo.respondentCount }}</span>
        </div>
      </div>
    </div>
    
    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton style="width: 100%" :rows="10" animated />
    </div>
    
    <!-- 数据为空时显示 -->
    <el-empty v-else-if="!hasData" description="暂无回复数据，请等待用户提交问卷" />
    
    <!-- 数据分析内容 -->
    <div v-else class="analysis-content">
      <!-- 回复时间趋势图 -->
      <div class="analysis-card">
        <div class="card-header">
          <el-icon><TrendCharts /></el-icon> 回复时间趋势
        </div>
        <div class="card-body">
          <div ref="timeChartRef" class="chart-container"></div>
        </div>
      </div>
      
      <!-- 问题数据分析 -->
      <div v-for="(question, index) in questionStats" :key="question.id" class="analysis-card">
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon> 
          <span>问题{{ index + 1 }}: {{ question.title }}</span>
          <span class="question-type">({{ getQuestionTypeText(question.type) }})</span>
        </div>
        <div class="card-body">
          <!-- 单选题和多选题 -->
          <div v-if="['radio', 'checkbox'].includes(question.type)" class="option-stats">
            <!-- 柱状图 -->
            <div :ref="`chartRef_${question.id}`" :data-question-id="question.id" class="chart-container"></div>
            
            <!-- 选项数据表格 -->
            <el-table :data="getOptionsTableData(question)" style="width: 100%" border>
              <el-table-column prop="label" label="选项" />
              <el-table-column prop="count" label="回复数量" width="120" align="center" />
              <el-table-column prop="percentage" label="占比" width="120" align="center">
                <template #default="scope">
                  <span>{{ scope.row.percentage }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <!-- 评分题 -->
          <div v-else-if="question.type === 'rate'" class="rate-stats">
            <div class="average-rate">
              <div class="rate-label">平均分</div>
              <div class="rate-value">{{ question.averageRate }}</div>
              <el-rate v-model="question.averageRate" disabled show-score text-color="#ff9900" />
            </div>
            
            <div :ref="`chartRef_${question.id}`" :data-question-id="question.id" class="chart-container"></div>
          </div>
          
          <!-- 文本题 -->
          <div v-else-if="question.type === 'text'" class="text-stats">
            <div class="text-count">共收到 {{ question.answers.length }} 条回复</div>
            
            <el-collapse v-if="question.answers.length > 0">
              <el-collapse-item title="查看所有文本回复">
                <div v-for="(answer, aIndex) in question.answers" :key="aIndex" class="text-answer">
                  <div class="answer-index">{{ aIndex + 1 }}</div>
                  <div class="answer-content">{{ answer }}</div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import axios from '@/utils/reques'
import { DataLine, DataAnalysis, TrendCharts } from '@element-plus/icons-vue'

// 路由参数
const route = useRoute()
const surveyId = route.params.id

// 数据状态
const loading = ref(true)
const hasData = ref(false)
const timeChartRef = ref(null)
const chartInstances = reactive(new Map())

// 问卷基本信息
const surveyInfo = reactive({
  id: 0,
  title: '加载中...',
  description: '',
  respondentCount: 0
})

// 问题统计数据
const questionStats = ref([])
const timeDistribution = ref([])

// 获取问卷分析数据
const fetchAnalysisData = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/api/surveys/${surveyId}/analysis`)
    console.log('分析数据:', res)
    
    // 更新问卷信息
    Object.assign(surveyInfo, res.data.surveyInfo || {})
    
    // 更新问题统计数据
    questionStats.value = res.data.questionStats || []
    
    // 更新时间分布数据
    timeDistribution.value = res.data.timeDistribution || []
    
    // 判断是否有数据
    hasData.value = surveyInfo.respondentCount > 0
    
    // 渲染图表
    await nextTick()
    if (hasData.value) {
      renderTimeChart()
      renderQuestionCharts()
    }
  } catch (error) {
    console.error('获取分析数据失败', error)
    ElMessage.error('获取分析数据失败')
  } finally {
    loading.value = false
  }
}

// 渲染时间趋势图
const renderTimeChart = () => {
  if (!timeChartRef.value || timeDistribution.value.length === 0) return
  
  const chartInstance = echarts.init(timeChartRef.value)
  chartInstances.set('timeChart', chartInstance)
  
  const dates = timeDistribution.value.map(item => item.date)
  const counts = timeDistribution.value.map(item => item.count)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [{
      name: '回复数量',
      type: 'line',
      data: counts,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#409EFF'
      },
      lineStyle: {
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(64, 158, 255, 0.5)'
          }, {
            offset: 1,
            color: 'rgba(64, 158, 255, 0.1)'
          }]
        }
      }
    }]
  }
  
  chartInstance.setOption(option)
}

// 渲染问题图表
const renderQuestionCharts = () => {
  questionStats.value.forEach(question => {
    const chartRefName = `chartRef_${question.id}`
    const chartContainer = document.querySelector(`[data-question-id="${question.id}"]`)
    
    if (!chartContainer) return
    
    nextTick(() => {
      const chartInstance = echarts.init(chartContainer)
      chartInstances.set(chartRefName, chartInstance)
      
      if (['radio', 'checkbox'].includes(question.type)) {
        renderOptionChart(chartInstance, question)
      } else if (question.type === 'rate') {
        renderRateChart(chartInstance, question)
      }
    })
  })
}

// 渲染选项题图表
const renderOptionChart = (chartInstance, question) => {
  const optionsData = getOptionsTableData(question)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: optionsData.map(item => item.label)
    },
    series: [
      {
        name: question.title,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: optionsData.map(item => ({
          value: item.count,
          name: item.label
        }))
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 渲染评分题图表
const renderRateChart = (chartInstance, question) => {
  const rateData = []
  
  for (const [rate, count] of Object.entries(question.rateDistribution)) {
    rateData.push({
      rate: `${rate}分`,
      count
    })
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: rateData.map(item => item.rate)
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '回复数量',
        type: 'bar',
        barWidth: '60%',
        data: rateData.map(item => item.count),
        itemStyle: {
          color: function(params) {
            // 根据分值设置不同颜色
            const colors = ['#F56C6C', '#E6A23C', '#E6A23C', '#67C23A', '#409EFF']
            const rate = parseInt(params.name)
            return colors[rate - 1] || '#409EFF'
          }
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 获取问题类型文本
const getQuestionTypeText = (type) => {
  const typeMap = {
    'radio': '单选题',
    'checkbox': '多选题',
    'text': '文本题',
    'rate': '评分题'
  }
  return typeMap[type] || type
}

// 获取选项表格数据
const getOptionsTableData = (question) => {
  if (!question || !question.options) return []
  
  const result = []
  let totalCount = 0
  
  // 计算总数
  for (const key in question.options) {
    if (Object.prototype.hasOwnProperty.call(question.options, key)) {
      totalCount += question.options[key].count
    }
  }
  
  // 构建数据
  for (const key in question.options) {
    if (Object.prototype.hasOwnProperty.call(question.options, key)) {
      const option = question.options[key]
      result.push({
        value: key,
        label: option.label,
        count: option.count,
        percentage: totalCount > 0 ? Math.round((option.count / totalCount) * 100) : 0
      })
    }
  }
  
  return result
}

// 生命周期钩子
onMounted(() => {
  fetchAnalysisData()
  
  // 窗口大小改变时，重新调整图表大小
  window.addEventListener('resize', () => {
    chartInstances.forEach(chart => {
      chart.resize()
    })
  })
})
</script>

<style lang="scss" scoped>
.survey-analysis-container {
  padding: 20px;
  
  .header-panel {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    .panel-header {
      font-size: 18px;
      font-weight: bold;
      color: #303133;
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      
      .el-icon {
        color: #409EFF;
        margin-right: 8px;
        font-size: 20px;
      }
    }
    
    .survey-info {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      
      .info-item {
        display: flex;
        align-items: center;
        
        .label {
          color: #909399;
          margin-right: 5px;
        }
        
        .value {
          color: #606266;
          
          &.highlight {
            font-weight: bold;
            color: #409EFF;
            font-size: 16px;
          }
        }
      }
    }
  }
  
  .loading-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .analysis-content {
    .analysis-card {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      
      .card-header {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        
        .el-icon {
          color: #409EFF;
          margin-right: 8px;
        }
        
        .question-type {
          color: #909399;
          font-weight: normal;
          font-size: 14px;
          margin-left: 8px;
        }
      }
      
      .card-body {
        .chart-container {
          width: 100%;
          height: 400px;
          margin-bottom: 20px;
        }
        
        .option-stats {
          .el-table {
            margin-top: 20px;
          }
        }
        
        .rate-stats {
          .average-rate {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            
            .rate-label {
              font-weight: bold;
              margin-right: 15px;
            }
            
            .rate-value {
              font-size: 24px;
              color: #ff9900;
              font-weight: bold;
              margin-right: 15px;
            }
          }
        }
        
        .text-stats {
          .text-count {
            margin-bottom: 15px;
            color: #606266;
          }
          
          .text-answer {
            display: flex;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 4px;
            background-color: #f9f9f9;
            
            .answer-index {
              width: 30px;
              height: 30px;
              background-color: #409EFF;
              color: #fff;
              border-radius: 50%;
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 14px;
              margin-right: 15px;
            }
            
            .answer-content {
              flex: 1;
              line-height: 1.6;
            }
          }
        }
      }
    }
  }
}
</style> 