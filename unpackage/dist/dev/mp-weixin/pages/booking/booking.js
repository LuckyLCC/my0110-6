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
      selectedDate: 0,
      selectedTime: -1,
      selectedSeat: "",
      dates: this.generateDates(),
      timeSlots: [
        "10:00–11:00",
        "11:15–12:15",
        "12:30–13:30",
        "13:45–14:45",
        "15:00–16:00",
        "16:15–17:15",
        "17:30–18:30",
        "18:45–19:45",
        "20:00–21:00"
      ],
      cabins: [
        { name: "1号舱", seats: ["A座", "B座"] },
        { name: "2号舱", seats: ["A座", "B座"] }
      ],
      totalPrice: {
        current: 398,
        original: 598
      },
      isMember: false
      // 是否是会员用户
    };
  },
  computed: {
    isComplete() {
      return this.selectedDate >= 0 && this.selectedTime >= 0 && this.selectedSeat !== "";
    },
    selectedDateText() {
      if (this.selectedDate >= 0) {
        return this.dates[this.selectedDate].number.replace(".", "月").replace(".", "日");
      }
      return "";
    },
    selectedTimeText() {
      if (this.selectedTime >= 0) {
        return this.timeSlots[this.selectedTime];
      }
      return "";
    },
    selectedCabinText() {
      if (this.selectedSeat) {
        const [cabinIndex] = this.selectedSeat.split("-");
        return this.cabins[parseInt(cabinIndex)].name;
      }
      return "";
    },
    selectedSeatText() {
      if (this.selectedSeat) {
        const [cabinIndex, seatIndex] = this.selectedSeat.split("-");
        return this.cabins[parseInt(cabinIndex)].seats[parseInt(seatIndex)];
      }
      return "";
    }
  },
  onLoad() {
    this.checkMemberStatus();
  },
  onShow() {
    this.checkMemberStatus();
  },
  methods: {
    // 检查用户是否是会员（是否有生效中的卡）
    async checkMemberStatus() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.isMember = false;
        common_vendor.index.__f__("log", "at pages/booking/booking.vue:166", "未登录，不是会员");
        return;
      }
      try {
        const ordersResponse = await api_request.api.payment.getOrders();
        common_vendor.index.__f__("log", "at pages/booking/booking.vue:172", "购卡记录响应:", ordersResponse);
        if (ordersResponse.code === 200 && ordersResponse.data) {
          const paidOrders = ordersResponse.data.filter((order) => order.status === "paid");
          common_vendor.index.__f__("log", "at pages/booking/booking.vue:177", "已支付的订单:", paidOrders);
          const now = /* @__PURE__ */ new Date();
          now.setHours(0, 0, 0, 0);
          const hasActiveCard = paidOrders.some((order) => {
            if (order.status === "paid") {
              if (order.cardStartDate) {
                let startDateStr = String(order.cardStartDate);
                if (startDateStr.includes("T")) {
                  startDateStr = startDateStr.split("T")[0];
                }
                const startDate = new Date(startDateStr);
                startDate.setHours(0, 0, 0, 0);
                if (now < startDate) {
                  common_vendor.index.__f__("log", "at pages/booking/booking.vue:198", `订单 ${order.id}: 未生效（当前时间 < 开始日期）`);
                  return false;
                } else {
                  if (order.cardEndDate) {
                    let endDateStr = String(order.cardEndDate);
                    if (endDateStr.includes("T")) {
                      endDateStr = endDateStr.split("T")[0];
                    }
                    const endDate = new Date(endDateStr);
                    endDate.setHours(0, 0, 0, 0);
                    if (now <= endDate) {
                      common_vendor.index.__f__("log", "at pages/booking/booking.vue:213", `订单 ${order.id}: 生效中（${startDateStr} <= ${now.toISOString().split("T")[0]} <= ${endDateStr}）`);
                      return true;
                    } else {
                      common_vendor.index.__f__("log", "at pages/booking/booking.vue:216", `订单 ${order.id}: 已过期（当前时间 > 到期日期）`);
                      return false;
                    }
                  } else {
                    common_vendor.index.__f__("log", "at pages/booking/booking.vue:221", `订单 ${order.id}: 生效中（没有到期日期，无限期）`);
                    return true;
                  }
                }
              } else {
                if (order.cardEndDate) {
                  let endDateStr = String(order.cardEndDate);
                  if (endDateStr.includes("T")) {
                    endDateStr = endDateStr.split("T")[0];
                  }
                  const endDate = new Date(endDateStr);
                  endDate.setHours(0, 0, 0, 0);
                  if (now <= endDate) {
                    common_vendor.index.__f__("log", "at pages/booking/booking.vue:236", `订单 ${order.id}: 生效中（当前时间 <= 到期日期）`);
                    return true;
                  } else {
                    common_vendor.index.__f__("log", "at pages/booking/booking.vue:239", `订单 ${order.id}: 已过期（当前时间 > 到期日期）`);
                    return false;
                  }
                } else {
                  common_vendor.index.__f__("log", "at pages/booking/booking.vue:244", `订单 ${order.id}: 生效中（没有日期信息，无限期）`);
                  return true;
                }
              }
            }
            return false;
          });
          this.isMember = hasActiveCard;
          common_vendor.index.__f__("log", "at pages/booking/booking.vue:253", "最终会员状态:", this.isMember);
        } else {
          this.isMember = false;
          common_vendor.index.__f__("log", "at pages/booking/booking.vue:256", "没有购卡记录或请求失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/booking/booking.vue:259", "检查会员状态失败:", error);
        this.isMember = false;
      }
    },
    generateDates() {
      const dates = [];
      const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      const today = /* @__PURE__ */ new Date();
      for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const weekday = weekdays[date.getDay()];
        dates.push({
          number: `${month}.${day}`,
          weekday
        });
      }
      return dates;
    },
    selectDate(index) {
      this.selectedDate = index;
    },
    selectTime(index) {
      this.selectedTime = index === this.selectedTime ? -1 : index;
    },
    selectSeat(cabinIndex, seatIndex) {
      const seatKey = `${cabinIndex}-${seatIndex}`;
      this.selectedSeat = this.selectedSeat === seatKey ? "" : seatKey;
    },
    async createBooking() {
      if (!this.isComplete) {
        common_vendor.index.showToast({
          title: "请先选择日期、时段和座位",
          icon: "none"
        });
        return;
      }
      try {
        const selectedDateInfo = this.dates[this.selectedDate];
        const currentDate = /* @__PURE__ */ new Date();
        currentDate.setDate(currentDate.getDate() + this.selectedDate);
        const formattedDate = currentDate.toISOString().split("T")[0];
        const canBookResponse = await api_request.api.booking.canBookToday(formattedDate);
        if (canBookResponse.code === 200 && !canBookResponse.data) {
          common_vendor.index.showModal({
            title: "提醒",
            content: "您今天已经消费过了，每人每天只能消费一次",
            showCancel: false,
            confirmText: "知道了"
          });
          return;
        }
        const [cabinIndex, seatIndex] = this.selectedSeat.split("-");
        const cabinName = this.cabins[parseInt(cabinIndex)].name;
        const seatName = this.cabins[parseInt(cabinIndex)].seats[parseInt(seatIndex)];
        const finalPrice = this.isMember ? 0 : this.totalPrice.current;
        const finalOriginalPrice = this.isMember ? 0 : this.totalPrice.original;
        const response = await api_request.api.booking.create({
          date: formattedDate,
          timeSlot: this.timeSlots[this.selectedTime],
          cabinName,
          seatName,
          price: finalPrice,
          originalPrice: finalOriginalPrice
        });
        if (response.code === 200) {
          const orderId = response.data.id;
          if (this.isMember) {
            common_vendor.index.showToast({
              title: "预约成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.reLaunch({
                url: "/pages/my/my"
              });
            }, 1500);
          } else {
            const payResponse = await api_request.api.booking.pay(orderId);
            if (payResponse.code === 200) {
              common_vendor.index.showToast({
                title: "预约支付成功",
                icon: "success"
              });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1500);
            } else {
              common_vendor.index.showToast({
                title: payResponse.message || "支付失败",
                icon: "none"
              });
            }
          }
        } else {
          common_vendor.index.showToast({
            title: response.message || "预约失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/booking/booking.vue:384", "创建预约订单失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none"
        });
      }
    }
  }
};
if (!Array) {
  const _component_BottomNav = common_vendor.resolveComponent("BottomNav");
  _component_BottomNav();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.dates, (date, index, i0) => {
      return {
        a: common_vendor.t(date.number),
        b: $data.selectedDate === index ? 1 : "",
        c: common_vendor.t(date.weekday),
        d: $data.selectedDate === index ? 1 : "",
        e: index,
        f: $data.selectedDate === index ? 1 : "",
        g: common_vendor.o(($event) => $options.selectDate(index), index)
      };
    }),
    b: common_vendor.f($data.timeSlots, (time, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(time),
        b: $data.selectedTime === index ? 1 : "",
        c: $data.selectedTime === index
      }, $data.selectedTime === index ? {} : {}, {
        d: index,
        e: $data.selectedTime === index ? 1 : "",
        f: common_vendor.o(($event) => $options.selectTime(index), index)
      });
    }),
    c: common_vendor.f($data.cabins, (cabin, index, i0) => {
      return {
        a: common_vendor.t(cabin.name),
        b: common_vendor.f(cabin.seats, (seat, sIndex, i1) => {
          return {
            a: common_vendor.t(seat),
            b: $data.selectedSeat === `${index}-${sIndex}` ? 1 : "",
            c: sIndex,
            d: $data.selectedSeat === `${index}-${sIndex}` ? 1 : "",
            e: common_vendor.o(($event) => $options.selectSeat(index, sIndex), sIndex)
          };
        }),
        c: index
      };
    }),
    d: !$options.isComplete
  }, !$options.isComplete ? {} : {
    e: common_vendor.t($options.selectedDateText),
    f: common_vendor.t($options.selectedTimeText),
    g: common_vendor.t($options.selectedCabinText),
    h: common_vendor.t($options.selectedSeatText)
  }, {
    i: common_vendor.t($data.isMember ? 0 : $data.totalPrice.current),
    j: !$data.isMember
  }, !$data.isMember ? {
    k: common_vendor.t($data.totalPrice.original)
  } : {}, {
    l: common_vendor.t($data.isMember ? "立即预约" : "支付并预约"),
    m: !$options.isComplete ? 1 : "",
    n: common_vendor.o((...args) => $options.createBooking && $options.createBooking(...args)),
    o: common_vendor.p({
      current: 2
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d331dabb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/booking/booking.js.map
