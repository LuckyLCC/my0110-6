"use strict";
const common_vendor = require("../../common/vendor.js");
const BottomNav = () => "../../components/BottomNav.js";
const _sfc_main = {
  components: {
    BottomNav
  },
  data() {
    return {
      images: {
        luxuryCabin: "https://www.figma.com/api/mcp/asset/60bff265-fe2f-4c41-ba59-ee52e68d299e",
        icon: "https://www.figma.com/api/mcp/asset/9be8f457-e93d-4188-bac0-bbed59aab937",
        icon1: "https://www.figma.com/api/mcp/asset/6fe18f3a-6d6d-4c4a-9901-bc3dfa8aeca1",
        icon2: "https://www.figma.com/api/mcp/asset/5d72241c-8308-4dfa-a543-84108286f447",
        gallery1: "https://www.figma.com/api/mcp/asset/a745e6a5-7152-4910-aa07-f87902dd9833",
        gallery2: "https://www.figma.com/api/mcp/asset/eb88c44a-062f-4171-9fa9-06e21ab08d7c"
      },
      galleryItems: [
        {
          name: "独立座舱",
          nameEn: "Private Cabin",
          image: "https://www.figma.com/api/mcp/asset/a745e6a5-7152-4910-aa07-f87902dd9833"
        },
        {
          name: "茶歇服务",
          nameEn: "Tea Service",
          image: "https://www.figma.com/api/mcp/asset/eb88c44a-062f-4171-9fa9-06e21ab08d7c"
        },
        {
          name: "纯净负离子",
          nameEn: "Fresh Air",
          image: "https://www.figma.com/api/mcp/asset/a745e6a5-7152-4910-aa07-f87902dd9833"
        }
      ]
    };
  },
  methods: {
    navigateToBooking() {
      common_vendor.index.navigateTo({
        url: "/pages/booking/booking"
      });
    },
    navigateToStore() {
      common_vendor.index.navigateTo({
        url: "/pages/store/store"
      });
    }
  }
};
if (!Array) {
  const _component_BottomNav = common_vendor.resolveComponent("BottomNav");
  _component_BottomNav();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.images.luxuryCabin,
    b: $data.images.icon,
    c: $data.images.icon1,
    d: $data.images.icon2,
    e: common_vendor.o((...args) => $options.navigateToBooking && $options.navigateToBooking(...args)),
    f: common_vendor.f($data.galleryItems, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.nameEn),
        d: index
      };
    }),
    g: common_vendor.p({
      current: 0
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
