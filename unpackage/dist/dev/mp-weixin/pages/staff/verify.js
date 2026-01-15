"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
const _sfc_main = {
  data() {
    return {
      orderNoInput: "",
      verifyResult: "",
      orderInfo: "",
      isSuccess: false
    };
  },
  computed: {
    resultCardClass() {
      return this.isSuccess ? "result-success" : "result-error";
    },
    resultIcon() {
      return this.isSuccess ? "✓" : "✗";
    }
  },
  methods: {
    // 扫描二维码
    scanQRCode() {
      common_vendor.index.scanCode({
        onlyFromCamera: false,
        // 允许从相册选择
        scanType: ["qrCode", "barCode"],
        // 支持二维码和条形码
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/staff/verify.vue:80", "扫描结果:", res);
          const orderNo = res.result.trim();
          if (orderNo) {
            this.verifyByOrderNo(orderNo);
          } else {
            common_vendor.index.showToast({
              title: "未识别到订单号",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/staff/verify.vue:92", "扫描失败:", err);
          common_vendor.index.showToast({
            title: "扫描失败，请重试",
            icon: "none"
          });
        }
      });
    },
    // 通过订单号核销
    async verifyByOrderNo(orderNo) {
      if (!orderNo) {
        orderNo = this.orderNoInput.trim();
      }
      if (!orderNo) {
        common_vendor.index.showToast({
          title: "请输入订单号",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "核销中...",
        mask: true
      });
      try {
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          common_vendor.index.hideLoading();
          common_vendor.index.showModal({
            title: "提示",
            content: "请先登录",
            showCancel: false,
            success: () => {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }
          });
          return;
        }
        const response = await api_request.api.booking.verifyByOrderNo(orderNo);
        common_vendor.index.hideLoading();
        if (response.code === 200) {
          this.isSuccess = true;
          this.verifyResult = "核销成功！";
          if (response.data) {
            const order = response.data;
            this.orderInfo = `${order.date} ${order.timeSlot} ${order.cabinName}-${order.seatName}`;
          }
          common_vendor.index.showToast({
            title: "核销成功",
            icon: "success",
            duration: 2e3
          });
          this.orderNoInput = "";
          setTimeout(() => {
            this.verifyResult = "";
            this.orderInfo = "";
          }, 3e3);
        } else {
          this.isSuccess = false;
          this.verifyResult = response.message || "核销失败";
          this.orderInfo = "";
          common_vendor.index.showToast({
            title: response.message || "核销失败",
            icon: "none",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/staff/verify.vue:178", "核销失败:", error);
        this.isSuccess = false;
        this.verifyResult = "网络错误，请重试";
        this.orderInfo = "";
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.scanQRCode && $options.scanQRCode(...args)),
    b: common_vendor.o((...args) => $options.verifyByOrderNo && $options.verifyByOrderNo(...args)),
    c: $data.orderNoInput,
    d: common_vendor.o(($event) => $data.orderNoInput = $event.detail.value),
    e: common_vendor.o((...args) => $options.verifyByOrderNo && $options.verifyByOrderNo(...args)),
    f: $data.verifyResult
  }, $data.verifyResult ? common_vendor.e({
    g: common_vendor.t($options.resultIcon),
    h: common_vendor.t($data.verifyResult),
    i: $data.orderInfo
  }, $data.orderInfo ? {
    j: common_vendor.t($data.orderInfo)
  } : {}, {
    k: common_vendor.n($options.resultCardClass)
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-482a2f0d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/staff/verify.js.map
