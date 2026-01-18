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
      tabCategories: ["个人畅享", "多人尊享", "家庭/次卡"],
      icons: {
        check: "/static/payment/Icon1.png"
        // 使用本地勾选图标
      },
      membershipCards: [],
      // 从数据库获取的数据
      errorMessage: "",
      // 错误提示信息
      loading: false
      // 加载状态
    };
  },
  onLoad() {
    this.loadMembershipCards();
  },
  watch: {
    activeTab: {
      handler(newVal) {
        this.loadMembershipCards();
      },
      immediate: true
    }
  },
  methods: {
    async loadMembershipCards() {
      this.loading = true;
      this.errorMessage = "";
      this.membershipCards = [];
      try {
        const category = this.tabCategories[this.activeTab];
        common_vendor.index.__f__("log", "at pages/store/store.vue:127", "正在请求分类:", category);
        common_vendor.index.__f__("log", "at pages/store/store.vue:128", "请求的分类参数:", category);
        const response = await api_request.api.packages.getByCategory(category);
        common_vendor.index.__f__("log", "at pages/store/store.vue:131", "API响应:", response);
        if (response.code === 200) {
          if (response.data && response.data.length > 0) {
            this.membershipCards = response.data;
            this.errorMessage = "";
            common_vendor.index.__f__("log", "at pages/store/store.vue:137", "成功加载", response.data.length, "个套餐");
          } else {
            this.membershipCards = [];
            common_vendor.index.__f__("log", "at pages/store/store.vue:140", "该分类没有套餐数据");
          }
        } else {
          const errorMsg = response.message || "获取会员套餐数据失败";
          this.errorMessage = `错误: ${errorMsg}`;
          this.membershipCards = [];
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none",
            duration: 3e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/store/store.vue:155", "API请求错误:", error);
        let errorMsg = "网络连接失败";
        if (error.errMsg) {
          if (error.errMsg.includes("fail")) {
            errorMsg = "无法连接到服务器，请检查后端服务是否启动";
          } else {
            errorMsg = `网络错误: ${error.errMsg}`;
          }
        } else if (error.message) {
          errorMsg = `请求错误: ${error.message}`;
        }
        this.errorMessage = errorMsg;
        this.membershipCards = [];
        common_vendor.index.__f__("error", "at pages/store/store.vue:170", "获取会员套餐数据异常:", error);
        common_vendor.index.showToast({
          title: errorMsg,
          icon: "none",
          duration: 3e3
        });
      } finally {
        this.loading = false;
      }
    },
    switchTab(index) {
      common_vendor.index.__f__("log", "at pages/store/store.vue:181", "切换到标签:", index);
      this.activeTab = index;
    },
    navigateToPayment(item) {
      const price = item.price || 0;
      const originalPrice = item.originalPrice || 0;
      const validDays = item.validDays || 0;
      common_vendor.index.navigateTo({
        url: `/pages/payment/payment?packageId=${item.id || ""}&packageName=${encodeURIComponent(item.name || "")}&price=${price}&originalPrice=${originalPrice}&validDays=${validDays}`
      });
    },
    formatDescription(item) {
      if (item.validDays > 0) {
        return `有效期${item.validDays}天，不限次数（每人每天仅限一次）`;
      } else if (item.validDays === -1) {
        return `不限时间，不限次数（每人每天仅限一次）`;
      } else {
        return "尊享专属健康方案（每人每天仅限一次）";
      }
    },
    formatFeatures(item) {
      const features = [];
      if (item.people > 0) {
        if (item.people === -1) {
          features.push("多人共享");
        } else {
          features.push(`支持${item.people}人绑定`);
        }
      }
      if (this.activeTab !== 1 && item.timesPerPerson > 0) {
        features.push(`每人${item.timesPerPerson}次`);
      }
      return features;
    }
  },
  filters: {
    currency(value) {
      if (!value)
        return "¥0";
      return typeof value === "number" ? `¥${value}` : value;
    }
  }
};
if (!Array) {
  const _component_BottomNav = common_vendor.resolveComponent("BottomNav");
  _component_BottomNav();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.activeTab === 0 ? 1 : "",
    b: $data.activeTab === 0 ? 1 : "",
    c: common_vendor.o(($event) => $options.switchTab(0)),
    d: $data.activeTab === 1 ? 1 : "",
    e: $data.activeTab === 1 ? 1 : "",
    f: common_vendor.o(($event) => $options.switchTab(1)),
    g: $data.activeTab === 2 ? 1 : "",
    h: $data.activeTab === 2 ? 1 : "",
    i: common_vendor.o(($event) => $options.switchTab(2)),
    j: $data.loading
  }, $data.loading ? {} : $data.errorMessage ? {
    l: common_vendor.t($data.errorMessage)
  } : $data.membershipCards.length === 0 && !$data.loading ? {} : {
    n: common_vendor.f($data.membershipCards, (item, index, i0) => {
      return common_vendor.e({
        a: item.badge
      }, item.badge ? {
        b: common_vendor.t(item.badge)
      } : {}, {
        c: common_vendor.t(item.name),
        d: common_vendor.t($options.formatDescription(item)),
        e: common_vendor.t(item.price),
        f: item.avgPricePerTime
      }, item.avgPricePerTime ? {
        g: common_vendor.t(item.avgPricePerTime)
      } : {}, {
        h: common_vendor.f($options.formatFeatures(item), (feature, fIndex, i1) => {
          return {
            a: common_vendor.t(feature),
            b: fIndex
          };
        }),
        i: common_vendor.o(($event) => $options.navigateToPayment(item), item.id || index),
        j: item.id || index
      });
    }),
    o: $data.icons.check
  }, {
    k: $data.errorMessage,
    m: $data.membershipCards.length === 0 && !$data.loading,
    p: common_vendor.p({
      current: 1
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c1a2745a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/store/store.js.map
