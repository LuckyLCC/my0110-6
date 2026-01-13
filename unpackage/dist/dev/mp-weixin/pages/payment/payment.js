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
      icons: {
        back: "https://www.figma.com/api/mcp/asset/6e0ab730-69c1-4a8c-9c93-837acebcbedd",
        star: "https://www.figma.com/api/mcp/asset/d8a75e34-91f3-4668-9f68-1aa515439cc8",
        crown: "https://www.figma.com/api/mcp/asset/686b2997-9764-4723-80b4-7f7a49675a6d",
        wechat: "https://www.figma.com/api/mcp/asset/bcdd9994-4ce4-418e-b4e5-497ae718d29f",
        check: "https://www.figma.com/api/mcp/asset/f7c2725a-2c81-453a-aa24-4a8d4b469eb9",
        lock: "https://www.figma.com/api/mcp/asset/59233441-a25d-483d-9319-e6e37b0927dd"
      }
    };
  },
  onLoad(options) {
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
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
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
      try {
        const orderResponse = await api_request.api.payment.createPackageOrder(this.packageId, this.price);
        if (orderResponse.code !== 200) {
          throw new Error(orderResponse.message || "创建订单失败");
        }
        const orderId = orderResponse.data.orderId || orderResponse.data.id;
        if (!orderId) {
          throw new Error("订单创建失败，未返回订单ID");
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
            common_vendor.index.__f__("log", "at pages/payment/payment.vue:240", "支付成功:", res);
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
            common_vendor.index.__f__("error", "at pages/payment/payment.vue:256", "支付失败:", err);
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
            common_vendor.index.showToast({
              title: errorMsg,
              icon: "none",
              duration: 2e3
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/payment/payment.vue:278", "支付流程错误:", error);
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
    k: common_vendor.t($options.formattedPrice),
    l: $data.icons.wechat,
    m: $data.icons.check,
    n: $data.icons.lock,
    o: common_vendor.t($options.priceInteger),
    p: common_vendor.o((...args) => $options.handlePay && $options.handlePay(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-eade9ab2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/payment/payment.js.map
