"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
const BottomNav = () => "../../components/BottomNav.js";
const _sfc_main = {
  components: { BottomNav },
  data() {
    return {
      assets: {
        avatar: "https://www.figma.com/api/mcp/asset/48dced70-d93c-4c7e-ace6-c3b399ca5a05",
        iconSettings: "https://www.figma.com/api/mcp/asset/51c7f686-bd66-4431-934b-4740a9719f6a",
        iconVip: "https://www.figma.com/api/mcp/asset/e74344f2-0649-44d7-bb9f-08f2c853e984",
        iconInvite: "https://www.figma.com/api/mcp/asset/97d47ae7-b35c-4d00-a688-1d5a2a7b8905",
        iconClock: "https://www.figma.com/api/mcp/asset/ebdc0f3f-8fb4-4dcb-b0db-1a693cb69da8",
        iconLocation: "https://www.figma.com/api/mcp/asset/7cd435a5-6518-4258-bb95-7d274e49bf10",
        iconQr: "https://www.figma.com/api/mcp/asset/3629e2b7-0fbd-4283-a904-2a39665d503c"
      },
      user: {
        name: "微信用户",
        phoneMasked: "138****8888",
        avatar: "https://www.figma.com/api/mcp/asset/48dced70-d93c-4c7e-ace6-c3b399ca5a05"
      },
      vip: {
        title: "普通用户",
        expireAt: "",
        stats: { left: 0, bound: 0, points: 0 }
      },
      purchaseRecords: [],
      tab: "all",
      orders: [],
      // 预约订单列表，从数据库获取
      showVerifyModal: false,
      // 是否显示核销码弹窗
      currentVerifyOrder: null,
      // 当前要显示核销码的订单
      qrCodeImage: ""
      // 二维码图片数据
    };
  },
  computed: {
    filteredOrders() {
      if (this.tab === "all")
        return this.orders;
      return this.orders.filter((o) => o.status === this.tab);
    },
    // 判断是否是普通用户（没有生效中的卡）
    isNormalUser() {
      if (!this.purchaseRecords || this.purchaseRecords.length === 0) {
        return true;
      }
      const now = /* @__PURE__ */ new Date();
      now.setHours(0, 0, 0, 0);
      const hasActiveCard = this.purchaseRecords.some((record) => {
        if (record.status !== "生效中") {
          return false;
        }
        if (record.cardStartDate && record.cardEndDate) {
          const startDate = new Date(record.cardStartDate);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(record.cardEndDate);
          endDate.setHours(0, 0, 0, 0);
          return now >= startDate && now <= endDate;
        } else if (record.cardEndDate) {
          const endDate = new Date(record.cardEndDate);
          endDate.setHours(0, 0, 0, 0);
          return now <= endDate;
        } else if (record.cardStartDate) {
          const startDate = new Date(record.cardStartDate);
          startDate.setHours(0, 0, 0, 0);
          return now >= startDate;
        }
        return true;
      });
      return !hasActiveCard;
    }
  },
  onLoad() {
    this.loadUserInfo();
    this.loadPurchaseRecords();
    this.loadBookingOrders();
  },
  onShow() {
    this.loadUserInfo();
    this.loadPurchaseRecords();
    this.loadBookingOrders();
  },
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        const localUserInfo = common_vendor.index.getStorageSync("userInfo");
        if (localUserInfo) {
          this.updateUserInfo(localUserInfo);
        }
        const token = common_vendor.index.getStorageSync("token");
        if (token) {
          try {
            const response = await api_request.api.user.getInfo();
            if (response.code === 200 && response.data) {
              this.updateUserInfo(response.data);
              common_vendor.index.setStorageSync("userInfo", response.data);
            }
          } catch (error) {
            common_vendor.index.__f__("log", "at pages/my/my.vue:305", "获取用户信息失败，使用本地存储:", error);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:309", "加载用户信息错误:", error);
      }
    },
    // 更新用户信息显示
    updateUserInfo(userInfo) {
      if (!userInfo)
        return;
      if (userInfo.nickname || userInfo.name) {
        this.user.name = userInfo.nickname || userInfo.name || "微信用户";
      }
      if (userInfo.avatar || userInfo.avatarUrl) {
        this.user.avatar = userInfo.avatar || userInfo.avatarUrl;
      }
      if (userInfo.phone) {
        this.user.phoneMasked = this.maskPhone(userInfo.phone);
      } else if (userInfo.phoneNumber) {
        this.user.phoneMasked = this.maskPhone(userInfo.phoneNumber);
      }
      if (!this.isNormalUser) {
        if (userInfo.packageName) {
          this.vip.title = userInfo.packageName;
        }
        if (userInfo.remainingVisits !== void 0 && userInfo.remainingVisits !== null) {
          this.vip.stats.left = userInfo.remainingVisits;
        }
        if (userInfo.points !== void 0 && userInfo.points !== null) {
          this.vip.stats.points = userInfo.points;
        }
        if (userInfo.memberExpireTime) {
          const expireDate = new Date(userInfo.memberExpireTime);
          const year = expireDate.getFullYear();
          const month = String(expireDate.getMonth() + 1).padStart(2, "0");
          const day = String(expireDate.getDate()).padStart(2, "0");
          this.vip.expireAt = `${year}-${month}-${day}`;
        }
        if (userInfo.boundCount !== void 0 && userInfo.boundCount !== null) {
          this.vip.stats.bound = userInfo.boundCount;
        }
      }
    },
    // 手机号掩码处理
    maskPhone(phone) {
      if (!phone || phone.length < 11)
        return phone;
      return phone.substring(0, 3) + "****" + phone.substring(7);
    },
    // 加载购卡记录
    async loadPurchaseRecords() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.purchaseRecords = [];
        this.setNormalUserState();
        return;
      }
      try {
        const response = await api_request.api.payment.getOrders();
        if (response.code === 200 && response.data) {
          this.purchaseRecords = response.data.filter((order) => order.status === "paid").map((order) => this.formatPurchaseRecord(order)).sort((a, b) => {
            return new Date(b.buyAt) - new Date(a.buyAt);
          });
          if (this.isNormalUser) {
            this.setNormalUserState();
          }
        } else {
          this.purchaseRecords = [];
          this.setNormalUserState();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:405", "获取购卡记录失败:", error);
        this.purchaseRecords = [];
        this.setNormalUserState();
      }
    },
    // 设置为普通用户状态
    setNormalUserState() {
      this.vip.title = "普通用户";
      this.vip.expireAt = "";
      this.vip.stats.left = 0;
      this.vip.stats.bound = 0;
      this.vip.stats.points = 0;
    },
    // 格式化购卡记录
    formatPurchaseRecord(order) {
      const formattedPrice = "¥" + order.price.toLocaleString("zh-CN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      const buyDate = order.paymentTime || order.createdAt;
      let formattedDate = "";
      if (buyDate) {
        const date = new Date(buyDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        formattedDate = `${year}-${month}-${day}`;
      }
      let formattedStartDate = "";
      if (order.cardStartDate) {
        const startDate = new Date(order.cardStartDate);
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, "0");
        const day = String(startDate.getDate()).padStart(2, "0");
        formattedStartDate = `${year}-${month}-${day}`;
      }
      let formattedEndDate = "";
      if (order.cardEndDate) {
        const endDate = new Date(order.cardEndDate);
        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, "0");
        const day = String(endDate.getDate()).padStart(2, "0");
        formattedEndDate = `${year}-${month}-${day}`;
      }
      let status = "已过期";
      let statusPillClass = "pill-gray";
      let statusTextClass = "pill-text-gray";
      if (order.status === "paid") {
        const now = /* @__PURE__ */ new Date();
        now.setHours(0, 0, 0, 0);
        if (order.cardStartDate) {
          const startDate = new Date(order.cardStartDate);
          startDate.setHours(0, 0, 0, 0);
          if (now < startDate) {
            status = "未生效";
            statusPillClass = "pill-warm";
            statusTextClass = "pill-text-warm";
          } else {
            if (order.cardEndDate) {
              const endDate = new Date(order.cardEndDate);
              endDate.setHours(0, 0, 0, 0);
              if (now <= endDate) {
                status = "生效中";
                statusPillClass = "pill-green";
                statusTextClass = "pill-text-green";
              } else {
                status = "已过期";
                statusPillClass = "pill-gray";
                statusTextClass = "pill-text-gray";
              }
            } else {
              status = "生效中";
              statusPillClass = "pill-green";
              statusTextClass = "pill-text-green";
            }
          }
        } else {
          if (order.cardEndDate) {
            const endDate = new Date(order.cardEndDate);
            endDate.setHours(0, 0, 0, 0);
            if (now <= endDate) {
              status = "生效中";
              statusPillClass = "pill-green";
              statusTextClass = "pill-text-green";
            } else {
              status = "已过期";
              statusPillClass = "pill-gray";
              statusTextClass = "pill-text-gray";
            }
          } else {
            status = "生效中";
            statusPillClass = "pill-green";
            statusTextClass = "pill-text-green";
          }
        }
      }
      let icon = "https://www.figma.com/api/mcp/asset/53c6b923-1424-4cc2-9923-6bda581a5924";
      let iconBg = "bg-warm";
      if (order.packageName && (order.packageName.includes("家庭") || order.packageName.includes("100次"))) {
        icon = "https://www.figma.com/api/mcp/asset/bd32f170-e8c9-4a38-8b65-ac6e5513a467";
        iconBg = "bg-gray";
      }
      return {
        name: order.packageName || "未知套餐",
        buyAt: formattedDate,
        cardStartDate: formattedStartDate,
        cardEndDate: formattedEndDate,
        price: formattedPrice,
        status,
        icon,
        iconBg,
        statusPillClass,
        statusTextClass,
        packageCategory: order.packageCategory || "",
        // 保存套餐分类
        packageId: order.packageId
        // 保存套餐ID
      };
    },
    // 加载预约订单
    async loadBookingOrders() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.orders = [];
        return;
      }
      try {
        const response = await api_request.api.booking.getOrders();
        if (response.code === 200 && response.data) {
          this.orders = response.data.map((order) => this.formatBookingOrder(order)).sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          });
        } else {
          this.orders = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:575", "获取预约订单失败:", error);
        this.orders = [];
      }
    },
    // 格式化预约订单
    formatBookingOrder(order) {
      let formattedDate = order.date || "";
      let formattedTime = order.timeSlot || "";
      formattedTime = formattedTime.replace(/-/g, "–");
      const cabin = order.cabinName || "";
      const site = order.seatName || "";
      let status = "pending";
      let statusText = "待核销";
      let statusBadgeClass = "badge-warm";
      let statusTextClass = "badge-warm-text";
      let showVerify = false;
      if (order.status === "completed") {
        status = "done";
        statusText = "已完成";
        statusBadgeClass = "badge-gray";
        statusTextClass = "badge-gray-text";
        showVerify = false;
      } else if (order.status === "pending") {
        status = "pending";
        statusText = "待核销";
        statusBadgeClass = "badge-warm";
        statusTextClass = "badge-warm-text";
        showVerify = true;
      }
      return {
        cabin,
        date: formattedDate,
        time: formattedTime,
        site,
        status,
        statusText,
        statusBadgeClass,
        statusTextClass,
        showVerify,
        orderId: order.id,
        // 保存订单ID，用于核销码展示
        orderNo: order.orderNo || order.id
        // 保存订单号，用于核销码展示
      };
    },
    navigateToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    },
    setTab(v) {
      this.tab = v;
    },
    onInvite() {
      const now = /* @__PURE__ */ new Date();
      now.setHours(0, 0, 0, 0);
      const activeCard = this.purchaseRecords.find((record) => {
        if (record.status !== "生效中") {
          return false;
        }
        if (record.cardStartDate && record.cardEndDate) {
          const startDate = new Date(record.cardStartDate);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(record.cardEndDate);
          endDate.setHours(0, 0, 0, 0);
          return now >= startDate && now <= endDate;
        } else if (record.cardEndDate) {
          const endDate = new Date(record.cardEndDate);
          endDate.setHours(0, 0, 0, 0);
          return now <= endDate;
        } else if (record.cardStartDate) {
          const startDate = new Date(record.cardStartDate);
          startDate.setHours(0, 0, 0, 0);
          return now >= startDate;
        }
        return true;
      });
      if (!activeCard) {
        common_vendor.index.showToast({ title: "该卡无法邀请亲友", icon: "none" });
        return;
      }
      if (activeCard.packageCategory !== "多人尊享") {
        common_vendor.index.showToast({ title: "该卡无法邀请亲友", icon: "none" });
        return;
      }
      common_vendor.index.showToast({ title: "邀请功能待接入", icon: "none" });
    },
    onShowVerifyCode(order) {
      if (order && (order.orderId || order.orderNo)) {
        this.currentVerifyOrder = order;
        this.showVerifyModal = true;
        this.qrCodeImage = "";
        this.generateQRCode(order.orderNo || order.orderId);
      } else {
        common_vendor.index.showToast({ title: "核销码信息错误", icon: "none" });
      }
    },
    generateQRCode(orderNo) {
      this.$nextTick(() => {
        setTimeout(() => {
          try {
            const ctx = common_vendor.index.createCanvasContext("qrcode-canvas", this);
            const qr = new common_vendor.UQRCode({
              canvasContext: ctx,
              text: String(orderNo),
              // 二维码内容为订单号
              size: 300,
              // 二维码大小
              margin: 10,
              backgroundColor: "#ffffff",
              foregroundColor: "#000000",
              errorCorrectLevel: common_vendor.UQRCode.errorCorrectLevel.M
            });
            qr.make();
            qr.drawCanvas().then(() => {
              setTimeout(() => {
                common_vendor.index.canvasToTempFilePath({
                  canvasId: "qrcode-canvas",
                  success: (canvasRes) => {
                    this.qrCodeImage = canvasRes.tempFilePath;
                  },
                  fail: (err) => {
                    common_vendor.index.__f__("error", "at pages/my/my.vue:732", "导出 canvas 失败:", err);
                    this.qrCodeImage = "";
                  }
                }, this);
              }, 50);
            }).catch((err) => {
              common_vendor.index.__f__("error", "at pages/my/my.vue:738", "绘制二维码失败:", err);
              setTimeout(() => {
                common_vendor.index.canvasToTempFilePath({
                  canvasId: "qrcode-canvas",
                  success: (canvasRes) => {
                    this.qrCodeImage = canvasRes.tempFilePath;
                  },
                  fail: (canvasErr) => {
                    common_vendor.index.__f__("error", "at pages/my/my.vue:747", "导出 canvas 失败:", canvasErr);
                    this.qrCodeImage = "";
                  }
                }, this);
              }, 50);
            });
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/my/my.vue:754", "生成二维码异常:", error);
            this.qrCodeImage = "";
          }
        }, 100);
      });
    },
    closeVerifyModal() {
      this.showVerifyModal = false;
      this.currentVerifyOrder = null;
      this.qrCodeImage = "";
    }
  }
};
if (!Array) {
  const _component_BottomNav = common_vendor.resolveComponent("BottomNav");
  _component_BottomNav();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b, _c, _d;
  return common_vendor.e({
    a: $data.assets.iconSettings,
    b: $data.user.avatar || $data.assets.avatar,
    c: common_vendor.t($data.user.name),
    d: common_vendor.t($data.user.phoneMasked),
    e: common_vendor.o((...args) => $options.navigateToLogin && $options.navigateToLogin(...args)),
    f: $data.assets.iconVip,
    g: common_vendor.t($data.vip.title),
    h: $data.assets.iconInvite,
    i: common_vendor.o((...args) => $options.onInvite && $options.onInvite(...args)),
    j: !$options.isNormalUser
  }, !$options.isNormalUser ? {
    k: common_vendor.t($data.vip.expireAt)
  } : {}, {
    l: common_vendor.t($data.vip.stats.left),
    m: common_vendor.t($data.vip.stats.bound),
    n: common_vendor.t($data.vip.stats.points),
    o: $data.purchaseRecords.length === 0
  }, $data.purchaseRecords.length === 0 ? {} : {}, {
    p: common_vendor.f($data.purchaseRecords, (item, idx, i0) => {
      return common_vendor.e({
        a: item.icon,
        b: common_vendor.n(item.iconBg),
        c: common_vendor.t(item.name),
        d: common_vendor.t(item.buyAt),
        e: item.cardStartDate || item.cardEndDate
      }, item.cardStartDate || item.cardEndDate ? common_vendor.e({
        f: item.cardStartDate
      }, item.cardStartDate ? {
        g: common_vendor.t(item.cardStartDate)
      } : {}, {
        h: item.cardEndDate
      }, item.cardEndDate ? {
        i: common_vendor.t(item.cardEndDate)
      } : {}) : {}, {
        j: common_vendor.t(item.price),
        k: common_vendor.t(item.status),
        l: common_vendor.n(item.statusTextClass),
        m: common_vendor.n(item.statusPillClass),
        n: idx,
        o: idx !== $data.purchaseRecords.length - 1 ? 1 : "",
        p: idx === $data.purchaseRecords.length - 1 ? 1 : ""
      });
    }),
    q: $data.tab === "all" ? 1 : "",
    r: $data.tab === "all"
  }, $data.tab === "all" ? {} : {}, {
    s: common_vendor.o(($event) => $options.setTab("all")),
    t: $data.tab === "pending" ? 1 : "",
    v: $data.tab === "pending"
  }, $data.tab === "pending" ? {} : {}, {
    w: common_vendor.o(($event) => $options.setTab("pending")),
    x: $data.tab === "done" ? 1 : "",
    y: $data.tab === "done"
  }, $data.tab === "done" ? {} : {}, {
    z: common_vendor.o(($event) => $options.setTab("done")),
    A: $data.orders.length === 0
  }, $data.orders.length === 0 ? {} : {
    B: common_vendor.f($options.filteredOrders, (order, idx, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.cabin),
        b: common_vendor.t(order.date),
        c: common_vendor.t(order.statusText),
        d: common_vendor.n(order.statusTextClass),
        e: common_vendor.n(order.statusBadgeClass),
        f: common_vendor.t(order.time),
        g: common_vendor.t(order.site),
        h: order.showVerify
      }, order.showVerify ? {
        i: $data.assets.iconQr,
        j: common_vendor.o(($event) => $options.onShowVerifyCode(order), idx)
      } : {}, {
        k: idx
      });
    }),
    C: $data.assets.iconClock,
    D: $data.assets.iconLocation
  }, {
    E: $data.showVerifyModal
  }, $data.showVerifyModal ? common_vendor.e({
    F: common_vendor.o((...args) => $options.closeVerifyModal && $options.closeVerifyModal(...args)),
    G: $data.qrCodeImage
  }, $data.qrCodeImage ? {
    H: $data.qrCodeImage
  } : {
    I: common_vendor.t(((_a = $data.currentVerifyOrder) == null ? void 0 : _a.orderNo) || ((_b = $data.currentVerifyOrder) == null ? void 0 : _b.orderId))
  }, {
    J: common_vendor.t(((_c = $data.currentVerifyOrder) == null ? void 0 : _c.orderNo) || ((_d = $data.currentVerifyOrder) == null ? void 0 : _d.orderId)),
    K: common_vendor.o(() => {
    }),
    L: common_vendor.o((...args) => $options.closeVerifyModal && $options.closeVerifyModal(...args))
  }) : {}, {
    M: common_vendor.p({
      current: 3
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
