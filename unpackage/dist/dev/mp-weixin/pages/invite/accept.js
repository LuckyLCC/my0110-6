"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
const _sfc_main = {
  data() {
    return {
      inviteCode: "",
      loading: false,
      errorMessage: "",
      icons: {
        wechat: "https://www.figma.com/api/mcp/asset/6f1ecd7b-5f40-48fb-9ad6-f69a05013455"
      }
    };
  },
  computed: {
    canAccept() {
      return this.inviteCode && this.inviteCode.trim().length >= 4;
    }
  },
  onLoad(options) {
    common_vendor.index.__f__("log", "at pages/invite/accept.vue:77", "接受邀请页面 onLoad，options:", options);
    if (options.code) {
      this.inviteCode = options.code;
      common_vendor.index.__f__("log", "at pages/invite/accept.vue:81", "从分享链接获取到邀请码:", this.inviteCode);
    } else {
      common_vendor.index.__f__("log", "at pages/invite/accept.vue:83", "未从分享链接获取到邀请码，需要用户手动输入");
    }
  },
  methods: {
    // 接受邀请（已登录用户）
    async handleAcceptInvite() {
      if (!this.canAccept) {
        common_vendor.index.showToast({
          title: "请输入邀请码",
          icon: "none"
        });
        return;
      }
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        this.handleWechatLogin();
        return;
      }
      this.loading = true;
      this.errorMessage = "";
      try {
        const response = await api_request.api.invitation.accept(this.inviteCode.trim());
        if (response.code === 200) {
          common_vendor.index.showToast({
            title: "绑定成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/my/my"
            });
          }, 1500);
        } else {
          this.errorMessage = response.message || "接受邀请失败";
          common_vendor.index.showToast({
            title: response.message || "接受邀请失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/invite/accept.vue:134", "接受邀请失败:", error);
        this.errorMessage = "网络错误，请重试";
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    // 微信登录并接受邀请
    async handleWechatLogin() {
      if (!this.canAccept) {
        common_vendor.index.showToast({
          title: "请输入邀请码",
          icon: "none"
        });
        return;
      }
      this.loading = true;
      this.errorMessage = "";
      try {
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: resolve,
            fail: reject
          });
        });
        if (!loginRes.code) {
          common_vendor.index.showToast({
            title: "获取微信登录凭证失败",
            icon: "none"
          });
          this.loading = false;
          return;
        }
        const response = await api_request.api.invitation.acceptByCode(this.inviteCode.trim(), loginRes.code);
        if (response.code === 200 && response.data) {
          if (response.data.token) {
            common_vendor.index.setStorageSync("token", response.data.token);
          }
          if (response.data.userInfo) {
            common_vendor.index.setStorageSync("userInfo", response.data.userInfo);
          }
          common_vendor.index.showToast({
            title: "绑定成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/my/my"
            });
          }, 1500);
        } else {
          this.errorMessage = response.message || "接受邀请失败";
          common_vendor.index.showToast({
            title: response.message || "接受邀请失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/invite/accept.vue:208", "微信登录并接受邀请失败:", error);
        this.errorMessage = "网络错误，请重试";
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
  return common_vendor.e({
    a: $data.inviteCode,
    b: common_vendor.o(($event) => $data.inviteCode = $event.detail.value),
    c: $data.errorMessage
  }, $data.errorMessage ? {
    d: common_vendor.t($data.errorMessage)
  } : {}, {
    e: !$data.loading
  }, !$data.loading ? {} : {}, {
    f: !$options.canAccept ? 1 : "",
    g: !$options.canAccept || $data.loading,
    h: common_vendor.o((...args) => $options.handleAcceptInvite && $options.handleAcceptInvite(...args)),
    i: $data.icons.wechat,
    j: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4bf333e7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/invite/accept.js.map
