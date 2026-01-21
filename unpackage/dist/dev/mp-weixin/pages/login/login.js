"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      termsAgreed: false,
      loading: false,
      showUserInfoForm: false,
      // 是否显示用户信息填写表单
      selectedAvatar: "",
      // 用户选择的头像
      selectedNickname: "",
      // 用户输入的昵称
      pendingLoginCode: null,
      // 待处理的登录 code
      icons: {
        wechat: "/static/login/wechat.png",
        phone: "/static/login/phone.png"
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
      try {
        let userProfile = null;
        common_vendor.index.__f__("log", "at pages/login/login.vue:122", "========== 开始获取微信用户信息 ==========");
        try {
          common_vendor.index.__f__("log", "at pages/login/login.vue:124", "准备调用 uni.getUserProfile...");
          const profileRes = await new Promise((resolve, reject) => {
            common_vendor.index.getUserProfile({
              desc: "用于完善用户资料",
              success: (res) => {
                common_vendor.index.__f__("log", "at pages/login/login.vue:129", "getUserProfile success 回调被触发");
                resolve(res);
              },
              fail: (err) => {
                common_vendor.index.__f__("error", "at pages/login/login.vue:133", "getUserProfile fail 回调被触发:", err);
                reject(err);
              }
            });
          });
          common_vendor.index.__f__("log", "at pages/login/login.vue:139", "getUserProfile 返回完整数据:", JSON.stringify(profileRes));
          if (profileRes && profileRes.userInfo) {
            const isDemote = profileRes.userInfo.is_demote === true || profileRes.is_demote === true;
            if (isDemote) {
              common_vendor.index.__f__("warn", "at pages/login/login.vue:146", "⚠️ 获取到的是降级后的匿名信息，不是真实用户信息");
              common_vendor.index.__f__("warn", "at pages/login/login.vue:147", "微信小程序新政策：无法直接获取用户真实昵称和头像");
              common_vendor.index.__f__("warn", "at pages/login/login.vue:148", "昵称:", profileRes.userInfo.nickName, "(这是匿名昵称)");
              const loginRes2 = await new Promise((resolve, reject) => {
                common_vendor.index.login({
                  provider: "weixin",
                  success: resolve,
                  fail: reject
                });
              });
              if (loginRes2.code) {
                this.pendingLoginCode = loginRes2.code;
                this.showUserInfoForm = true;
                common_vendor.index.hideLoading();
                this.loading = false;
                return;
              }
              userProfile = null;
            } else {
              userProfile = {
                nickName: profileRes.userInfo.nickName,
                avatarUrl: profileRes.userInfo.avatarUrl
              };
              common_vendor.index.__f__("log", "at pages/login/login.vue:172", "✅ 成功获取到微信用户信息:");
              common_vendor.index.__f__("log", "at pages/login/login.vue:173", "  - 昵称:", userProfile.nickName);
              common_vendor.index.__f__("log", "at pages/login/login.vue:174", "  - 头像:", userProfile.avatarUrl);
            }
          } else {
            common_vendor.index.__f__("warn", "at pages/login/login.vue:177", "⚠️ getUserProfile 返回的数据中没有 userInfo");
            common_vendor.index.__f__("warn", "at pages/login/login.vue:178", "返回数据:", profileRes);
          }
        } catch (profileError) {
          common_vendor.index.__f__("error", "at pages/login/login.vue:181", "❌ 获取微信用户信息失败:");
          common_vendor.index.__f__("error", "at pages/login/login.vue:182", "错误对象:", profileError);
          common_vendor.index.__f__("error", "at pages/login/login.vue:183", "错误信息:", profileError.errMsg || profileError.message || "未知错误");
          common_vendor.index.__f__("error", "at pages/login/login.vue:184", "错误详情:", JSON.stringify(profileError));
          if (profileError.errMsg && profileError.errMsg.includes("cancel")) {
            common_vendor.index.__f__("warn", "at pages/login/login.vue:188", "用户拒绝了授权，将使用默认昵称");
          }
        }
        common_vendor.index.__f__("log", "at pages/login/login.vue:191", "========== 获取微信用户信息结束 ==========");
        common_vendor.index.showLoading({
          title: "登录中...",
          mask: true
        });
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: resolve,
            fail: reject
          });
        });
        common_vendor.index.__f__("log", "at pages/login/login.vue:208", "uni.login 返回:", loginRes);
        if (!loginRes.code) {
          throw new Error("获取微信登录凭证失败");
        }
        const nicknameToSend = (userProfile == null ? void 0 : userProfile.nickName) || null;
        const avatarUrlToSend = (userProfile == null ? void 0 : userProfile.avatarUrl) || null;
        common_vendor.index.__f__("log", "at pages/login/login.vue:217", "准备发送登录请求:");
        common_vendor.index.__f__("log", "at pages/login/login.vue:218", "  - code:", loginRes.code ? "已提供" : "未提供");
        common_vendor.index.__f__("log", "at pages/login/login.vue:219", "  - nickname:", nicknameToSend);
        common_vendor.index.__f__("log", "at pages/login/login.vue:220", "  - avatarUrl:", avatarUrlToSend ? "已提供" : "未提供");
        await this.completeLoginWithCode(loginRes.code, nicknameToSend, avatarUrlToSend);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:225", "微信登录错误:", error);
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
    },
    navigateToStaff() {
      common_vendor.index.navigateTo({
        url: "/pages/staff/login"
      });
    },
    goBackToMy() {
      common_vendor.index.navigateBack({
        delta: 1,
        fail: () => {
          common_vendor.index.redirectTo({
            url: "/pages/my/my"
          });
        }
      });
    },
    // 用户选择头像
    onChooseAvatar(e) {
      common_vendor.index.__f__("log", "at pages/login/login.vue:289", "用户选择头像:", e.detail);
      const { avatarUrl } = e.detail;
      this.selectedAvatar = avatarUrl;
      common_vendor.index.__f__("log", "at pages/login/login.vue:292", "设置头像:", avatarUrl);
    },
    // 用户输入昵称
    onNicknameInput(e) {
      common_vendor.index.__f__("log", "at pages/login/login.vue:296", "用户输入昵称:", e.detail.value);
      this.selectedNickname = e.detail.value || "";
    },
    // 取消填写用户信息
    cancelUserInfoForm() {
      this.showUserInfoForm = false;
      this.selectedAvatar = "";
      this.selectedNickname = "";
      const code = this.pendingLoginCode;
      this.pendingLoginCode = null;
      this.loading = false;
      if (code) {
        this.completeLoginWithCode(code, null, null);
      }
    },
    // 确认用户信息并完成登录
    async confirmUserInfo() {
      if (!this.pendingLoginCode) {
        common_vendor.index.showToast({
          title: "登录凭证已过期，请重新登录",
          icon: "none"
        });
        this.showUserInfoForm = false;
        this.loading = false;
        return;
      }
      if (!this.selectedNickname || this.selectedNickname.trim() === "") {
        common_vendor.index.showToast({
          title: "请输入昵称",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "登录中...",
        mask: true
      });
      await this.completeLoginWithCode(
        this.pendingLoginCode,
        this.selectedNickname.trim(),
        this.selectedAvatar
      );
      this.showUserInfoForm = false;
      this.selectedAvatar = "";
      this.selectedNickname = "";
      this.pendingLoginCode = null;
    },
    // 使用 code 完成登录（公共方法）
    async completeLoginWithCode(code, nickname, avatarUrl) {
      try {
        common_vendor.index.__f__("log", "at pages/login/login.vue:354", "完成登录，参数:");
        common_vendor.index.__f__("log", "at pages/login/login.vue:355", "  - code:", code ? "已提供" : "未提供");
        common_vendor.index.__f__("log", "at pages/login/login.vue:356", "  - nickname:", nickname);
        common_vendor.index.__f__("log", "at pages/login/login.vue:357", "  - avatarUrl:", avatarUrl ? "已提供" : "未提供");
        const response = await api_request.api.user.login(code, nickname, avatarUrl);
        common_vendor.index.__f__("log", "at pages/login/login.vue:360", "后端登录响应:", response);
        if (response.code === 200) {
          if (response.data && response.data.token) {
            common_vendor.index.setStorageSync("token", response.data.token);
            common_vendor.index.__f__("log", "at pages/login/login.vue:366", "Token 已保存");
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
            var _a;
            const userInfo = ((_a = response.data) == null ? void 0 : _a.userInfo) || common_vendor.index.getStorageSync("userInfo");
            const userRole = (userInfo == null ? void 0 : userInfo.role) || "user";
            if (String(userRole).toLowerCase() === "staff") {
              common_vendor.index.reLaunch({
                url: "/pages/staff/verify"
              });
            } else {
              common_vendor.index.reLaunch({
                url: "/pages/index/index"
              });
            }
          }, 1500);
        } else {
          const errorMsg = response.message || "登录失败，请重试";
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none",
            duration: 2e3
          });
          this.loading = false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:410", "登录错误:", error);
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
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$1,
    b: common_vendor.o((...args) => $options.goBackToMy && $options.goBackToMy(...args)),
    c: $data.showUserInfoForm
  }, $data.showUserInfoForm ? common_vendor.e({
    d: $data.selectedAvatar
  }, $data.selectedAvatar ? {
    e: $data.selectedAvatar
  } : {}, {
    f: common_vendor.o((...args) => $options.onChooseAvatar && $options.onChooseAvatar(...args)),
    g: $data.selectedNickname,
    h: common_vendor.o((...args) => $options.onNicknameInput && $options.onNicknameInput(...args)),
    i: common_vendor.o((...args) => $options.cancelUserInfoForm && $options.cancelUserInfoForm(...args)),
    j: common_vendor.o((...args) => $options.confirmUserInfo && $options.confirmUserInfo(...args)),
    k: common_vendor.o(() => {
    }),
    l: common_vendor.o((...args) => $options.cancelUserInfoForm && $options.cancelUserInfoForm(...args))
  }) : {}, {
    m: $data.icons.wechat,
    n: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args)),
    o: $data.icons.phone,
    p: common_vendor.o((...args) => $options.handlePhoneLogin && $options.handlePhoneLogin(...args)),
    q: $data.termsAgreed
  }, $data.termsAgreed ? {} : {}, {
    r: $data.termsAgreed ? 1 : "",
    s: common_vendor.o((...args) => $options.toggleTerms && $options.toggleTerms(...args)),
    t: common_vendor.o((...args) => $options.openUserAgreement && $options.openUserAgreement(...args)),
    v: common_vendor.o((...args) => $options.openPrivacyPolicy && $options.openPrivacyPolicy(...args)),
    w: common_vendor.o((...args) => $options.navigateToStaff && $options.navigateToStaff(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
