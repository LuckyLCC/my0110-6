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
      vipPrice: "99",
      // 默认价格，将从后端获取
      singleExperiencePrice: {
        current: 398,
        original: 598
      },
      images: {
        luxuryCabin: "/static/index/luxuryCabin.png",
        icon: "/static/index/Container.svg",
        // VIP卡片箭头图标（包含圆圈和箭头）
        icon1: "/static/index/Icon2.svg",
        // 60min 时钟图标
        icon2: "/static/index/Icon3.svg",
        // 私密空间图标
        gallery1: "/static/index/gallery1.png",
        gallery2: "/static/index/gallery2.png"
      },
      galleryItems: [
        {
          name: "独立座舱",
          nameEn: "Private Cabin",
          image: "/static/index/gallery1.png"
        },
        {
          name: "茶歇服务",
          nameEn: "Tea Service",
          image: "/static/index/gallery2.png"
        },
        {
          name: "纯净负离子",
          nameEn: "Fresh Air",
          image: "/static/index/gallery1.png"
        }
      ]
    };
  },
  async onLoad() {
    await this.loadPackageData();
  },
  methods: {
    async loadPackageData() {
      try {
        const response = await api_request.api.packages.getAll();
        if (response.code === 200 && response.data && response.data.length > 0) {
          const cheapestPackage = response.data.reduce((prev, curr) => {
            const prevPrice = prev.avgPricePerTime || Number.MAX_VALUE;
            const currPrice = curr.avgPricePerTime || Number.MAX_VALUE;
            return prevPrice < currPrice ? prev : curr;
          });
          if (cheapestPackage.avgPricePerTime) {
            this.vipPrice = cheapestPackage.avgPricePerTime;
          }
          this.singleExperiencePrice.current = 398;
          this.singleExperiencePrice.original = 598;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:173", "获取套餐数据失败:", error);
        this.singleExperiencePrice.current = 398;
        this.singleExperiencePrice.original = 598;
      }
    },
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
    b: common_vendor.t($data.vipPrice),
    c: $data.images.icon,
    d: common_vendor.o((...args) => $options.navigateToStore && $options.navigateToStore(...args)),
    e: common_vendor.t($data.singleExperiencePrice.current),
    f: common_vendor.t($data.singleExperiencePrice.original),
    g: $data.images.icon1,
    h: $data.images.icon2,
    i: common_vendor.o((...args) => $options.navigateToBooking && $options.navigateToBooking(...args)),
    j: common_vendor.f($data.galleryItems, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.nameEn),
        d: index
      };
    }),
    k: common_vendor.p({
      current: 0
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
