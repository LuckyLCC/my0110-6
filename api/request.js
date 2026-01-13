// api/request.js - API请求封装
const BASE_URL = 'http://192.168.3.51:8080/api';

// 请求拦截器
const request = (options) => {
  console.log('发起请求:', BASE_URL + options.url, options); // 添加调试日志
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + uni.getStorageSync('token') || ''
      },
      success: (res) => {
        console.log('请求成功:', res); // 添加成功调试日志
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          // 处理错误情况
          console.error('请求失败:', res);
          reject(res);
        }
      },
      fail: (err) => {
        console.error('网络错误详情:', err); // 更详细的错误日志
        console.error('错误对象详细信息:', JSON.stringify(err, null, 2)); // 添加JSON格式的错误信息
        reject(err);
      }
    });
  });
};

// 封装各种API请求方法
export const api = {
  // 用户相关API
  user: {
    // 用户登录
    login: (code) => request({ url: '/user/login', method: 'POST', data: { code } }),
    
    // 获取用户信息
    getInfo: () => request({ url: '/user/info', method: 'GET' }),
    
    // 更新用户信息
    updateInfo: (params) => request({ url: '/user/update-info', method: 'POST', data: params }),
    
    // 绑定手机号
    bindPhone: (phone) => request({ url: '/user/bind-phone', method: 'POST', data: { phone } })
  },

  // 会员套餐相关API
  packages: {
    // 获取所有会员套餐
    getAll: () => request({ url: '/packages/all', method: 'GET' }),
    
    // 根据分类获取会员套餐
    getByCategory: (category) => request({ url: '/packages/category?category=' + encodeURIComponent(category), method: 'GET' }),
    
    // 获取单个套餐详情
    getById: (id) => request({ url: `/packages/${id}`, method: 'GET' })
  },

  // 预约相关API
  booking: {
    // 创建预约订单
    create: (params) => request({ url: '/booking/create', method: 'POST', data: params }),
    
    // 支付预约订单
    pay: (orderId) => request({ url: `/booking/pay/${orderId}`, method: 'POST' }),
    
    // 获取用户所有订单
    getOrders: () => request({ url: '/booking/orders', method: 'GET' }),
    
    // 根据状态获取用户订单
    getOrdersByStatus: (status) => request({ url: `/booking/orders/status/${status}`, method: 'GET' }),
    
    // 更新订单状态
    updateStatus: (orderId, status) => request({ url: `/booking/order/${orderId}/status`, method: 'PUT', data: { status } }),
    
    // 检查用户是否可以预订当天
    canBookToday: (date) => request({ url: `/booking/can-book-today`, method: 'GET', data: { date } }),
    
    // 获取订单详情
    getOrderDetail: (orderId) => request({ url: `/booking/order/${orderId}`, method: 'GET' })
  }
};