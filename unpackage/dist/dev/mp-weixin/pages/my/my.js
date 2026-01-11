"use strict";
const common_vendor = require("../../common/vendor.js");
const BottomNav = () => "../../components/BottomNav.js";
const _sfc_main = {
  components: {
    BottomNav
  },
  data() {
    return {
      activeTab: 0,
      icons: {
        settings: "https://www.figma.com/api/mcp/asset/5ed2b362-9495-4961-ad72-a22eab14d2af",
        crown: "https://www.figma.com/api/mcp/asset/d4df2c09-130a-4366-a7db-6370dd5ebb57",
        clock: "https://www.figma.com/api/mcp/asset/62825eba-30db-4e17-986f-16509882f006",
        seat: "https://www.figma.com/api/mcp/asset/e29a6eaf-07e3-4f31-8860-2cf07c88f6b3"
      },
      images: {
        avatar: "https://www.figma.com/api/mcp/asset/e62fc854-cb73-44b5-96be-9d778af361fb"
      },
      orders: [
        {
          cabin: "1号舱",
          date: "2025-01-02",
          status: "已完成",
          time: "10:00–11:00",
          seat: "A座"
        }
      ]
    };
  },
  methods: {
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
    b: $data.images.avatar,
    c: $data.icons.crown,
    d: $data.activeTab === 0 ? 1 : "",
    e: $data.activeTab === 0
  }, $data.activeTab === 0 ? {} : {}, {
    f: $data.activeTab === 0 ? 1 : "",
    g: common_vendor.o(($event) => $options.switchTab(0)),
    h: $data.activeTab === 1 ? 1 : "",
    i: $data.activeTab === 1 ? 1 : "",
    j: common_vendor.o(($event) => $options.switchTab(1)),
    k: $data.activeTab === 2 ? 1 : "",
    l: $data.activeTab === 2 ? 1 : "",
    m: common_vendor.o(($event) => $options.switchTab(2)),
    n: common_vendor.f($data.orders, (order, index, i0) => {
      return {
        a: common_vendor.t(order.cabin),
        b: common_vendor.t(order.date),
        c: common_vendor.t(order.status),
        d: common_vendor.t(order.time),
        e: common_vendor.t(order.seat),
        f: index
      };
    }),
    o: $data.icons.clock,
    p: $data.icons.seat,
    q: common_vendor.p({
      current: 3
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
