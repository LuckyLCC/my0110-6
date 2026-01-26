"use strict";
const common_vendor = require("../common/vendor.js");
const api_enums = require("./enums.js");
const BASE_URL = "http://192.168.3.51:8080/api";
function normalizeResponse(url, payload) {
  var _a;
  try {
    if (url === "/user/login" && ((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.userInfo)) {
      payload.data.userInfo.role = api_enums.normalizeRoleToLower(payload.data.userInfo.role);
    }
    if (url === "/user/info" && (payload == null ? void 0 : payload.data)) {
      if (payload.data.role) {
        payload.data.role = api_enums.normalizeRoleToLower(payload.data.role);
      }
    }
    if (url === "/payment/orders" && Array.isArray(payload == null ? void 0 : payload.data)) {
      payload.data.forEach((o) => {
        o.status = api_enums.normalizeEnum(o.status, Object.values(api_enums.PaymentOrderStatus), { field: "paymentOrder.status", defaultValue: api_enums.PaymentOrderStatus.UNPAID });
        o.transactionType = api_enums.normalizeEnum(o.transactionType, Object.values(api_enums.TransactionType), { field: "paymentOrder.transactionType", defaultValue: api_enums.TransactionType.NEW });
        if (o.cardStatus !== void 0) {
          o.cardStatus = api_enums.normalizeEnum(o.cardStatus, Object.values(api_enums.CardStatus), { field: "paymentOrder.cardStatus", defaultValue: api_enums.CardStatus.INACTIVE });
        }
      });
    }
    if (url === "/booking/orders" && Array.isArray(payload == null ? void 0 : payload.data)) {
      payload.data.forEach((o) => {
        o.status = api_enums.normalizeEnum(o.status, Object.values(api_enums.BookingStatus), { field: "bookingOrder.status", defaultValue: api_enums.BookingStatus.PENDING });
        o.paymentStatus = api_enums.normalizeEnum(o.paymentStatus, Object.values(api_enums.PaymentStatus), { field: "bookingOrder.paymentStatus", defaultValue: api_enums.PaymentStatus.UNPAID });
      });
    }
  } catch (e) {
    common_vendor.index.__f__("warn", "at api/request.js:49", "[enum] 规范化响应失败:", url, e);
  }
  return payload;
}
const request = (options) => {
  common_vendor.index.__f__("log", "at api/request.js:56", "发起请求:", BASE_URL + options.url, options);
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
        common_vendor.index.__f__("log", "at api/request.js:68", "请求成功:", res);
        if (res.statusCode === 200) {
          resolve(normalizeResponse(options.url, res.data));
        } else {
          common_vendor.index.__f__("error", "at api/request.js:73", "请求失败:", res);
          reject(res);
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at api/request.js:78", "网络错误详情:", err);
        common_vendor.index.__f__("error", "at api/request.js:79", "错误对象详细信息:", JSON.stringify(err, null, 2));
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
    getInfo: () => request({ url: "/staff/info", method: "GET" }),
    // 获取活跃会籍顾问列表（用户端调用，无需认证）
    getActiveList: () => request({ url: "/staff/active-list", method: "GET" })
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
    create: (params) => request({ url: "/booking_orders/create", method: "POST", data: params }),
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
    createPackageOrder: (packageId, price, cardStartDate, staffId, staffName) => request({
      url: "/payment/create-package-order",
      method: "POST",
      data: { packageId, price, cardStartDate, staffId, staffName }
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
