"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
const BottomNav = () => "../../components/BottomNav.js";
const _sfc_main = {
  components: { BottomNav },
  data() {
    return {
      assets: {
        avatar: "/static/my/avatar.png",
        iconSettings: "/static/my/Icon3.svg",
        // 设置图标（网格图标）
        iconVip: "/static/my/Icon1.svg",
        // VIP图标（星星图标）
        iconInvite: "/static/my/Icon2.svg",
        // 邀请图标（连接图标）
        iconClock: "/static/my/Icon4.svg",
        // 时钟图标（预约订单时间）
        iconLocation: "/static/my/Icon5.svg",
        // 位置图标（预约订单位置）
        iconQr: "/static/my/Icon3.svg"
        // 二维码图标（分享图标）
      },
      user: {
        name: "微信用户",
        phoneMasked: "138****8888",
        avatar: "/static/my/avatar.png"
      },
      vip: {
        title: "普通用户",
        expireAt: "",
        stats: { left: 0, bound: 0, points: 0 },
        packageCategory: ""
        // 当前生效卡的分类，用于判断是否显示具体次数
      },
      purchaseRecords: [],
      tab: "all",
      orders: [],
      // 预约订单列表，从数据库获取
      showVerifyModal: false,
      // 是否显示核销码弹窗
      currentVerifyOrder: null,
      // 当前要显示核销码的订单
      qrCodeImage: "",
      // 二维码图片数据
      showInviteModal: false,
      // 是否显示邀请码弹窗
      inviteCode: "",
      // 邀请码
      currentInvitePaymentOrderId: null,
      // 当前邀请关联的支付订单ID
      inviteQrCodeImage: "",
      // 邀请二维码图片
      showDetailModal: false,
      // 是否显示购卡详情弹窗
      currentDetailRecord: null
      // 当前要显示的购卡详情记录
    };
  },
  computed: {
    filteredOrders() {
      if (this.tab === "all") {
        return this.orders;
      } else if (this.tab === "pending") {
        return this.orders.filter((o) => o.status === "pending");
      } else if (this.tab === "done") {
        return this.orders.filter((o) => o.status === "done");
      } else if (this.tab === "cancelled") {
        return this.orders.filter((o) => o.status === "cancelled");
      } else if (this.tab === "no_show") {
        return this.orders.filter((o) => o.status === "no_show");
      }
      return this.orders;
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
  // 微信分享功能
  onShareAppMessage(options) {
    common_vendor.index.__f__("log", "at pages/my/my.vue:423", "onShareAppMessage 被调用，options:", options);
    common_vendor.index.__f__("log", "at pages/my/my.vue:424", "showInviteModal:", this.showInviteModal);
    common_vendor.index.__f__("log", "at pages/my/my.vue:425", "inviteCode:", this.inviteCode);
    if (this.showInviteModal && this.inviteCode) {
      const sharePath = `/pages/invite/accept?code=${this.inviteCode}`;
      common_vendor.index.__f__("log", "at pages/my/my.vue:430", "分享邀请码，路径:", sharePath);
      return {
        title: `邀请您加入城市森林氧舱会员，邀请码：${this.inviteCode}`,
        path: sharePath,
        imageUrl: ""
        // 可以设置分享图片，留空则使用小程序默认图片
        // 注意：imageUrl 必须是网络图片，不能是本地路径
        // 如果需要自定义分享图片，可以上传到服务器或使用 CDN
      };
    }
    common_vendor.index.__f__("log", "at pages/my/my.vue:442", "默认分享");
    return {
      title: "城市森林氧舱",
      path: "/pages/index/index",
      imageUrl: ""
    };
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
            common_vendor.index.__f__("log", "at pages/my/my.vue:470", "获取用户信息失败，使用本地存储:", error);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:474", "加载用户信息错误:", error);
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
          this.updateVipFromActiveCard();
        } else {
          this.purchaseRecords = [];
          this.setNormalUserState();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:536", "获取购卡记录失败:", error);
        this.purchaseRecords = [];
        this.setNormalUserState();
      }
    },
    // 从生效中的卡更新VIP信息
    updateVipFromActiveCard() {
      const now = /* @__PURE__ */ new Date();
      now.setHours(0, 0, 0, 0);
      const activeCards = this.purchaseRecords.filter((record) => {
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
      if (activeCards.length === 0) {
        this.setNormalUserState();
        return;
      }
      const activeCard = activeCards.sort((a, b) => {
        if (a.cardEndDate && b.cardEndDate) {
          const dateA = new Date(a.cardEndDate);
          const dateB = new Date(b.cardEndDate);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB.getTime() - dateA.getTime();
          }
        } else if (a.cardEndDate) {
          return -1;
        } else if (b.cardEndDate) {
          return 1;
        }
        return new Date(b.buyAt) - new Date(a.buyAt);
      })[0];
      this.vip.title = activeCard.name;
      this.vip.expireAt = activeCard.cardEndDate || "";
      this.vip.packageCategory = activeCard.packageCategory || "";
      if (activeCard.packageCategory === "家庭/次卡") {
        if (activeCard.remainingTimes !== void 0 && activeCard.remainingTimes !== null) {
          this.vip.stats.left = activeCard.remainingTimes;
        } else if (activeCard.totalTimes !== void 0 && activeCard.totalTimes !== null) {
          const consumed = activeCard.consumedTimes || 0;
          this.vip.stats.left = Math.max(0, activeCard.totalTimes - consumed);
        } else {
          common_vendor.index.__f__("warn", "at pages/my/my.vue:615", "家庭次卡没有剩余次数信息，activeCard:", activeCard);
          this.vip.stats.left = 0;
        }
        this.loadUserStatsForPointsAndBound();
      } else {
        this.loadUserStats();
      }
    },
    // 加载用户统计数据（剩余次数、积分等）
    async loadUserStats() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        return;
      }
      try {
        const response = await api_request.api.user.getInfo();
        if (response.code === 200 && response.data) {
          const userInfo = response.data;
          if (this.vip.packageCategory !== "家庭/次卡") {
            if (userInfo.remainingVisits !== void 0 && userInfo.remainingVisits !== null) {
              this.vip.stats.left = userInfo.remainingVisits;
            }
          }
          if (userInfo.points !== void 0 && userInfo.points !== null) {
            this.vip.stats.points = userInfo.points;
          }
          if (userInfo.boundCount !== void 0 && userInfo.boundCount !== null) {
            this.vip.stats.bound = userInfo.boundCount;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:652", "获取用户统计数据失败:", error);
      }
    },
    // 只加载积分和已绑定数量（不更新剩余次数）
    async loadUserStatsForPointsAndBound() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        return;
      }
      try {
        const response = await api_request.api.user.getInfo();
        if (response.code === 200 && response.data) {
          const userInfo = response.data;
          if (userInfo.points !== void 0 && userInfo.points !== null) {
            this.vip.stats.points = userInfo.points;
          }
          if (userInfo.boundCount !== void 0 && userInfo.boundCount !== null) {
            this.vip.stats.bound = userInfo.boundCount;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:676", "获取用户统计数据失败:", error);
      }
    },
    // 设置为普通用户状态
    setNormalUserState() {
      this.vip.title = "普通用户";
      this.vip.expireAt = "";
      this.vip.stats.left = 0;
      this.vip.stats.bound = 0;
      this.vip.stats.points = 0;
      this.vip.packageCategory = "";
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
      let status = order.cardStatus || "已完成";
      let statusPillClass = "pill-gray";
      let statusTextClass = "pill-text-gray";
      if (status === "未生效") {
        statusPillClass = "pill-warm";
        statusTextClass = "pill-text-warm";
      } else if (status === "生效中") {
        statusPillClass = "pill-green";
        statusTextClass = "pill-text-green";
      } else if (status === "已完成") {
        statusPillClass = "pill-gray";
        statusTextClass = "pill-text-gray";
      } else {
        if (order.status === "paid") {
          const now = /* @__PURE__ */ new Date();
          now.setHours(0, 0, 0, 0);
          const isTimesCard = order.packageCategory === "家庭/次卡";
          if (isTimesCard && order.remainingTimes !== void 0 && order.remainingTimes !== null) {
            if (order.remainingTimes <= 0) {
              status = "已完成";
              statusPillClass = "pill-gray";
              statusTextClass = "pill-text-gray";
            } else {
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
                      status = "已完成";
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
                    status = "已完成";
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
          } else {
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
                    status = "已完成";
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
                  status = "已完成";
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
        }
      }
      let icon = "/static/my/Container2.svg";
      let iconBg = "";
      if (order.packageName && (order.packageName.includes("家庭") || order.packageName.includes("100次"))) {
        icon = "/static/my/Container1.svg";
        iconBg = "";
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
        packageId: order.packageId,
        // 保存套餐ID
        paymentOrderId: order.id,
        // 保存支付订单ID，用于生成邀请码
        id: order.id,
        // 同时保存 id，作为备用
        orderNo: order.orderNo || "",
        // 保存订单号
        remainingTimes: order.remainingTimes,
        // 剩余次数（家庭次卡）
        totalTimes: order.totalTimes,
        // 总次数（家庭次卡）
        consumedTimes: order.consumedTimes
        // 已消费次数（家庭次卡）
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
        common_vendor.index.__f__("error", "at pages/my/my.vue:917", "获取预约订单失败:", error);
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
      let showCancel = false;
      if (order.status === "completed") {
        status = "done";
        statusText = "已完成";
        statusBadgeClass = "badge-gray";
        statusTextClass = "badge-gray-text";
        showVerify = false;
        showCancel = false;
      } else if (order.status === "cancelled") {
        status = "cancelled";
        statusText = "已取消";
        statusBadgeClass = "badge-gray";
        statusTextClass = "badge-gray-text";
        showVerify = false;
        showCancel = false;
      } else if (order.status === "no_show") {
        status = "no_show";
        statusText = "未到店";
        statusBadgeClass = "badge-gray";
        statusTextClass = "badge-gray-text";
        showVerify = false;
        showCancel = false;
      } else if (order.status === "pending") {
        status = "pending";
        statusText = "待核销";
        statusBadgeClass = "badge-warm";
        statusTextClass = "badge-warm-text";
        showVerify = true;
        showCancel = true;
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
        showCancel,
        // 是否显示取消按钮
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
    navigateToProfile() {
      const token = common_vendor.index.getStorageSync("token");
      if (token) {
        common_vendor.index.navigateTo({
          url: "/pages/my/profile"
        });
      } else {
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
      }
    },
    setTab(v) {
      this.tab = v;
    },
    onInvite() {
      const now = /* @__PURE__ */ new Date();
      now.setHours(0, 0, 0, 0);
      common_vendor.index.__f__("log", "at pages/my/my.vue:1018", "点击邀请，购卡记录:", this.purchaseRecords);
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
        common_vendor.index.__f__("log", "at pages/my/my.vue:1049", "未找到生效中的卡");
        common_vendor.index.showToast({ title: "该卡无法邀请亲友", icon: "none" });
        return;
      }
      common_vendor.index.__f__("log", "at pages/my/my.vue:1054", "找到生效中的卡:", activeCard);
      if (activeCard.packageCategory !== "多人尊享") {
        common_vendor.index.__f__("log", "at pages/my/my.vue:1058", "不是多人尊享卡，分类:", activeCard.packageCategory);
        common_vendor.index.showToast({ title: "该卡无法邀请亲友", icon: "none" });
        return;
      }
      common_vendor.index.__f__("log", "at pages/my/my.vue:1064", "准备生成邀请码，activeCard:", activeCard);
      this.generateInviteCode(activeCard);
    },
    // 生成邀请码
    async generateInviteCode(activeCard) {
      try {
        common_vendor.index.showLoading({ title: "生成邀请码中...", mask: true });
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        const paymentOrderId = activeCard.paymentOrderId || activeCard.id;
        common_vendor.index.__f__("log", "at pages/my/my.vue:1084", "生成邀请码 - activeCard:", activeCard);
        common_vendor.index.__f__("log", "at pages/my/my.vue:1085", "生成邀请码 - paymentOrderId:", paymentOrderId);
        common_vendor.index.__f__("log", "at pages/my/my.vue:1086", "生成邀请码 - activeCard.paymentOrderId:", activeCard.paymentOrderId);
        common_vendor.index.__f__("log", "at pages/my/my.vue:1087", "生成邀请码 - activeCard.id:", activeCard.id);
        if (!paymentOrderId) {
          common_vendor.index.hideLoading();
          common_vendor.index.__f__("error", "at pages/my/my.vue:1091", "无法获取订单ID，activeCard:", JSON.stringify(activeCard, null, 2));
          common_vendor.index.showToast({ title: "无法获取订单信息", icon: "none" });
          return;
        }
        const response = await api_request.api.invitation.generate(paymentOrderId);
        common_vendor.index.hideLoading();
        if (response.code === 200 && response.data) {
          this.inviteCode = response.data.inviteCode;
          this.currentInvitePaymentOrderId = paymentOrderId;
          this.showInviteModal = true;
          this.$nextTick(() => {
            setTimeout(() => {
              this.generateInviteQRCode(this.inviteCode);
            }, 300);
          });
        } else {
          common_vendor.index.showToast({
            title: response.message || "生成邀请码失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/my/my.vue:1120", "生成邀请码失败:", error);
        common_vendor.index.showToast({
          title: "生成邀请码失败，请重试",
          icon: "none"
        });
      }
    },
    // 生成邀请二维码
    generateInviteQRCode(code) {
      this.$nextTick(() => {
        setTimeout(() => {
          try {
            const ctx = common_vendor.index.createCanvasContext("invite-qrcode-canvas", this);
            const qrContent = code;
            const qr = new common_vendor.UQRCode({
              canvasContext: ctx,
              text: qrContent,
              // 使用邀请码作为二维码内容
              size: 300,
              margin: 10,
              backgroundColor: "#ffffff",
              foregroundColor: "#000000",
              errorCorrectLevel: common_vendor.UQRCode.errorCorrectLevel.M
            });
            qr.make();
            qr.drawCanvas().then(() => {
              setTimeout(() => {
                common_vendor.index.canvasToTempFilePath({
                  canvasId: "invite-qrcode-canvas",
                  success: (canvasRes) => {
                    this.inviteQrCodeImage = canvasRes.tempFilePath;
                  },
                  fail: (err) => {
                    common_vendor.index.__f__("error", "at pages/my/my.vue:1163", "导出邀请二维码失败:", err);
                  }
                }, this);
              }, 50);
            }).catch((err) => {
              common_vendor.index.__f__("error", "at pages/my/my.vue:1168", "绘制邀请二维码失败:", err);
            });
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/my/my.vue:1171", "生成邀请二维码异常:", error);
          }
        }, 200);
      });
    },
    // 复制邀请码
    copyInviteCode() {
      common_vendor.index.setClipboardData({
        data: this.inviteCode,
        success: () => {
          common_vendor.index.showToast({
            title: "邀请码已复制",
            icon: "success"
          });
        }
      });
    },
    // 分享邀请码给微信好友（已废弃，改用 button 的 open-type="share"）
    // 当用户点击分享按钮时，会自动触发 onShareAppMessage 生命周期函数
    // shareInviteCode() {
    // 	// 不再需要此方法
    // },
    // 关闭邀请码弹窗
    closeInviteModal() {
      this.showInviteModal = false;
      this.inviteCode = "";
      this.currentInvitePaymentOrderId = null;
      this.inviteQrCodeImage = "";
    },
    showCardDetail(item) {
      this.currentDetailRecord = item;
      this.showDetailModal = true;
    },
    closeCardDetail() {
      this.showDetailModal = false;
      this.currentDetailRecord = null;
    },
    formatPaymentTime(record) {
      if (!record || !record.buyAt)
        return "";
      return `${record.buyAt} 14:30:00`;
    },
    copyOrderNo() {
      var _a;
      const orderNo = (_a = this.currentDetailRecord) == null ? void 0 : _a.orderNo;
      if (!orderNo) {
        common_vendor.index.showToast({
          title: "订单号为空",
          icon: "none"
        });
        return;
      }
      common_vendor.index.setClipboardData({
        data: orderNo,
        success: () => {
          common_vendor.index.showToast({
            title: "订单号已复制",
            icon: "success"
          });
        },
        fail: () => {
          common_vendor.index.showToast({
            title: "复制失败",
            icon: "none"
          });
        }
      });
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
                    common_vendor.index.__f__("error", "at pages/my/my.vue:1287", "导出 canvas 失败:", err);
                    this.qrCodeImage = "";
                  }
                }, this);
              }, 50);
            }).catch((err) => {
              common_vendor.index.__f__("error", "at pages/my/my.vue:1293", "绘制二维码失败:", err);
              setTimeout(() => {
                common_vendor.index.canvasToTempFilePath({
                  canvasId: "qrcode-canvas",
                  success: (canvasRes) => {
                    this.qrCodeImage = canvasRes.tempFilePath;
                  },
                  fail: (canvasErr) => {
                    common_vendor.index.__f__("error", "at pages/my/my.vue:1302", "导出 canvas 失败:", canvasErr);
                    this.qrCodeImage = "";
                  }
                }, this);
              }, 50);
            });
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/my/my.vue:1309", "生成二维码异常:", error);
            this.qrCodeImage = "";
          }
        }, 100);
      });
    },
    closeVerifyModal() {
      this.showVerifyModal = false;
      this.currentVerifyOrder = null;
      this.qrCodeImage = "";
    },
    // 取消预约
    async onCancelBooking(order) {
      if (!order || !order.orderId) {
        common_vendor.index.showToast({ title: "订单信息错误", icon: "none" });
        return;
      }
      common_vendor.index.showModal({
        title: "确认取消",
        content: "确定要取消该预约吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "取消中...", mask: true });
              const response = await api_request.api.booking.cancel(order.orderId);
              common_vendor.index.hideLoading();
              if (response.code === 200) {
                common_vendor.index.showToast({
                  title: "取消预约成功",
                  icon: "success"
                });
                await this.loadBookingOrders();
              } else {
                common_vendor.index.showToast({
                  title: response.message || "取消预约失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/my/my.vue:1356", "取消预约失败:", error);
              common_vendor.index.showToast({
                title: "网络错误，请稍后重试",
                icon: "none"
              });
            }
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_BottomNav = common_vendor.resolveComponent("BottomNav");
  _component_BottomNav();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  return common_vendor.e({
    a: $data.assets.iconSettings,
    b: $data.user.avatar || $data.assets.avatar,
    c: common_vendor.t($data.user.name),
    d: common_vendor.t($data.user.phoneMasked),
    e: common_vendor.o((...args) => $options.navigateToProfile && $options.navigateToProfile(...args)),
    f: $data.assets.iconVip,
    g: common_vendor.t($data.vip.title),
    h: $data.assets.iconInvite,
    i: common_vendor.o((...args) => $options.onInvite && $options.onInvite(...args)),
    j: !$options.isNormalUser
  }, !$options.isNormalUser ? {
    k: common_vendor.t($data.vip.expireAt)
  } : {}, {
    l: common_vendor.t($data.vip.packageCategory === "家庭/次卡" ? $data.vip.stats.left : "∞"),
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
        p: idx === $data.purchaseRecords.length - 1 ? 1 : "",
        q: common_vendor.o(($event) => $options.showCardDetail(item), idx)
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
    A: $data.tab === "cancelled" ? 1 : "",
    B: $data.tab === "cancelled"
  }, $data.tab === "cancelled" ? {} : {}, {
    C: common_vendor.o(($event) => $options.setTab("cancelled")),
    D: $data.tab === "no_show" ? 1 : "",
    E: $data.tab === "no_show"
  }, $data.tab === "no_show" ? {} : {}, {
    F: common_vendor.o(($event) => $options.setTab("no_show")),
    G: $data.orders.length === 0
  }, $data.orders.length === 0 ? {} : {
    H: common_vendor.f($options.filteredOrders, (order, idx, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.cabin),
        b: common_vendor.t(order.date),
        c: common_vendor.t(order.statusText),
        d: common_vendor.n(order.statusTextClass),
        e: common_vendor.n(order.statusBadgeClass),
        f: common_vendor.t(order.time),
        g: common_vendor.t(order.site),
        h: order.showVerify || order.showCancel
      }, order.showVerify || order.showCancel ? common_vendor.e({
        i: order.showCancel
      }, order.showCancel ? {
        j: common_vendor.o(($event) => $options.onCancelBooking(order), idx)
      } : {}, {
        k: order.showVerify
      }, order.showVerify ? {
        l: $data.assets.iconQr,
        m: common_vendor.o(($event) => $options.onShowVerifyCode(order), idx)
      } : {}) : {}, {
        n: idx
      });
    }),
    I: $data.assets.iconClock,
    J: $data.assets.iconLocation
  }, {
    K: $data.showVerifyModal
  }, $data.showVerifyModal ? common_vendor.e({
    L: common_vendor.o((...args) => $options.closeVerifyModal && $options.closeVerifyModal(...args)),
    M: $data.qrCodeImage
  }, $data.qrCodeImage ? {
    N: $data.qrCodeImage
  } : {
    O: common_vendor.t(((_a = $data.currentVerifyOrder) == null ? void 0 : _a.orderNo) || ((_b = $data.currentVerifyOrder) == null ? void 0 : _b.orderId))
  }, {
    P: common_vendor.t(((_c = $data.currentVerifyOrder) == null ? void 0 : _c.orderNo) || ((_d = $data.currentVerifyOrder) == null ? void 0 : _d.orderId)),
    Q: common_vendor.o(() => {
    }),
    R: common_vendor.o((...args) => $options.closeVerifyModal && $options.closeVerifyModal(...args))
  }) : {}, {
    S: $data.showDetailModal
  }, $data.showDetailModal ? {
    T: common_vendor.t(((_e = $data.currentDetailRecord) == null ? void 0 : _e.name) || "卡券详情"),
    U: common_vendor.t(((_f = $data.currentDetailRecord) == null ? void 0 : _f.name) || ""),
    V: common_vendor.t(((_g = $data.currentDetailRecord) == null ? void 0 : _g.orderNo) || ""),
    W: common_vendor.o((...args) => $options.copyOrderNo && $options.copyOrderNo(...args)),
    X: common_vendor.t(((_h = $data.currentDetailRecord) == null ? void 0 : _h.status) || ""),
    Y: common_vendor.n((_i = $data.currentDetailRecord) == null ? void 0 : _i.statusTextClass),
    Z: common_vendor.n((_j = $data.currentDetailRecord) == null ? void 0 : _j.statusPillClass),
    aa: common_vendor.t(((_k = $data.currentDetailRecord) == null ? void 0 : _k.cardStartDate) || ""),
    ab: common_vendor.t(((_l = $data.currentDetailRecord) == null ? void 0 : _l.cardEndDate) || ""),
    ac: common_vendor.t($options.formatPaymentTime($data.currentDetailRecord)),
    ad: common_vendor.o((...args) => $options.closeCardDetail && $options.closeCardDetail(...args)),
    ae: common_vendor.o(() => {
    }),
    af: common_vendor.o((...args) => $options.closeCardDetail && $options.closeCardDetail(...args))
  } : {}, {
    ag: $data.showInviteModal
  }, $data.showInviteModal ? common_vendor.e({
    ah: common_vendor.o((...args) => $options.closeInviteModal && $options.closeInviteModal(...args)),
    ai: common_vendor.t($data.inviteCode),
    aj: common_vendor.o((...args) => $options.copyInviteCode && $options.copyInviteCode(...args)),
    ak: $data.inviteQrCodeImage
  }, $data.inviteQrCodeImage ? {
    al: $data.inviteQrCodeImage
  } : {}, {
    am: common_vendor.o(() => {
    }),
    an: common_vendor.o((...args) => $options.closeInviteModal && $options.closeInviteModal(...args))
  }) : {}, {
    ao: common_vendor.p({
      current: 3
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2f1ef635"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
