# 问卷系统

## 项目介绍

这是一个基于Vue 3和TypeScript开发的前后端分离问卷系统。该系统允许用户创建、编辑、分享和收集问卷数据，提供直观的用户界面和便捷的操作体验。

## 技术栈

### 前端
- Vue 3 (使用Composition API和`<script setup>`语法)
- TypeScript
- Vue Router 4 (路由管理)
- Axios (HTTP请求封装)
- Sass (样式预处理器)
- Vite (构建工具)

### 后端
- NestJS (Node.js框架)
- TypeScript
- JWT认证 (JSON Web Token)
- TypeORM (数据库ORM)
- 运行端口：4124

## 项目结构

```
wenjuan/
├── README.md              # 项目说明文档
├── backend/               # 后端代码目录
│   ├── src/               # 源代码
│   │   ├── auth/          # 认证模块
│   │   │   ├── auth.controller.ts   # 认证控制器
│   │   │   ├── auth.service.ts      # 认证服务
│   │   │   ├── auth.module.ts       # 认证模块配置
│   │   │   └── jwt-auth.guard.ts    # JWT认证守卫
│   │   ├── survey-category/  # 问卷分类模块
│   │   ├── user/           # 用户模块
│   │   ├── app.module.ts   # 应用程序主模块
│   │   └── main.ts         # 入口文件
├── frontend/              # 前端代码目录
    ├── public/            # 静态资源
    │   └── vite.svg       # Vite logo
    ├── src/               # 源代码
    │   ├── assets/        # 资源文件
    │   ├── components/    # 公共组件
    │   ├── router/        # 路由配置
    │   │   ├── index.ts           # 路由主文件（含自动路由注册功能）
    │   │   └── router.default.ts  # 默认路由配置
    │   ├── styles/        # 全局样式
    │   │   ├── index.scss         # 样式入口文件
    │   │   └── reset.scss         # 样式重置文件
    │   ├── utils/         # 工具函数
    │   │   └── reques.ts          # HTTP请求封装
    │   ├── views/         # 页面视图
    │   │   ├── main/              # 主要页面
    │   │   │   ├── Home.vue       # 首页组件
    │   │   │   └── Login.vue      # 登录页组件
    │   │   └── page/              # 其他页面（支持自动路由注册）
    │   │       └── survey/        # 问卷相关页面
    │   │           ├── editor/    # 问卷编辑器
    │   │           ├── make/      # 问卷管理
    │   │           ├── manage/    # 问卷列表
    │   │           └── preview.vue # 问卷预览
    │   ├── App.vue        # 根组件
    │   └── main.js        # 入口文件
    ├── index.html         # HTML模板
    ├── package.json       # 依赖配置
    ├── tsconfig.json      # TypeScript配置
    ├── tsconfig.node.json # Node.js的TypeScript配置
    ├── vite.config.js     # Vite配置
    └── yarn.lock          # 依赖版本锁定文件
```

## 功能模块

### 当前已实现
- 基础项目架构搭建
- Vue 3 + TypeScript + Vite开发环境配置
- 路由系统配置（含自动路由注册功能）
- HTTP请求封装（Axios）
- 基础页面布局框架
- 样式系统（Sass）
- 统一API响应格式处理
- Promise链式API调用方式（.then/.catch）
- JWT用户认证系统
- 接口权限控制
- 问卷管理
  - 问卷列表展示
  - 问卷分类过滤
  - 问卷状态管理
- 问卷编辑器
  - 多种题型支持（单选、多选、填空、评分）
  - 拖拽式问题添加
  - 问题排序与编辑
  - 问卷信息配置
- 问卷预览功能
  - 实时预览编辑中的问卷
  - 支持从列表打开特定问卷进行预览
  - 预览模式下可查看提交数据格式
- 问卷数据分析
  - 回复时间趋势分析
  - 不同题型的数据可视化展示
  - 单选/多选题的选项分布统计
  - 评分题的分值分布与平均分统计
  - 文本题的回复内容汇总

### 计划实现
- 问卷创建与编辑功能
  - 更多题型支持（下拉选择、图片题等）
  - 问卷逻辑设置
  - 题目跳转逻辑
- 问卷模板管理
  - 预设模板库
  - 自定义模板保存
- 问卷发布与分享
  - 生成分享链接
  - 二维码分享
- 问卷数据收集与统计
  - 数据导出功能
  - 更多数据可视化图表
- 数据可视化展示
  - 自定义报表功能
  - 交互式数据分析
- 后端API开发
  - 问卷存储优化
  - 数据处理性能优化

## 安装与运行

### 前端

```bash
# 进入前端目录
cd frontend

# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

### 后端

```bash
# 进入后端目录
cd backend

# 安装依赖
yarn install

# 开发模式启动（自动重启）
yarn start:dev

# 生产模式启动
yarn start:prod
```

后端服务将在 http://localhost:4124 上运行，所有API接口都以 `/api` 为前缀

# 构建生产版本
yarn build

# 预览生产构建
yarn preview
```

开发服务器将在默认端口启动

## 开发指南

### 自动路由注册

系统实现了自动路由注册功能，只需在 `src/views/page` 目录下创建新的Vue组件，系统会自动将其注册为路由。路由路径和名称会根据文件路径自动生成。

例如：
- 文件路径：`src/views/page/Survey.vue` → 路由路径：`/survey`
- 文件路径：`src/views/page/manage/List.vue` → 路由路径：`/manage/list`

### API请求

使用 `src/utils/http.ts` 中封装的Axios实例进行API请求，已配置了请求/响应拦截器处理认证和错误情况。

```typescript
// 示例用法
import http from '@/utils/http';

// GET请求
http.get('/api/surveys').then(res => {
  console.log(res.data);
}).catch(err => {
  console.error(err);
});

// POST请求
http.post('/api/surveys', { title: '新问卷' }).then(res => {
  console.log(res.data);
}).catch(err => {
  console.error(err);
});

// 使用async/await
async function fetchData() {
  try {
    const res = await http.get('/api/surveys');
    return res.data;
  } catch (error) {
    console.error('获取数据失败', error);
    return [];
  }
}
```

http模块主要功能：
- 统一的API调用方式
- 自动携带JWT Token认证
- 响应数据统一处理
- 全局错误处理与提示
- 登录失效自动跳转登录页

详细说明请查看 `src/utils/README.md`。

### API响应格式

所有后端API响应都遵循以下统一格式：

```javascript
{
  "code": 200,           // 状态码，200表示成功，其他表示错误
  "data": {},            // 响应数据，可能是对象、数组或null
  "message": "成功信息"   // 响应消息
}
```

错误响应示例：

```javascript
{
  "code": 400,
  "data": null,
  "message": "参数错误",
  "path": "/api/surveys",
  "timestamp": "2023-12-10T12:34:56.789Z"
}
```

### 用户认证与授权

系统使用JWT（JSON Web Token）进行用户认证。

#### 登录获取Token

```typescript
// 登录请求
axios.post('/api/login/login', {
  username: 'xxxx',
  password: 'xxxx',
  captcha: 'xxxx'
}).then(res => {
  // 存储token
  localStorage.setItem('wenjuan_token', res.data.token);
});
```

#### 请求携带Token

前端的请求拦截器会自动从localStorage获取token并添加到请求头：

```typescript
// 请求拦截器（已在reques.ts中实现）
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('wenjuan_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
```

### 问卷系统功能使用指南

#### 问卷编辑器
问卷编辑器提供了直观的界面来创建和编辑问卷。主要功能包括：

1. **添加问题**：可以通过拖拽左侧的题型组件到中间区域，或点击"添加单选题"按钮添加问题。
2. **编辑问题**：点击问题可以编辑标题、选项等内容。
3. **排序问题**：通过拖动问题左侧的拖动手柄可以调整问题顺序。
4. **删除问题**：点击问题右上角的删除按钮可以删除当前问题。
5. **设置问卷信息**：可以编辑问卷标题、描述、分类等基本信息。
6. **保存问卷**：点击顶部的"保存"按钮可以保存当前问卷。
7. **预览问卷**：点击顶部的"预览"按钮可以在新窗口中预览当前问卷。

#### 问卷预览功能
问卷预览功能允许用户在发布前查看问卷的实际效果：

1. **编辑器预览**：在编辑问卷时点击"预览"按钮，系统会在新窗口中打开预览页面，显示当前编辑的问卷内容。
2. **列表预览**：在问卷列表中，点击特定问卷的"预览"按钮可以预览该问卷。
3. **模拟提交**：在预览模式下，用户可以填写问卷并进行提交测试，系统会显示收集到的数据格式，但不会实际保存提交内容。
4. **预览效果**：预览页面与最终用户看到的问卷完全一致，包括所有题型的显示效果和交互功能。

#### 接口权限控制

系统中的以下接口需要认证才能访问：

- `POST /api/survey-categories` - 创建问卷分类
- `PATCH /api/survey-categories/:id` - 更新问卷分类
- `DELETE /api/survey-categories/:id` - 删除问卷分类
- `POST /api/surveys` - 创建问卷
- `PATCH /api/surveys/:id` - 更新问卷
- `DELETE /api/surveys/:id` - 删除问卷

以下接口可以公开访问：

- `GET /api/survey-categories` - 获取所有问卷分类
- `GET /api/survey-categories/:id` - 获取指定问卷分类
- `GET /api/surveys` - 获取问卷列表
- `GET /api/surveys/:id` - 获取指定问卷
- `GET /api/surveys/:id/preview` - 预览指定问卷

## 后端API接口

### 问卷管理相关接口

#### 1. 获取问卷列表
- **URL**: `/api/surveys`
- **方法**: `GET`
- **参数**:
  - `title`: 问卷标题（模糊查询）
  - `categoryId`: 分类ID
  - `status`: 问卷状态（0:草稿, 1:已发布, 2:已关闭）
  - `isCollecting`: 收集状态（true/false）
  - `tags`: 标签IDs（逗号分隔）
  - `startDate`: 开始日期
  - `endDate`: 结束日期
  - `pageNum`: 页码，默认为1
  - `pageSize`: 每页数量，默认为10
- **返回示例**:
  ```json
  {
    "code": 200,
    "data": {
      "items": [
        {
          "id": 1,
          "title": "产品满意度调查",
          "description": "调查用户对产品的满意程度",
          "status": 1,
          "isCollecting": true,
          "respondentCount": 120,
          "categoryId": 1,
          "category": {
            "id": 1,
            "name": "产品评测"
          },
          "questions": [...],
          "tags": [1, 3],
          "createdAt": "2023-12-05T08:30:00.000Z",
          "updatedAt": "2023-12-05T15:45:00.000Z"
        },
        // 更多问卷...
      ],
      "total": 35
    },
    "message": "获取成功"
  }
  ```

#### 2. 获取单个问卷详情
- **URL**: `/api/surveys/{id}`
- **方法**: `GET`
- **参数**: 无
- **返回示例**:
  ```json
  {
    "code": 200,
    "data": {
      "id": 1,
      "title": "产品满意度调查",
      "description": "调查用户对产品的满意程度",
      "status": 1,
      "isCollecting": true,
      "respondentCount": 120,
      "categoryId": 1,
      "category": {
        "id": 1,
        "name": "产品评测"
      },
      "questions": [
        {
          "id": "q1",
          "type": "radio",
          "title": "您对我们的产品总体满意度如何？",
          "required": true,
          "options": [
            {"value": "1", "label": "非常满意"},
            {"value": "2", "label": "满意"},
            {"value": "3", "label": "一般"},
            {"value": "4", "label": "不满意"},
            {"value": "5", "label": "非常不满意"}
          ]
        },
        // 更多问题...
      ],
      "tags": [1, 3],
      "createdAt": "2023-12-05T08:30:00.000Z",
      "updatedAt": "2023-12-05T15:45:00.000Z"
    },
    "message": "获取成功"
  }
  ```

#### 3. 创建问卷
- **URL**: `/api/surveys`
- **方法**: `POST`
- **参数**:
  ```json
  {
    "title": "新产品满意度调查",
    "description": "调查用户对新产品的满意程度",
    "categoryId": 1,
    "isPublished": true,
    "questions": [
      {
        "id": "q1",
        "type": "radio",
        "title": "您对我们的产品总体满意度如何？",
        "required": true,
        "options": [
          {"value": "1", "label": "非常满意"},
          {"value": "2", "label": "满意"},
          {"value": "3", "label": "一般"},
          {"value": "4", "label": "不满意"},
          {"value": "5", "label": "非常不满意"}
        ]
      },
      // 更多问题...
    ],
    "tags": [1, 3]
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "data": {
      "id": 5,
      "title": "新产品满意度调查",
      "description": "调查用户对新产品的满意程度",
      "status": 1,
      "isCollecting": true,
      "respondentCount": 0,
      "categoryId": 1,
      "questions": [...],
      "tags": [1, 3],
      "createdAt": "2023-12-10T09:45:00.000Z",
      "updatedAt": "2023-12-10T09:45:00.000Z"
    },
    "message": "创建成功"
  }
  ```

#### 4. 更新问卷
- **URL**: `/api/surveys/{id}`
- **方法**: `PATCH`
- **参数**: 同创建问卷
- **返回示例**:
  ```json
  {
    "code": 200,
    "data": {
      "id": 5,
      "title": "新产品满意度调查(更新版)",
      "description": "调查用户对新产品的满意程度",
      "status": 1,
      "isCollecting": true,
      "respondentCount": 0,
      "categoryId": 1,
      "questions": [...],
      "tags": [1, 3],
      "createdAt": "2023-12-10T09:45:00.000Z",
      "updatedAt": "2023-12-10T10:15:00.000Z"
    },
    "message": "更新成功"
  }
  ```

#### 5. 删除问卷
- **URL**: `/api/surveys/{id}`
- **方法**: `DELETE`
- **参数**: 无
- **返回示例**:
  ```json
  {
    "code": 200,
    "data": null,
    "message": "删除成功"
  }
  ```

#### 6. 切换问卷收集状态
- **URL**: `/api/surveys/{id}/toggle-collect`
- **方法**: `POST`
- **参数**: 无
- **返回示例**:
  ```json
  {
    "code": 200,
    "data": {
      "id": 5,
      "isCollecting": false,
      // 其他问卷属性...
    },
    "message": "状态切换成功"
  }
  ```

### 问卷回复相关接口

#### 1. 提交问卷回复
- **URL**: `/api/surveys/responses`
- **方法**: `POST`
- **参数**:
  ```json
  {
    "surveyId": 5,
    "answers": [
      {
        "questionId": "q1",
        "answer": "2"
      },
      {
        "questionId": "q2",
        "answer": ["a", "c"]
      },
      {
        "questionId": "q3",
        "answer": "这是一段文本回复"
      },
      {
        "questionId": "q4",
        "answer": 4
      }
    ]
  }
  ```
- **返回示例**:
  ```json
  {
    "code": 200,
    "data": {
      "id": 120,
      "surveyId": 5,
      "answers": [...],
      "createdAt": "2023-12-10T11:30:00.000Z"
    },
    "message": "提交成功"
  }
  ```

#### 2. 获取问卷回复列表
- **URL**: `/api/surveys/{id}/responses`
- **方法**: `GET`
- **参数**: 无
- **返回示例**:
  ```json
  {
    "code": 200,
    "data": [
      {
        "id": 120,
        "surveyId": 5,
        "answers": [...],
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2023-12-10T11:30:00.000Z"
      },
      // 更多回复...
    ],
    "message": "获取成功"
  }
  ```

#### 3. 获取问卷数据分析
- **URL**: `/api/surveys/{id}/analysis`
- **方法**: `GET`
- **参数**: 无
- **返回示例**:
  ```json
  {
    "code": 200,
    "data": {
      "surveyInfo": {
        "id": 1,
        "title": "产品满意度调查",
        "description": "了解用户对我们产品的满意程度",
        "respondentCount": 15
      },
      "questionStats": [
        {
          "id": "q1",
          "title": "您的性别是？",
          "type": "radio",
          "options": {
            "1": {
              "label": "男",
              "count": 8
            },
            "2": {
              "label": "女",
              "count": 7
            }
          }
        },
        {
          "id": "q2",
          "title": "您对我们的产品满意度如何？",
          "type": "rate",
          "rateDistribution": {
            "1": 0,
            "2": 1,
            "3": 3,
            "4": 5,
            "5": 6
          },
          "averageRate": 4.1
        }
      ],
      "timeDistribution": [
        {
          "date": "2023-10-10",
          "count": 5
        },
        {
          "date": "2023-10-11",
          "count": 10
        }
      ]
    },
    "message": "获取问卷分析数据成功"
  }
  ```

## 功能更新记录

### 2024年6月更新
- 新增问卷数据分析功能
  - 支持回复时间趋势图表展示
  - 不同题型的数据可视化分析
  - 单选/多选题选项分布饼图
  - 评分题分值分布柱状图
  - 文本题回复内容展示
  - 分析数据接口API实现

### 2024年5月更新
- 问卷预览功能完善
- 问卷回复收集功能优化
- 用户体验改进
  
### 2024年4月更新
- 问卷编辑器功能实现
- 问卷题型多样化支持
- 分类管理系统上线

## 贡献指南

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 项目反思与改进建议

### 当前完成的工作

1. **问卷预览功能实现**：
   - 创建了问卷预览页面组件 `/frontend/src/views/page/survey/preview.vue`
   - 支持从编辑器和问卷列表打开预览
   - 实现了预览模式下的表单填写和提交模拟
   - 适配了不同类型的问题展示（单选、多选、填空、评分）

2. **文档更新**：
   - 更新了README中的项目结构，添加了问卷预览相关文件
   - 补充了已实现功能中的问卷管理、编辑器和预览功能
   - 添加了问卷系统功能使用指南，详细说明了编辑器和预览功能的使用方法
   - 更新了接口权限控制部分，补充了问卷相关API

### 存在的问题和改进方向

1. **TypeScript兼容性问题**：
   - 修复了Promise.finally()的TypeScript兼容性问题，使用.then()替代
   - 建议优化项目的TypeScript配置，更新tsconfig.json中的lib选项，包含ES2018或更高版本以支持Promise.finally()

2. **数据流管理**：
   - 当前使用localStorage存储预览数据，建议考虑使用状态管理库（如Pinia或Vuex）统一管理预览状态
   - 可以减少对localStorage的依赖，提高数据流的可追踪性和可维护性

3. **用户体验改进**：
   - 添加加载状态显示，提升用户等待体验
   - 增强表单验证功能，提供更友好的错误提示
   - 支持问卷预览时的页面滚动定位功能

4. **功能扩展**：
   - 实现问卷逻辑跳转功能
   - 支持更多题型，如下拉选择、图片题、矩阵题等
   - 提供问卷模板功能，便于快速创建常用类型的问卷

5. **代码结构优化**：
   - 抽取问题组件为独立可复用组件，减少编辑器和预览页面的代码重复
   - 建立统一的问卷数据模型和类型定义
   - 增强错误处理和异常情况的处理机制

6. **测试覆盖**：
   - 添加单元测试和集成测试，确保功能稳定性
   - 针对核心功能添加端到端测试场景

通过以上改进，可以进一步提升问卷系统的功能完整性、稳定性和用户体验，使其成为一个更加成熟和专业的问卷解决方案。

## 更新日志

### v0.0.3 (当前版本)
- 实现JWT用户认证系统
- 添加JwtAuthGuard实现接口权限控制
- 保护POST/PATCH/DELETE接口，要求用户必须登录
- 完善问卷查询功能，支持多种查询条件

### v0.0.2
- 统一API响应格式
- 使用Promise链式API调用方式（.then/.catch）
- 添加全局异常处理过滤器
- 添加全局API前缀（/api）

### v0.0.1 (初始版本)
- 项目基础架构搭建
- Vue 3 + TypeScript + Vite开发环境配置
- 路由系统配置（含自动路由注册功能）
- HTTP请求封装（Axios）
- 基础页面布局框架
- 样式系统（Sass）

## 待解决问题

- 实现问卷编辑器核心功能
- 开发问卷数据存储和统计分析API
- 优化移动端适配
- 添加单元测试
- 完善接口文档
- 增强认证系统，添加用户角色和权限管理

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 项目Issues
- 电子邮件：[待添加]