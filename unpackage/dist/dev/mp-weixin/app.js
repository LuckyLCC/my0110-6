"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const api_request = require("./api/request.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/store/store.js";
  "./pages/booking/booking.js";
  "./pages/my/my.js";
  "./pages/my/profile.js";
  "./pages/login/login.js";
  "./pages/payment/payment.js";
  "./pages/staff/verify.js";
  "./pages/staff/login.js";
  "./pages/invite/accept.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.config.globalProperties.$login = async function() {
    try {
      const token = common_vendor.index.getStorageSync("token");
      if (token) {
        try {
          await api_request.api.user.getInfo();
          return true;
        } catch (error) {
          common_vendor.index.removeStorageSync("token");
        }
      }
      const loginRes = await new Promise((resolve, reject) => {
        common_vendor.index.login({
          provider: "weixin",
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        });
      });
      const response = await api_request.api.user.login(loginRes.code);
      if (response.code === 200) {
        common_vendor.index.setStorageSync("token", response.data);
        return true;
      } else {
        common_vendor.index.__f__("error", "at main.js:52", "登录失败:", response.message);
        return false;
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at main.js:56", "登录过程出错:", error);
      return false;
    }
  };
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
