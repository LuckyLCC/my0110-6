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
      }
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
  methods: {
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
        const response = await api_request.api.booking.create({
          date: formattedDate,
          timeSlot: this.timeSlots[this.selectedTime],
          cabinName,
          seatName,
          price: this.totalPrice.current,
          originalPrice: this.totalPrice.original
        });
        if (response.code === 200) {
          const orderId = response.data.id;
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
        } else {
          common_vendor.index.showToast({
            title: response.message || "预约失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/booking/booking.vue:255", "创建预约订单失败:", error);
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
    i: common_vendor.t($data.totalPrice.current),
    j: common_vendor.t($data.totalPrice.original),
    k: !$options.isComplete ? 1 : "",
    l: common_vendor.o((...args) => $options.createBooking && $options.createBooking(...args)),
    m: common_vendor.p({
      current: 2
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d331dabb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/booking/booking.js.map
