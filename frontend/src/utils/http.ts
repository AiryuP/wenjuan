import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

/**
 * 接口响应通用格式
 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

/**
 * 创建axios实例并配置
 */
const service: AxiosInstance = axios.create({
  baseURL: '', // 从环境变量获取API基础URL
  timeout: 30000, // 请求超时时间（毫秒）
  withCredentials: true, // 跨域请求是否携带cookie
});

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token并添加到请求头
    const token = localStorage.getItem('wenjuan_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    
    // 状态码不为200，视为请求异常
    if (res.code !== 200) {
      // 处理token失效的情况
      if (res.code === 401) {
        // 清除token并跳转登录页
        localStorage.removeItem('wenjuan_token');
        // 获取当前路径，登录后可以重定向回来
        const currentPath = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }
      
      // 显示错误消息
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '未知错误'));
    }
    
    // 正常返回数据
    return res;
  },
  (error: any) => {
    // 处理网络错误、超时等异常情况
    let message = '';
    if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
        case 400:
          message = '请求参数错误';
          break;
        case 401:
          message = '登录已过期，请重新登录';
          // 清除token并跳转到登录页
          localStorage.removeItem('wenjuan_token');
          // 获取当前路径，登录后可以重定向回来
          const currentPath = window.location.pathname;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          break;
        case 403:
          message = '没有权限访问该资源';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = `请求失败(${error.response.status})`;
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      if (error.message.includes('timeout')) {
        message = '请求超时，请稍后再试';
      } else {
        message = '网络错误，请检查您的网络连接';
      }
    } else {
      // 请求设置有问题
      message = error.message;
    }
    
    // 显示错误提示
    ElMessage.error(message);
    console.error('请求错误详情:', error);
    
    return Promise.reject(error);
  }
);

/**
 * 封装GET请求
 * @param url 请求地址
 * @param params 请求参数
 * @param config 额外配置
 */
export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return service.get(url, { params, ...config });
}

/**
 * 封装POST请求
 * @param url 请求地址
 * @param data 请求体数据
 * @param config 额外配置
 */
export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return service.post(url, data, config);
}

/**
 * 封装PUT请求
 * @param url 请求地址
 * @param data 请求体数据
 * @param config 额外配置
 */
export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return service.put(url, data, config);
}

/**
 * 封装PATCH请求
 * @param url 请求地址
 * @param data 请求体数据
 * @param config 额外配置
 */
export function patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return service.patch(url, data, config);
}

/**
 * 封装DELETE请求
 * @param url 请求地址
 * @param config 额外配置
 */
export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return service.delete(url, config);
}

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  request: service,
}; 