"use strict";
const common_vendor = require("../../common/vendor.js");
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
      ]
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
    i: !$options.isComplete ? 1 : "",
    j: common_vendor.p({
      current: 2
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d331dabb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/booking/booking.js.map
