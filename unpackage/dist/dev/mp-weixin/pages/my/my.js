"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
const BottomNav = () => "../../components/BottomNav.js";
const _sfc_main = {
  components: {
    BottomNav
  },
  data() {
    return {
      activeTab: 0,
      userInfo: {},
      icons: {
        settings: "https://www.figma.com/api/mcp/asset/5ed2b362-9495-4961-ad72-a22eab14d2af",
        crown: "https://www.figma.com/api/mcp/asset/d4df2c09-130a-4366-a7db-6370dd5ebb57",
        clock: "https://www.figma.com/api/mcp/asset/62825eba-30db-4e17-986f-16509882f006",
        seat: "https://www.figma.com/api/mcp/asset/e29a6eaf-07e3-4f31-8860-2cf07c88f6b3"
      },
      images: {
        avatar: "https://www.figma.com/api/mcp/asset/e62fc854-cb73-44b5-96be-9d778af361fb"
      },
      orders: [],
      orderStatusMap: {
        "0": "全部",
        "1": "待核销",
        "2": "已完成"
      }
    };
  },
  onLoad() {
    this.loadUserData();
  },
  computed: {
    formattedPhone() {
      if (!this.userInfo.phone)
        return "未绑定手机";
      const phone = this.userInfo.phone;
      return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    },
    membershipLevel() {
      if (this.userInfo.memberLevel >= 1) {
        return "会员用户";
      }
      return "普通用户";
    },
    membershipDesc() {
      if (this.userInfo.memberLevel >= 1) {
        return `到期时间: ${this.userInfo.memberExpireTime || "无限期"}`;
      }
      return "尚未开通会员";
    }
  },
  watch: {
    activeTab: {
      handler(newVal) {
        this.loadOrders();
      },
      immediate: true
    }
  },
  methods: {
    navigateToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    },
    async loadUserData() {
      try {
        const response = await api_request.api.user.getInfo();
        if (response.code === 200) {
          this.userInfo = response.data;
        } else {
          common_vendor.index.__f__("error", "at pages/my/my.vue:168", "获取用户信息失败:", response.message);
        }
        this.loadOrders();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:174", "加载用户数据失败:", error);
      }
    },
    async loadOrders() {
      try {
        let status = "";
        if (this.activeTab === 1) {
          status = "pending";
        } else if (this.activeTab === 2) {
          status = "completed";
        }
        let response;
        if (status) {
          response = await api_request.api.booking.getOrdersByStatus(status);
        } else {
          response = await api_request.api.booking.getOrders();
        }
        if (response.code === 200) {
          this.orders = response.data || [];
        } else {
          common_vendor.index.__f__("error", "at pages/my/my.vue:197", "获取订单数据失败:", response.message);
          this.orders = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:201", "加载订单数据失败:", error);
        this.orders = [];
      }
    },
    switchTab(index) {
      this.activeTab = index;
    }
  }
};
if (!Array) {
  const _component_BottomNav = common_vendor.resolveComponent("BottomNav");
  _component_BottomNav();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.icons.settings,
    b: $data.userInfo.avatarUrl || $data.images.avatar,
    c: common_vendor.t($data.userInfo.nickname || "微信用户"),
    d: common_vendor.t($options.formattedPhone || "未绑定手机"),
    e: common_vendor.o((...args) => $options.navigateToLogin && $options.navigateToLogin(...args)),
    f: $data.icons.crown,
    g: common_vendor.t($options.membershipLevel),
    h: common_vendor.t($options.membershipDesc),
    i: common_vendor.t($data.userInfo.remainingVisits || "-"),
    j: common_vendor.t($data.userInfo.totalVisits || 0),
    k: common_vendor.t($data.userInfo.points || 0),
    l: $data.activeTab === 0 ? 1 : "",
    m: $data.activeTab === 0
  }, $data.activeTab === 0 ? {} : {}, {
    n: $data.activeTab === 0 ? 1 : "",
    o: common_vendor.o(($event) => $options.switchTab(0)),
    p: $data.activeTab === 1 ? 1 : "",
    q: $data.activeTab === 1 ? 1 : "",
    r: common_vendor.o(($event) => $options.switchTab(1)),
    s: $data.activeTab === 2 ? 1 : "",
    t: $data.activeTab === 2 ? 1 : "",
    v: common_vendor.o(($event) => $options.switchTab(2)),
    w: common_vendor.f($data.orders, (order, index, i0) => {
      return {
        a: common_vendor.t(order.cabinName),
        b: common_vendor.t(order.date),
        c: common_vendor.t(order.status),
        d: common_vendor.t(order.timeSlot),
        e: common_vendor.t(order.seatName),
        f: order.id || index
      };
    }),
    x: $data.icons.clock,
    y: $data.icons.seat,
    z: common_vendor.p({
      current: 3
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
