// 用于管理token的工具函数

// token在localStorage中的key
const TOKEN_KEY = 'token';

/**
 * 获取token
 * @returns token字符串或null
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 设置token
 * @param token token字符串
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 移除token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 判断是否已登录
 * @returns 是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getToken();
}