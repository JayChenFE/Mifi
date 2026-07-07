import axios from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code === 200) {
      return data.data
    }
    ElMessage.error(data.message || '请求失败')
    return Promise.reject(data)
  },
  (error) => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  },
)

export function get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
  return instance.get(url, { params })
}

export function post<T = any>(url: string, data?: any): Promise<T> {
  return instance.post(url, data)
}

export function put<T = any>(url: string, data?: any): Promise<T> {
  return instance.put(url, data)
}

export function del<T = any>(url: string): Promise<T> {
  return instance.delete(url)
}

export default instance
