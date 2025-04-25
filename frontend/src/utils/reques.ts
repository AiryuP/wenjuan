import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
const instance: AxiosInstance = axios.create({
  baseURL: "", // 基础 URL
  timeout: 50000, // 请求超时时间
  withCredentials: true, // 允许跨域请求携带凭证
});
// 请求拦截器
instance.interceptors.request.use(
  // AxiosRequestConfig 类型CreateAxiosDefaults不能赋值给AxiosRequestConfig
  (config: InternalAxiosRequestConfig) => {
    // 在请求发送之前可以做一些处理，比如添加请求头等
    // 从localStorage获取token并添加到请求头
    const token = localStorage.getItem('wenjuan_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);
// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('原始响应:', response);
    const { data } = response;
    if (data.code === 401) {
      // token过期或无效，清除本地token并跳转到登录页
      localStorage.removeItem('wenjuan_token');
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return Promise.reject(data);
    }
    if (data.code !== 200) {
      return Promise.reject(data);
    }
    // 对响应数据做点什么
    return data;
  },
  (error: any) => {
    // 对响应错误做点什么
    console.error('请求错误:', error);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
    } else if (error.request) {
      console.error('未收到响应:', error.request);
    } else {
      console.error('请求配置错误:', error.message);
    }
    console.error('请求配置:', error.config);
    return Promise.reject(error);
  }
);
export default instance;
