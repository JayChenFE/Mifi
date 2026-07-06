import axios from 'axios'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code !== 200) {
      console.error(`[${data.code}] ${data.message}`)
    }
    return data
  },
  (error) => {
    console.error('Request error:', error.message)
    return Promise.reject(error)
  },
)

export default request
