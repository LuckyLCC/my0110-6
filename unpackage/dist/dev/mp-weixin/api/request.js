"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://192.168.3.51:8080/api";
const request = (options) => {
  common_vendor.index.__f__("log", "at api/request.js:6", "发起请求:", BASE_URL + options.url, options);
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data,
      header: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + common_vendor.index.getStorageSync("token") || ""
      },
      success: (res) => {
        common_vendor.index.__f__("log", "at api/request.js:18", "请求成功:", res);
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          common_vendor.index.__f__("error", "at api/request.js:23", "请求失败:", res);
          reject(res);
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at api/request.js:28", "网络错误详情:", err);
        common_vendor.index.__f__("error", "at api/request.js:29", "错误对象详细信息:", JSON.stringify(err, null, 2));
        reject(err);
      }
    });
  });
};
const api = {
  // 用户相关API
  user: {
    // 用户登录
    login: (code, nickname, avatarUrl) => request({
      url: "/user/login",
      method: "POST",
      data: { code, nickname, avatarUrl }
    }),
    // 获取用户信息
    getInfo: () => request({ url: "/user/info", method: "GET" }),
    // 更新用户信息
    updateInfo: (params) => request({ url: "/user/update-info", method: "POST", data: params }),
    // 绑定手机号
    bindPhone: (phone) => request({ url: "/user/bind-phone", method: "POST", data: { phone } })
  },
  // 商家相关API
  staff: {
    // 商家登录（用户名密码）
    login: (username, password) => request({ url: "/staff/login", method: "POST", data: { username, password } }),
    // 获取商家信息
    getInfo: () => request({ url: "/staff/info", method: "GET" })
  },
  // 会员套餐相关API
  packages: {
    // 获取所有会员套餐
    getAll: () => request({ url: "/packages/all", method: "GET" }),
    // 根据分类获取会员套餐
    getByCategory: (category) => request({ url: "/packages/category?category=" + encodeURIComponent(category), method: "GET" }),
    // 获取单个套餐详情
    getById: (id) => request({ url: `/packages/${id}`, method: "GET" })
  },
  // 预约相关API
  booking: {
    // 创建预约订单
    create: (params) => request({ url: "/booking/create", method: "POST", data: params }),
    // 获取预约订单的微信支付参数
    getWechatPayParams: (orderId) => request({ url: `/booking/wechat-pay/${orderId}`, method: "POST" }),
    // Mock支付成功（仅用于开发测试）
    mockPaymentSuccess: (orderId) => request({ url: `/booking/mock-success/${orderId}`, method: "POST" }),
    // 支付预约订单（已废弃，改为使用微信支付）
    pay: (orderId) => request({ url: `/booking/pay/${orderId}`, method: "POST" }),
    // 获取用户所有订单
    getOrders: () => request({ url: "/booking/orders", method: "GET" }),
    // 根据状态获取用户订单
    getOrdersByStatus: (status) => request({ url: `/booking/orders/status/${status}`, method: "GET" }),
    // 更新订单状态
    updateStatus: (orderId, status) => request({ url: `/booking/order/${orderId}/status`, method: "PUT", data: { status } }),
    // 检查用户是否可以预订当天
    canBookToday: (date) => request({ url: `/booking/can-book-today`, method: "GET", data: { date } }),
    // 获取订单详情
    getOrderDetail: (orderId) => request({ url: `/booking/order/${orderId}`, method: "GET" }),
    // 通过订单号核销（商家端使用）
    verifyByOrderNo: (orderNo) => request({ url: `/booking/verify/${orderNo}`, method: "POST" }),
    // 取消预约订单
    cancel: (orderId) => request({ url: `/booking/cancel/${orderId}`, method: "POST" }),
    // 获取某个日期和时段已预约的舱位列表
    getBookedSeats: (date, timeSlot) => request({ url: `/booking/booked-seats?date=${encodeURIComponent(date)}&timeSlot=${encodeURIComponent(timeSlot)}`, method: "GET" })
  },
  // 支付相关API
  payment: {
    // 创建会员套餐支付订单
    createPackageOrder: (packageId, price, cardStartDate) => request({
      url: "/payment/create-package-order",
      method: "POST",
      data: { packageId, price, cardStartDate }
    }),
    // 获取微信支付参数
    getWechatPayParams: (orderId) => request({
      url: `/payment/wechat-pay/${orderId}`,
      method: "POST"
    }),
    // Mock支付成功（仅用于开发测试）
    mockPaymentSuccess: (orderId) => request({
      url: `/payment/mock-success/${orderId}`,
      method: "POST"
    }),
    // 获取用户的支付订单列表（购卡记录）
    getOrders: () => request({
      url: "/payment/orders",
      method: "GET"
    })
  },
  // 邀请相关API
  invitation: {
    // 生成邀请码
    generate: (paymentOrderId) => request({
      url: "/invitation/generate",
      method: "POST",
      data: { paymentOrderId }
    }),
    // 接受邀请（已登录用户）
    accept: (inviteCode) => request({
      url: "/invitation/accept",
      method: "POST",
      data: { inviteCode }
    }),
    // 接受邀请（通过微信code，无需登录）
    acceptByCode: (inviteCode, wechatCode) => request({
      url: "/invitation/accept-by-code",
      method: "POST",
      data: { inviteCode, code: wechatCode }
    }),
    // 获取邀请列表
    getList: () => request({
      url: "/invitation/list",
      method: "GET"
    }),
    // 根据邀请码查询邀请信息
    getByCode: (inviteCode) => request({
      url: `/invitation/code/${inviteCode}`,
      method: "GET"
    })
  }
};
exports.api = api;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/request.js.map
