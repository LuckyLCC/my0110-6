"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
const _sfc_main = {
  data() {
    return {
      termsAgreed: false,
      loading: false,
      icons: {
        wechat: "https://www.figma.com/api/mcp/asset/6f1ecd7b-5f40-48fb-9ad6-f69a05013455",
        phone: "https://www.figma.com/api/mcp/asset/d0de85e0-b7cc-49dc-995b-8410f60b8977"
      }
    };
  },
  methods: {
    async handleWechatLogin() {
      if (!this.termsAgreed) {
        common_vendor.index.showToast({
          title: "请先阅读并同意用户协议和隐私政策",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      if (this.loading) {
        return;
      }
      this.loading = true;
      common_vendor.index.showLoading({
        title: "登录中...",
        mask: true
      });
      try {
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: resolve,
            fail: reject
          });
        });
        common_vendor.index.__f__("log", "at pages/login/login.vue:86", "uni.login 返回:", loginRes);
        if (!loginRes.code) {
          throw new Error("获取微信登录凭证失败");
        }
        const response = await api_request.api.user.login(loginRes.code);
        common_vendor.index.__f__("log", "at pages/login/login.vue:94", "后端登录响应:", response);
        if (response.code === 200) {
          if (response.data && response.data.token) {
            common_vendor.index.setStorageSync("token", response.data.token);
            common_vendor.index.__f__("log", "at pages/login/login.vue:100", "Token 已保存");
          }
          if (response.data && response.data.userInfo) {
            common_vendor.index.setStorageSync("userInfo", response.data.userInfo);
          }
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success",
            duration: 1500
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          }, 1500);
        } else {
          const errorMsg = response.message || "登录失败，请重试";
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:132", "微信登录错误:", error);
        common_vendor.index.hideLoading();
        let errorMsg = "登录失败，请重试";
        if (error.errMsg) {
          if (error.errMsg.includes("fail")) {
            errorMsg = "微信登录失败，请检查网络连接";
          } else {
            errorMsg = error.errMsg;
          }
        } else if (error.message) {
          errorMsg = error.message;
        }
        common_vendor.index.showToast({
          title: errorMsg,
          icon: "none",
          duration: 2e3
        });
      } finally {
        this.loading = false;
      }
    },
    handlePhoneLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/phone-login/phone-login"
      });
    },
    toggleTerms() {
      this.termsAgreed = !this.termsAgreed;
    },
    openUserAgreement() {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/user-agreement"
      });
    },
    openPrivacyPolicy() {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/privacy-policy"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.icons.wechat,
    b: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args)),
    c: $data.icons.phone,
    d: common_vendor.o((...args) => $options.handlePhoneLogin && $options.handlePhoneLogin(...args)),
    e: $data.termsAgreed
  }, $data.termsAgreed ? {} : {}, {
    f: $data.termsAgreed ? 1 : "",
    g: common_vendor.o((...args) => $options.toggleTerms && $options.toggleTerms(...args)),
    h: common_vendor.o((...args) => $options.openUserAgreement && $options.openUserAgreement(...args)),
    i: common_vendor.o((...args) => $options.openPrivacyPolicy && $options.openPrivacyPolicy(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
