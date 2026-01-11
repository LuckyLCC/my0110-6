"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  props: {
    current: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      icons: {
        home: "/static/home.png",
        homeActive: "/static/home-active .png",
        // 注意：文件名中有空格
        store: "/static/store.png",
        storeActive: "/static/store-active.png",
        booking: "/static/booking.png",
        bookingActive: "/static/booking-active.png",
        my: "/static/profile.png",
        myActive: "/static/profile-active.png"
      }
    };
  },
  methods: {
    navigateTo(url) {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentRoute = "/" + currentPage.route;
      if (currentRoute === url) {
        return;
      }
      if (url === "/pages/index/index" || url === "/pages/store/store" || url === "/pages/my/my") {
        common_vendor.index.reLaunch({
          url
        });
      } else if (url === "/pages/booking/booking") {
        common_vendor.index.navigateTo({
          url
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.current === 0
  }, $props.current === 0 ? {
    b: $data.icons.homeActive
  } : {
    c: $data.icons.home
  }, {
    d: $props.current === 0 ? 1 : "",
    e: $props.current === 0 ? 1 : "",
    f: common_vendor.o(($event) => $options.navigateTo("/pages/index/index")),
    g: $props.current === 1
  }, $props.current === 1 ? {
    h: $data.icons.storeActive
  } : {
    i: $data.icons.store
  }, {
    j: $props.current === 1 ? 1 : "",
    k: $props.current === 1 ? 1 : "",
    l: common_vendor.o(($event) => $options.navigateTo("/pages/store/store")),
    m: $props.current === 2
  }, $props.current === 2 ? {
    n: $data.icons.bookingActive
  } : {
    o: $data.icons.booking
  }, {
    p: $props.current === 2 ? 1 : "",
    q: $props.current === 2 ? 1 : "",
    r: common_vendor.o(($event) => $options.navigateTo("/pages/booking/booking")),
    s: $props.current === 3
  }, $props.current === 3 ? {
    t: $data.icons.myActive
  } : {
    v: $data.icons.my
  }, {
    w: $props.current === 3 ? 1 : "",
    x: $props.current === 3 ? 1 : "",
    y: common_vendor.o(($event) => $options.navigateTo("/pages/my/my"))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-53d1cde7"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/BottomNav.js.map
