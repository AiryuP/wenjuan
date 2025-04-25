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

### 计划实现
- 问卷创建与编辑功能
  - 拖拽式问卷设计器
  - 多种题型支持（单选、多选、填空等）
  - 问卷逻辑设置
- 问卷模板管理
  - 预设模板库
  - 自定义模板保存
- 问卷发布与分享
  - 生成分享链接
  - 二维码分享
- 问卷数据收集与统计
  - 实时数据统计
  - 数据导出功能
- 数据可视化展示
  - 图表展示
  - 数据分析报告
- 后端API开发
  - 问卷存储
  - 数据处理

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

使用 `src/utils/reques.ts` 中封装的Axios实例进行API请求，已配置了请求/响应拦截器处理认证和错误情况。

```typescript
// 示例用法
import request from '@/utils/reques';

// GET请求
request.get('/api/surveys').then(res => {
  console.log(res);
}).catch(err => {
  console.error(err);
});

// POST请求
request.post('/api/surveys', { title: '新问卷' }).then(res => {
  console.log(res);
}).catch(err => {
  console.error(err);
});
```

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

#### 接口权限控制

系统中的以下接口需要认证才能访问：

- `POST /api/survey-categories` - 创建问卷分类
- `PATCH /api/survey-categories/:id` - 更新问卷分类
- `DELETE /api/survey-categories/:id` - 删除问卷分类

以下接口可以公开访问：

- `GET /api/survey-categories` - 获取所有问卷分类
- `GET /api/survey-categories/:id` - 获取指定问卷分类

## 贡献指南

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

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