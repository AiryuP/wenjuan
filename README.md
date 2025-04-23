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
- 运行端口：4124

## 项目结构

```
wenjuan/
├── README.md              # 项目说明文档
├── backend/               # 后端代码目录（待开发）
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

### 计划实现
- 用户认证系统（登录/注册）
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
  - 用户管理
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

后端服务将在 http://localhost:4124 上运行

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
});

// POST请求
request.post('/api/surveys', { title: '新问卷' }).then(res => {
  console.log(res);
});
```

## 贡献指南

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 更新日志

### v0.0.1 (初始版本)
- 项目基础架构搭建
- Vue 3 + TypeScript + Vite开发环境配置
- 路由系统配置（含自动路由注册功能）
- HTTP请求封装（Axios）
- 基础页面布局框架
- 样式系统（Sass）

## 待解决问题

- 完善登录页面功能
- 实现问卷编辑器核心功能
- 开发后端API接口
- 优化移动端适配
- 添加单元测试

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 项目Issues
- 电子邮件：[待添加]