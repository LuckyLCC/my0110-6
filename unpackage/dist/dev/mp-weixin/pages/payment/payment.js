"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
const _sfc_main = {
  data() {
    return {
      packageId: "",
      packageName: "月卡",
      price: 3980,
      originalPrice: 0,
      validDays: 30,
      statusBarHeight: 0,
      cardStartDate: "",
      cardEndDate: "",
      transactionType: "NEW",
      // NEW-新开卡, RENEW-续费
      orderId: null,
      icons: {
        back: "/static/Button.png",
        star: "https://www.figma.com/api/mcp/asset/d8a75e34-91f3-4668-9f68-1aa515439cc8",
        crown: "https://www.figma.com/api/mcp/asset/686b2997-9764-4723-80b4-7f7a49675a6d",
        wechat: "https://www.figma.com/api/mcp/asset/bcdd9994-4ce4-418e-b4e5-497ae718d29f",
        check: "https://www.figma.com/api/mcp/asset/f7c2725a-2c81-453a-aa24-4a8d4b469eb9",
        lock: "https://www.figma.com/api/mcp/asset/59233441-a25d-483d-9319-e6e37b0927dd"
      }
    };
  },
  async onLoad(options) {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    if (options.packageId) {
      this.packageId = options.packageId;
    }
    if (options.packageName) {
      this.packageName = decodeURIComponent(options.packageName);
    }
    if (options.price) {
      this.price = parseFloat(options.price);
    }
    if (options.originalPrice) {
      this.originalPrice = parseFloat(options.originalPrice);
    }
    if (options.validDays) {
      this.validDays = parseInt(options.validDays);
    }
    await this.calculateCardDates();
  },
  computed: {
    formattedPrice() {
      return this.price.toFixed(2);
    },
    priceInteger() {
      return Math.floor(this.price);
    },
    priceDecimal() {
      return (this.price % 1).toFixed(2).substring(1);
    },
    transactionTypeText() {
      return this.transactionType === "RENEW" ? "续费" : "新开卡";
    },
    // 最小日期（今天）
    minDate() {
      const today = /* @__PURE__ */ new Date();
      return this.formatDateForPicker(today);
    },
    // 最大日期（一年后）
    maxDate() {
      const today = /* @__PURE__ */ new Date();
      const maxDate = new Date(today);
      maxDate.setFullYear(today.getFullYear() + 1);
      return this.formatDateForPicker(maxDate);
    }
  },
  methods: {
    // 日期选择器变化事件
    onDateChange(e) {
      const selectedDate = e.detail.value;
      this.cardStartDate = selectedDate;
      this.calculateEndDate(selectedDate);
      this.updateTransactionType(selectedDate);
    },
    // 根据开始日期计算到期日期
    calculateEndDate(startDateStr) {
      if (!startDateStr)
        return;
      const startDate = new Date(startDateStr);
      const endDate = new Date(startDate.getTime() + this.validDays * 24 * 60 * 60 * 1e3);
      this.cardEndDate = this.formatDate(endDate);
    },
    // 根据选择的日期更新交易类型
    async updateTransactionType(selectedDateStr) {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.transactionType = "NEW";
        return;
      }
      try {
        const ordersResponse = await api_request.api.payment.getOrders();
        const hasPaidOrders = ordersResponse.code === 200 && ordersResponse.data && ordersResponse.data.some((order) => order.status === "paid");
        if (hasPaidOrders) {
          this.transactionType = "RENEW";
          common_vendor.index.__f__("log", "at pages/payment/payment.vue:252", "判断为续费：用户有已支付的购卡记录");
        } else {
          this.transactionType = "NEW";
          common_vendor.index.__f__("log", "at pages/payment/payment.vue:255", "判断为新开卡：用户没有已支付的购卡记录");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/payment/payment.vue:258", "获取购卡记录失败:", error);
        this.transactionType = "NEW";
      }
    },
    // 格式化日期为picker格式：YYYY-MM-DD
    formatDateForPicker(date) {
      if (!date)
        return "";
      const d = date instanceof Date ? date : new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    // 预计算卡开始日期、到期日期和交易类型（初始化默认值）
    async calculateCardDates() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        const now = /* @__PURE__ */ new Date();
        this.cardStartDate = this.formatDateForPicker(now);
        this.calculateEndDate(this.cardStartDate);
        this.transactionType = "NEW";
        return;
      }
      try {
        const ordersResponse = await api_request.api.payment.getOrders();
        const hasPaidOrders = ordersResponse.code === 200 && ordersResponse.data && ordersResponse.data.some((order) => order.status === "paid");
        if (hasPaidOrders) {
          this.transactionType = "RENEW";
          try {
            const userResponse = await api_request.api.user.getInfo();
            if (userResponse.code === 200 && userResponse.data && userResponse.data.memberExpireTime) {
              const expireTime = new Date(userResponse.data.memberExpireTime);
              const now = /* @__PURE__ */ new Date();
              if (expireTime > now) {
                this.cardStartDate = this.formatDateForPicker(expireTime);
              } else {
                this.cardStartDate = this.formatDateForPicker(now);
              }
            } else {
              const now = /* @__PURE__ */ new Date();
              this.cardStartDate = this.formatDateForPicker(now);
            }
          } catch (error) {
            const now = /* @__PURE__ */ new Date();
            this.cardStartDate = this.formatDateForPicker(now);
          }
          this.calculateEndDate(this.cardStartDate);
        } else {
          const now = /* @__PURE__ */ new Date();
          this.cardStartDate = this.formatDateForPicker(now);
          this.calculateEndDate(this.cardStartDate);
          this.transactionType = "NEW";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/payment/payment.vue:327", "获取购卡记录失败:", error);
        const now = /* @__PURE__ */ new Date();
        this.cardStartDate = this.formatDateForPicker(now);
        this.calculateEndDate(this.cardStartDate);
        this.transactionType = "NEW";
      }
    },
    // 格式化日期：2026-01-10
    formatDate(date) {
      if (!date)
        return "";
      const d = date instanceof Date ? date : new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    async handleMockPaymentSuccess() {
      common_vendor.index.showLoading({
        title: "模拟支付中...",
        mask: true
      });
      try {
        const orderId = this.orderId;
        if (!orderId) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "订单信息缺失",
            icon: "none"
          });
          return;
        }
        const response = await api_request.api.payment.mockPaymentSuccess(orderId);
        if (response.code === 200) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "支付成功（Mock模式）",
            icon: "success",
            duration: 2e3
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/my/my"
            });
          }, 2e3);
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: response.message || "模拟支付失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "模拟支付失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/payment/payment.vue:398", "模拟支付失败:", error);
      }
    },
    async handlePay() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none",
          duration: 2e3
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: "/pages/login/login"
          });
        }, 2e3);
        return;
      }
      if (!this.packageId) {
        common_vendor.index.showToast({
          title: "套餐信息错误",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "正在支付...",
        mask: true
      });
      if (!this.cardStartDate) {
        common_vendor.index.showToast({
          title: "请选择卡开始日期",
          icon: "none"
        });
        return;
      }
      try {
        const orderResponse = await api_request.api.payment.createPackageOrder(this.packageId, this.price, this.cardStartDate);
        if (orderResponse.code !== 200) {
          throw new Error(orderResponse.message || "创建订单失败");
        }
        const orderId = orderResponse.data.orderId || orderResponse.data.id;
        if (!orderId) {
          throw new Error("订单创建失败，未返回订单ID");
        }
        this.orderId = orderId;
        if (orderResponse.data.cardStartDate) {
          this.cardStartDate = this.formatDateForPicker(new Date(orderResponse.data.cardStartDate));
        }
        if (orderResponse.data.cardEndDate) {
          this.cardEndDate = this.formatDate(new Date(orderResponse.data.cardEndDate));
        }
        if (orderResponse.data.transactionType) {
          this.transactionType = orderResponse.data.transactionType;
        }
        const payResponse = await api_request.api.payment.getWechatPayParams(orderId);
        if (payResponse.code !== 200) {
          throw new Error(payResponse.message || "获取支付参数失败");
        }
        const payParams = payResponse.data;
        common_vendor.index.requestPayment({
          provider: "wxpay",
          timeStamp: payParams.timeStamp,
          nonceStr: payParams.nonceStr,
          package: payParams.package,
          signType: payParams.signType || "RSA",
          paySign: payParams.paySign,
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/payment/payment.vue:486", "支付成功:", res);
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "支付成功",
              icon: "success",
              duration: 2e3
            });
            setTimeout(() => {
              common_vendor.index.reLaunch({
                url: "/pages/my/my"
              });
            }, 2e3);
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/payment/payment.vue:502", "支付失败:", err);
            common_vendor.index.hideLoading();
            let errorMsg = "支付失败";
            if (err.errMsg) {
              if (err.errMsg.includes("cancel")) {
                errorMsg = "支付已取消";
              } else if (err.errMsg.includes("fail")) {
                errorMsg = "支付失败，请重试";
              } else {
                errorMsg = err.errMsg;
              }
            }
            const isMockMode = payParams.package && payParams.package.includes("MOCK_PREPAY_ID");
            if (isMockMode) {
              common_vendor.index.showModal({
                title: "Mock模式提示",
                content: "当前为Mock模式，真实支付会失败。是否模拟支付成功？",
                confirmText: "模拟成功",
                cancelText: "取消",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    this.handleMockPaymentSuccess();
                  } else {
                    common_vendor.index.showToast({
                      title: "支付已取消",
                      icon: "none",
                      duration: 2e3
                    });
                  }
                }
              });
            } else {
              common_vendor.index.showToast({
                title: errorMsg,
                icon: "none",
                duration: 2e3
              });
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/payment/payment.vue:549", "支付流程错误:", error);
        common_vendor.index.hideLoading();
        let errorMsg = "支付失败，请重试";
        if (error.message) {
          errorMsg = error.message;
        } else if (error.errMsg) {
          errorMsg = error.errMsg;
        }
        common_vendor.index.showToast({
          title: errorMsg,
          icon: "none",
          duration: 2e3
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.icons.back,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: $data.statusBarHeight + "px",
    d: $data.icons.star,
    e: $data.icons.crown,
    f: common_vendor.t($data.packageName),
    g: common_vendor.t($options.priceInteger),
    h: common_vendor.t($options.priceDecimal),
    i: common_vendor.t($data.validDays),
    j: common_vendor.t($data.packageName),
    k: common_vendor.t($options.transactionTypeText),
    l: common_vendor.t($data.cardStartDate || "请选择"),
    m: $data.cardStartDate,
    n: $options.minDate,
    o: $options.maxDate,
    p: common_vendor.o((...args) => $options.onDateChange && $options.onDateChange(...args)),
    q: common_vendor.t($data.cardEndDate),
    r: common_vendor.t($options.formattedPrice),
    s: $data.icons.wechat,
    t: $data.icons.check,
    v: $data.icons.lock,
    w: common_vendor.t($options.priceInteger),
    x: common_vendor.o((...args) => $options.handlePay && $options.handlePay(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-eade9ab2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/payment/payment.js.map
