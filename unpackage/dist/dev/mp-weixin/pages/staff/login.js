"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      username: "",
      password: "",
      loading: false
    };
  },
  computed: {
    canLogin() {
      return this.username.trim().length > 0 && this.password.trim().length > 0 && !this.loading;
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack({
        delta: 1,
        fail: () => {
          common_vendor.index.redirectTo({
            url: "/pages/login/login"
          });
        }
      });
    },
    onUsernameInput(e) {
      this.username = e.detail.value;
    },
    onPasswordInput(e) {
      this.password = e.detail.value;
    },
    async handleLogin() {
      if (!this.canLogin) {
        return;
      }
      if (!this.username.trim()) {
        common_vendor.index.showToast({
          title: "请输入用户名",
          icon: "none"
        });
        return;
      }
      if (!this.password.trim()) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return;
      }
      this.loading = true;
      common_vendor.index.showLoading({
        title: "登录中...",
        mask: true
      });
      try {
        const response = await api_request.api.staff.login(this.username.trim(), this.password.trim());
        if (response.code === 200) {
          if (response.data && response.data.token) {
            common_vendor.index.setStorageSync("token", response.data.token);
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
              url: "/pages/staff/verify"
            });
          }, 1500);
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: response.message || "登录失败，请检查用户名和密码",
            icon: "none",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/staff/login.vue:143", "商家登录错误:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.o([($event) => $data.username = $event.detail.value, (...args) => $options.onUsernameInput && $options.onUsernameInput(...args)]),
    d: $data.username,
    e: common_vendor.o([($event) => $data.password = $event.detail.value, (...args) => $options.onPasswordInput && $options.onPasswordInput(...args)]),
    f: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    g: $data.password,
    h: !$options.canLogin ? 1 : "",
    i: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-abc7fc9c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/staff/login.js.map
