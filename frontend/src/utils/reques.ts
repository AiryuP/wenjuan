import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
const instance: AxiosInstance = axios.create({
  baseURL: "", // 基础 URL
  timeout: 50000, // 请求超时时间
});
// 请求拦截器
instance.interceptors.request.use(
  // AxiosRequestConfig 类型CreateAxiosDefaults不能赋值给AxiosRequestConfig
  (config: InternalAxiosRequestConfig) => {
    // 在请求发送之前可以做一些处理，比如添加请求头等
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
    const { data } = response;
    if (data.code === 401) {
    }
    if (data.code !== 200) {
      return Promise.reject(data);
    }
    // 对响应数据做点什么
    return data;
  },
  (error: any) => {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);
export default instance;
