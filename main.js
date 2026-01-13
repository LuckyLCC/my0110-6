import App from './App'
import { api } from './api/request'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  
  // 尝试自动登录
  app.config.globalProperties.$login = async function() {
    try {
      // 检查是否有已保存的token
      const token = uni.getStorageSync('token')
      if (token) {
        // 验证token是否有效
        try {
          await api.user.getInfo()
          return true
        } catch (error) {
          // Token无效，清除存储的token
          uni.removeStorageSync('token')
        }
      }
      
      // 调用微信登录
      const loginRes = await new Promise((resolve, reject) => {
        uni.login({
          provider: 'weixin',
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        })
      })
      
      // 调用后端登录接口
      const response = await api.user.login(loginRes.code)
      if (response.code === 200) {
        // 保存token
        uni.setStorageSync('token', response.data)
        return true
      } else {
        console.error('登录失败:', response.message)
        return false
      }
    } catch (error) {
      console.error('登录过程出错:', error)
      return false
    }
  }
  
  return {
    app
  }
}
// #endif