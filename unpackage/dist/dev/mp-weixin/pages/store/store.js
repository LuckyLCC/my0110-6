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
        check: "https://www.figma.com/api/mcp/asset/9af7aa2c-4d02-4734-a623-ed57909f758f",
        arrow: "https://www.figma.com/api/mcp/asset/f401a2a2-7c95-4d13-b643-051c1f788de1"
      },
      membershipCards: [
        {
          badge: "新人推荐",
          title: "个人月卡",
          desc: "尊享30天无限次纯净体验",
          price: "¥1680",
          originalPrice: "¥2980",
          perTime: "约 ¥56/次",
          features: ["有效期30天", "无限次", "支持1人绑定", ""]
        },
        {
          badge: "超值",
          title: "个人年卡",
          desc: "全年365天健康守护",
          price: "¥9800",
          originalPrice: "¥15800",
          perTime: "约 ¥27/次",
          features: ["有效期365天", "无限次", "支持1人绑定", ""]
        },
        {
          title: "个人季卡",
          desc: "90天无限次畅享",
          price: "¥3680",
          originalPrice: "¥5800",
          features: ["有效期90天", "无限次", "支持1人绑定", ""]
        },
        {
          title: "个人半年卡",
          desc: "180天无限次畅享",
          price: "¥5800",
          originalPrice: "¥9800",
          features: ["有效期180天", "无限次", "支持1人绑定", ""]
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
  return {
    a: $data.activeTab === 0 ? 1 : "",
    b: $data.activeTab === 0 ? 1 : "",
    c: common_vendor.o(($event) => $options.switchTab(0)),
    d: $data.activeTab === 1 ? 1 : "",
    e: $data.activeTab === 1 ? 1 : "",
    f: common_vendor.o(($event) => $options.switchTab(1)),
    g: $data.activeTab === 2 ? 1 : "",
    h: $data.activeTab === 2 ? 1 : "",
    i: common_vendor.o(($event) => $options.switchTab(2)),
    j: common_vendor.f($data.membershipCards, (item, index, i0) => {
      return common_vendor.e({
        a: item.badge
      }, item.badge ? {
        b: common_vendor.t(item.badge)
      } : {}, {
        c: common_vendor.t(item.title),
        d: common_vendor.t(item.desc),
        e: common_vendor.t(item.price),
        f: common_vendor.t(item.originalPrice),
        g: item.perTime
      }, item.perTime ? {
        h: common_vendor.t(item.perTime)
      } : {}, {
        i: common_vendor.f(item.features, (feature, fIndex, i1) => {
          return {
            a: common_vendor.t(feature),
            b: fIndex
          };
        }),
        j: index
      });
    }),
    k: $data.icons.check,
    l: $data.icons.arrow,
    m: common_vendor.p({
      current: 1
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c1a2745a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/store/store.js.map
