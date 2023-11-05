// 基于 axios 封装的请求模块
import axios from 'axios'
import { serverHost } from '@/config/config.default'
import store from '@/store/'
import { Toast } from 'vant'
import router from '@/router/'

const request = axios.create({
  baseURL: serverHost + '/api' // 请求基础路径
  // baseURL: serverHost // 请求基础路径
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 开启loading
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })
    // 在请求发送之前做一些处理
    // 获取本地存储中的user信息
    const { user } = store.state
    if (user) {
      // 设置统一的token
      config.headers.Authorization = `Bearer ${user.token}`
    }
    return config
  },
  (error) => {
    // 当请求失败的时候做一些处理
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 在响应成功之后做一些处理
    // 关闭loading
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
      duration: 1
    })
    return response
  },
  (error) => {
    // 当响应失败的时候做一些处理
    if (error.response.status === 400) {
      // 400 客户端参数错误
      Toast('参数错误')
    } else if (error.response.status === 401) {
      Toast('登录已过期')
      router.push({
        name: 'login',
        query: {
          redirect: window.location.hash.replace('#', '')
        }
      })
    } else if (error.response.status >= 500) {
      // 服务端错误
      Toast('服务器异常，请稍后重试')
    } else {
      Toast.loading({
        message: '加载中...',
        forbidClick: true,
        duration: 1
      })
    }
    return Promise.reject(error)
  }
)

export default request
