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
      isMember: false,
      // 是否是会员用户
      bookedSeats: []
      // 已预约的舱位列表，格式：['1号舱-A座', '2号舱-B座']
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
    if (this.selectedTime >= 0 && this.isTimeSlotDisabled(this.selectedTime)) {
      this.selectedTime = -1;
    }
  },
  methods: {
    // 检查用户是否是会员（是否有生效中的卡）
    async checkMemberStatus() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.isMember = false;
        common_vendor.index.__f__("log", "at pages/booking/booking.vue:180", "未登录，不是会员");
        return;
      }
      try {
        const ordersResponse = await api_request.api.payment.getOrders();
        common_vendor.index.__f__("log", "at pages/booking/booking.vue:186", "购卡记录响应:", ordersResponse);
        if (ordersResponse.code === 200 && ordersResponse.data) {
          const paidOrders = ordersResponse.data.filter((order) => order.status === "paid");
          common_vendor.index.__f__("log", "at pages/booking/booking.vue:191", "已支付的订单:", paidOrders);
          const hasActiveCard = paidOrders.some((order) => {
            if (order.cardStatus) {
              const isActive = order.cardStatus === "生效中";
              common_vendor.index.__f__("log", "at pages/booking/booking.vue:198", `订单 ${order.id} (${order.packageName}): cardStatus = ${order.cardStatus}, 是否生效中: ${isActive}`);
              return isActive;
            }
            common_vendor.index.__f__("log", "at pages/booking/booking.vue:203", `订单 ${order.id} (${order.packageName}): cardStatus 为 null 或 undefined，不允许预约`);
            return false;
          });
          this.isMember = hasActiveCard;
          common_vendor.index.__f__("log", "at pages/booking/booking.vue:208", "最终会员状态:", this.isMember);
        } else {
          this.isMember = false;
          common_vendor.index.__f__("log", "at pages/booking/booking.vue:211", "没有购卡记录或请求失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/booking/booking.vue:214", "检查会员状态失败:", error);
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
      if (this.selectedTime >= 0 && this.isTimeSlotDisabled(this.selectedTime)) {
        this.selectedTime = -1;
      }
      this.selectedSeat = "";
      this.loadBookedSeats();
    },
    selectTime(index) {
      if (this.isTimeSlotDisabled(index)) {
        common_vendor.index.showToast({
          title: "该时段已过期，无法选择",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      this.selectedTime = index === this.selectedTime ? -1 : index;
      this.selectedSeat = "";
      this.loadBookedSeats();
    },
    // 检查时段是否已过期
    isTimeSlotDisabled(timeIndex) {
      if (this.selectedDate > 0) {
        return false;
      }
      const timeSlot = this.timeSlots[timeIndex];
      if (!timeSlot) {
        return false;
      }
      let startTimeStr = timeSlot.split("–")[0];
      if (!startTimeStr || startTimeStr === timeSlot) {
        startTimeStr = timeSlot.split("-")[0];
      }
      if (!startTimeStr) {
        return false;
      }
      const now = /* @__PURE__ */ new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const timeParts = startTimeStr.split(":");
      if (timeParts.length !== 2) {
        return false;
      }
      const startHour = parseInt(timeParts[0], 10);
      const startMinute = parseInt(timeParts[1], 10);
      if (isNaN(startHour) || isNaN(startMinute)) {
        return false;
      }
      if (currentHour > startHour) {
        return true;
      } else if (currentHour === startHour && currentMinute >= startMinute) {
        return true;
      }
      return false;
    },
    selectSeat(cabinIndex, seatIndex) {
      if (this.isSeatDisabled(cabinIndex, seatIndex)) {
        common_vendor.index.showToast({
          title: "该舱位已被预约，请选择其他舱位",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      const seatKey = `${cabinIndex}-${seatIndex}`;
      this.selectedSeat = this.selectedSeat === seatKey ? "" : seatKey;
    },
    // 检查座位是否已被预约
    isSeatDisabled(cabinIndex, seatIndex) {
      if (this.selectedDate < 0 || this.selectedTime < 0) {
        return false;
      }
      const cabinName = this.cabins[cabinIndex].name;
      const seatName = this.cabins[cabinIndex].seats[seatIndex];
      const seatKey = `${cabinName}-${seatName}`;
      return this.bookedSeats.includes(seatKey);
    },
    // 加载已预约的舱位列表
    async loadBookedSeats() {
      if (this.selectedDate < 0 || this.selectedTime < 0) {
        this.bookedSeats = [];
        return;
      }
      try {
        const currentDate = /* @__PURE__ */ new Date();
        currentDate.setDate(currentDate.getDate() + this.selectedDate);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;
        const timeSlot = this.timeSlots[this.selectedTime];
        const response = await api_request.api.booking.getBookedSeats(formattedDate, timeSlot);
        if (response.code === 200 && response.data) {
          this.bookedSeats = response.data || [];
          common_vendor.index.__f__("log", "at pages/booking/booking.vue:364", "已预约的舱位列表:", this.bookedSeats);
        } else {
          this.bookedSeats = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/booking/booking.vue:369", "获取已预约舱位列表失败:", error);
        this.bookedSeats = [];
      }
    },
    async createBooking() {
      if (!this.isComplete) {
        common_vendor.index.showToast({
          title: "请先选择日期、时段和座位",
          icon: "none"
        });
        return;
      }
      await this.checkMemberStatus();
      common_vendor.index.__f__("log", "at pages/booking/booking.vue:384", "预约前会员状态检查结果:", this.isMember);
      try {
        const selectedDateInfo = this.dates[this.selectedDate];
        const currentDate = /* @__PURE__ */ new Date();
        currentDate.setDate(currentDate.getDate() + this.selectedDate);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;
        const canBookResponse = await api_request.api.booking.canBookToday(formattedDate);
        if (canBookResponse.code === 200 && !canBookResponse.data) {
          common_vendor.index.showModal({
            title: "提醒",
            content: "您在该日期已经预约过了，每人每天只能预约一次",
            showCancel: false,
            confirmText: "知道了"
          });
          return;
        }
        const [cabinIndex, seatIndex] = this.selectedSeat.split("-");
        const cabinName = this.cabins[parseInt(cabinIndex)].name;
        const seatName = this.cabins[parseInt(cabinIndex)].seats[parseInt(seatIndex)];
        const confirmResult = await new Promise((resolve) => {
          common_vendor.index.showModal({
            title: "预约须知",
            content: "请在预约开始时间前10分钟到店准备，为避免影响其他顾客我们将于预约开始时间准时关舱，届时不能进入舱体，请取消预约订单并重新预约后续场次",
            showCancel: true,
            confirmText: "我已了解",
            cancelText: "取消",
            success: (res) => {
              resolve(res.confirm);
            },
            fail: () => {
              resolve(false);
            }
          });
        });
        if (!confirmResult) {
          return;
        }
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
              icon: "success",
              duration: 1500
            });
            setTimeout(() => {
              try {
                common_vendor.index.redirectTo({
                  url: "/pages/my/my",
                  fail: (err) => {
                    common_vendor.index.__f__("error", "at pages/booking/booking.vue:467", "跳转失败:", err);
                    common_vendor.index.navigateTo({
                      url: "/pages/my/my",
                      fail: () => {
                        common_vendor.index.showToast({
                          title: "请手动返回查看订单",
                          icon: "none"
                        });
                      }
                    });
                  }
                });
              } catch (error) {
                common_vendor.index.__f__("error", "at pages/booking/booking.vue:482", "跳转异常:", error);
                common_vendor.index.showToast({
                  title: "请手动返回查看订单",
                  icon: "none"
                });
              }
            }, 1500);
          } else {
            common_vendor.index.showLoading({
              title: "正在获取支付信息...",
              mask: true
            });
            try {
              const payResponse = await api_request.api.booking.getWechatPayParams(orderId);
              if (payResponse.code !== 200) {
                common_vendor.index.hideLoading();
                common_vendor.index.showToast({
                  title: payResponse.message || "获取支付信息失败",
                  icon: "none"
                });
                return;
              }
              const payParams = payResponse.data;
              const isMockMode = payParams.package && payParams.package.includes("MOCK_PREPAY_ID");
              common_vendor.index.requestPayment({
                provider: "wxpay",
                timeStamp: payParams.timeStamp,
                nonceStr: payParams.nonceStr,
                package: payParams.package,
                signType: payParams.signType || "RSA",
                paySign: payParams.paySign,
                success: (res) => {
                  common_vendor.index.__f__("log", "at pages/booking/booking.vue:523", "支付成功:", res);
                  common_vendor.index.hideLoading();
                  common_vendor.index.showToast({
                    title: "支付成功",
                    icon: "success",
                    duration: 2e3
                  });
                  setTimeout(() => {
                    try {
                      common_vendor.index.redirectTo({
                        url: "/pages/my/my",
                        fail: (err) => {
                          common_vendor.index.__f__("error", "at pages/booking/booking.vue:537", "跳转失败:", err);
                          common_vendor.index.navigateTo({
                            url: "/pages/my/my",
                            fail: () => {
                              common_vendor.index.showToast({
                                title: "请手动返回查看订单",
                                icon: "none"
                              });
                            }
                          });
                        }
                      });
                    } catch (error) {
                      common_vendor.index.__f__("error", "at pages/booking/booking.vue:552", "跳转异常:", error);
                      common_vendor.index.showToast({
                        title: "请手动返回查看订单",
                        icon: "none"
                      });
                    }
                  }, 2e3);
                },
                fail: (err) => {
                  common_vendor.index.__f__("error", "at pages/booking/booking.vue:561", "支付失败:", err);
                  common_vendor.index.hideLoading();
                  let errorMsg = "支付失败";
                  if (err.errMsg) {
                    if (err.errMsg.includes("cancel")) {
                      errorMsg = "支付已取消";
                    } else if (err.errMsg.includes("fail")) {
                      errorMsg = "支付失败，请重试";
                    } else {
                      errorMsg = err.errMsg;
                    }
                  }
                  if (isMockMode) {
                    common_vendor.index.showModal({
                      title: "Mock模式提示",
                      content: "当前为Mock模式，真实支付会失败。是否模拟支付成功？",
                      confirmText: "模拟成功",
                      cancelText: "取消",
                      success: (modalRes) => {
                        if (modalRes.confirm) {
                          this.handleMockBookingPaymentSuccess(orderId);
                        } else {
                          common_vendor.index.showToast({
                            title: "支付已取消",
                            icon: "none",
                            duration: 2e3
                          });
                        }
                      }
                    });
                  } else {
                    common_vendor.index.showToast({
                      title: errorMsg,
                      icon: "none",
                      duration: 2e3
                    });
                  }
                }
              });
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/booking/booking.vue:606", "获取支付信息失败:", error);
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "网络错误，请稍后重试",
                icon: "none"
              });
            }
          }
        } else {
          const errorMessage = response.message || "预约失败";
          if (errorMessage.includes("剩余次数已用完") || errorMessage.includes("续费") || errorMessage.includes("升级")) {
            common_vendor.index.showModal({
              title: "提示",
              content: errorMessage,
              showCancel: true,
              cancelText: "取消",
              confirmText: "去续费",
              success: (res) => {
                if (res.confirm) {
                  common_vendor.index.navigateTo({
                    url: "/pages/store/store"
                  });
                }
              }
            });
          } else {
            common_vendor.index.showToast({
              title: errorMessage,
              icon: "none",
              duration: 2e3
            });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/booking/booking.vue:642", "创建预约订单失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后重试",
          icon: "none"
        });
      }
    },
    async handleMockBookingPaymentSuccess(orderId) {
      common_vendor.index.showLoading({
        title: "模拟支付中...",
        mask: true
      });
      try {
        if (!orderId) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "订单信息缺失",
            icon: "none"
          });
          return;
        }
        const response = await api_request.api.booking.mockPaymentSuccess(orderId);
        if (response.code === 200) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "支付成功（Mock模式）",
            icon: "success",
            duration: 2e3
          });
          setTimeout(() => {
            try {
              common_vendor.index.redirectTo({
                url: "/pages/my/my",
                fail: (err) => {
                  common_vendor.index.__f__("error", "at pages/booking/booking.vue:683", "跳转失败:", err);
                  common_vendor.index.navigateTo({
                    url: "/pages/my/my",
                    fail: () => {
                      common_vendor.index.showToast({
                        title: "请手动返回查看订单",
                        icon: "none"
                      });
                    }
                  });
                }
              });
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/booking/booking.vue:698", "跳转异常:", error);
              common_vendor.index.showToast({
                title: "请手动返回查看订单",
                icon: "none"
              });
            }
          }, 2e3);
        } else {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: response.message || "模拟支付失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "模拟支付失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/booking/booking.vue:718", "模拟支付失败:", error);
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
        c: $options.isTimeSlotDisabled(index) ? 1 : "",
        d: $data.selectedTime === index
      }, $data.selectedTime === index ? {} : {}, {
        e: index,
        f: $data.selectedTime === index ? 1 : "",
        g: $options.isTimeSlotDisabled(index) ? 1 : "",
        h: common_vendor.o(($event) => $options.selectTime(index), index)
      });
    }),
    c: common_vendor.f($data.cabins, (cabin, index, i0) => {
      return {
        a: common_vendor.t(cabin.name),
        b: common_vendor.f(cabin.seats, (seat, sIndex, i1) => {
          return {
            a: common_vendor.t(seat),
            b: $data.selectedSeat === `${index}-${sIndex}` ? 1 : "",
            c: $options.isSeatDisabled(index, sIndex) ? 1 : "",
            d: sIndex,
            e: $data.selectedSeat === `${index}-${sIndex}` ? 1 : "",
            f: $options.isSeatDisabled(index, sIndex) ? 1 : "",
            g: common_vendor.o(($event) => $options.selectSeat(index, sIndex), sIndex)
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
