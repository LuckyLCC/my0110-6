// api/request.js - API请求封装
const BASE_URL = 'http://192.168.3.51:8080/api';

import {
  BookingStatus,
  CardStatus,
  PaymentOrderStatus,
  PaymentStatus,
  TransactionType,
  normalizeEnum,
  normalizeRoleToLower
} from './enums'

function normalizeResponse(url, payload) {
  // 只做最关键几类接口的枚举规范化/约束（避免到处散落字符串判断）
  try {
    // 登录：统一 role 小写，兼容旧逻辑
    if (url === '/user/login' && payload?.data?.userInfo) {
      payload.data.userInfo.role = normalizeRoleToLower(payload.data.userInfo.role)
    }

    // 用户信息：如果未来返回 role，也统一小写
    if (url === '/user/info' && payload?.data) {
      if (payload.data.role) {
        payload.data.role = normalizeRoleToLower(payload.data.role)
      }
    }

    // 购卡记录
    if (url === '/payment/orders' && Array.isArray(payload?.data)) {
      payload.data.forEach((o) => {
        o.status = normalizeEnum(o.status, Object.values(PaymentOrderStatus), { field: 'paymentOrder.status', defaultValue: PaymentOrderStatus.UNPAID })
        o.transactionType = normalizeEnum(o.transactionType, Object.values(TransactionType), { field: 'paymentOrder.transactionType', defaultValue: TransactionType.NEW })
        // cardStatus 是英文枚举，做严格校验
        if (o.cardStatus !== undefined) {
          o.cardStatus = normalizeEnum(o.cardStatus, Object.values(CardStatus), { field: 'paymentOrder.cardStatus', defaultValue: CardStatus.INACTIVE })
        }
      })
    }

    // 预约订单
    if (url === '/booking/orders' && Array.isArray(payload?.data)) {
      payload.data.forEach((o) => {
        o.status = normalizeEnum(o.status, Object.values(BookingStatus), { field: 'bookingOrder.status', defaultValue: BookingStatus.PENDING })
        o.paymentStatus = normalizeEnum(o.paymentStatus, Object.values(PaymentStatus), { field: 'bookingOrder.paymentStatus', defaultValue: PaymentStatus.UNPAID })
      })
    }
  } catch (e) {
    console.warn('[enum] 规范化响应失败:', url, e)
  }
  return payload
}

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
          resolve(normalizeResponse(options.url, res.data));
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
    login: (code, nickname, avatarUrl) => request({ 
      url: '/user/login', 
      method: 'POST', 
      data: { code, nickname, avatarUrl } 
    }),
    
    // 获取用户信息
    getInfo: () => request({ url: '/user/info', method: 'GET' }),
    
    // 更新用户信息
    updateInfo: (params) => request({ url: '/user/update-info', method: 'POST', data: params }),
    
    // 绑定手机号
    bindPhone: (phone) => request({ url: '/user/bind-phone', method: 'POST', data: { phone } })
  },

  // 商家相关API
  staff: {
    // 商家登录（用户名密码）
    login: (username, password) => request({ url: '/staff/login', method: 'POST', data: { username, password } }),
    
    // 获取商家信息
    getInfo: () => request({ url: '/staff/info', method: 'GET' })
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
    
    // 获取预约订单的微信支付参数
    getWechatPayParams: (orderId) => request({ url: `/booking/wechat-pay/${orderId}`, method: 'POST' }),
    
    // Mock支付成功（仅用于开发测试）
    mockPaymentSuccess: (orderId) => request({ url: `/booking/mock-success/${orderId}`, method: 'POST' }),
    
    // 支付预约订单（已废弃，改为使用微信支付）
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
    getOrderDetail: (orderId) => request({ url: `/booking/order/${orderId}`, method: 'GET' }),
    
    // 通过订单号核销（商家端使用）
    verifyByOrderNo: (orderNo) => request({ url: `/booking/verify/${orderNo}`, method: 'POST' }),
    
    // 取消预约订单
    cancel: (orderId) => request({ url: `/booking/cancel/${orderId}`, method: 'POST' }),
    
    // 获取某个日期和时段已预约的舱位列表
    getBookedSeats: (date, timeSlot) => request({ url: `/booking/booked-seats?date=${encodeURIComponent(date)}&timeSlot=${encodeURIComponent(timeSlot)}`, method: 'GET' })
  },

  // 支付相关API
  payment: {
    // 创建会员套餐支付订单
    createPackageOrder: (packageId, price, cardStartDate) => request({ 
      url: '/payment/create-package-order', 
      method: 'POST', 
      data: { packageId, price, cardStartDate } 
    }),
    
    // 获取微信支付参数
    getWechatPayParams: (orderId) => request({ 
      url: `/payment/wechat-pay/${orderId}`, 
      method: 'POST' 
    }),
    
    // Mock支付成功（仅用于开发测试）
    mockPaymentSuccess: (orderId) => request({ 
      url: `/payment/mock-success/${orderId}`, 
      method: 'POST' 
    }),
    
    // 获取用户的支付订单列表（购卡记录）
    getOrders: () => request({ 
      url: '/payment/orders', 
      method: 'GET' 
    })
  },

  // 邀请相关API
  invitation: {
    // 生成邀请码
    generate: (paymentOrderId) => request({
      url: '/invitation/generate',
      method: 'POST',
      data: { paymentOrderId }
    }),
    
    // 接受邀请（已登录用户）
    accept: (inviteCode) => request({
      url: '/invitation/accept',
      method: 'POST',
      data: { inviteCode }
    }),
    
    // 接受邀请（通过微信code，无需登录）
    acceptByCode: (inviteCode, wechatCode) => request({
      url: '/invitation/accept-by-code',
      method: 'POST',
      data: { inviteCode, code: wechatCode }
    }),
    
    // 获取邀请列表
    getList: () => request({
      url: '/invitation/list',
      method: 'GET'
    }),
    
    // 根据邀请码查询邀请信息
    getByCode: (inviteCode) => request({
      url: `/invitation/code/${inviteCode}`,
      method: 'GET'
    })
  }
};