# HTTP请求模块使用说明

## 简介

`http.ts` 是基于Axios封装的HTTP请求工具，提供了统一的接口调用方式、请求/响应拦截、错误处理等功能，并内置了JWT认证支持。

## 主要功能

- 统一的API调用方式
- 自动携带JWT Token认证
- 响应数据统一处理
- 全局错误处理与提示
- 登录失效自动跳转登录页

## 基本用法

```typescript
import http from '@/utils/http';

// GET请求
http.get('/api/surveys').then(res => {
  console.log(res.data);
}).catch(err => {
  console.error(err);
});

// 带参数的GET请求
http.get('/api/surveys', { 
  title: '问卷标题',
  status: 1
}).then(res => {
  console.log(res.data);
});

// POST请求
http.post('/api/surveys', {
  title: '新问卷',
  description: '问卷描述'
}).then(res => {
  console.log(res.data);
});

// PATCH请求
http.patch('/api/surveys/1', {
  title: '更新的问卷标题'
}).then(res => {
  console.log(res.data);
});

// DELETE请求
http.delete('/api/surveys/1').then(res => {
  console.log('删除成功');
});
```

## 使用async/await

```typescript
// 异步函数中使用
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

## 响应数据结构

所有接口返回的数据格式如下：

```typescript
{
  code: number;    // 状态码，200表示成功
  data: any;       // 返回的数据
  message: string; // 消息提示
}
```

## 错误处理

http模块已经内置了基本的错误处理逻辑：

1. 状态码为非200的情况会自动显示错误提示
2. 401状态码会自动清除token并跳转到登录页
3. 网络错误、超时等异常会显示相应的错误提示

如需自定义错误处理，可以使用catch捕获：

```typescript
http.get('/api/data').then(res => {
  // 处理成功响应
}).catch(err => {
  // 自定义错误处理
  if (err.response && err.response.status === 403) {
    // 处理权限不足的情况
  }
});
```

## JWT认证

http模块会自动从localStorage获取名为'wenjuan_token'的token并添加到请求头的Authorization字段，格式为：

```
Authorization: Bearer <token>
```

当接口返回401状态码时，会自动清除token并跳转到登录页，同时携带当前页面的路径作为重定向参数。 