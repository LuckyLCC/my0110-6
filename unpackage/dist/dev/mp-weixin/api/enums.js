"use strict";
const common_vendor = require("../common/vendor.js");
const UserRole = Object.freeze({
  USER: "USER",
  STAFF: "STAFF"
});
const PaymentOrderStatus = Object.freeze({
  UNPAID: "UNPAID",
  PAID: "PAID",
  CANCELLED: "CANCELLED"
});
Object.freeze({
  [PaymentOrderStatus.UNPAID]: "未支付",
  [PaymentOrderStatus.PAID]: "已支付",
  [PaymentOrderStatus.CANCELLED]: "已取消"
});
const TransactionType = Object.freeze({
  NEW: "NEW",
  RENEW: "RENEW"
});
const TransactionTypeLabelZh = Object.freeze({
  [TransactionType.NEW]: "新开卡",
  [TransactionType.RENEW]: "续费"
});
const CardStatus = Object.freeze({
  INACTIVE: "INACTIVE",
  // 未生效
  ACTIVE: "ACTIVE",
  // 生效中
  COMPLETED: "COMPLETED"
  // 已完成
});
const CardStatusLabelZh = Object.freeze({
  [CardStatus.INACTIVE]: "未生效",
  [CardStatus.ACTIVE]: "生效中",
  [CardStatus.COMPLETED]: "已完成"
});
const BookingStatus = Object.freeze({
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW"
});
const BookingStatusLabelZh = Object.freeze({
  [BookingStatus.PENDING]: "待核销",
  [BookingStatus.COMPLETED]: "已完成",
  [BookingStatus.CANCELLED]: "已取消",
  [BookingStatus.NO_SHOW]: "未到店"
});
const PaymentStatus = Object.freeze({
  UNPAID: "UNPAID",
  PAID: "PAID"
});
Object.freeze({
  [PaymentStatus.UNPAID]: "未支付",
  [PaymentStatus.PAID]: "已支付"
});
function toUpperSafe(v) {
  if (v === null || v === void 0)
    return "";
  return String(v).trim().toUpperCase();
}
function normalizeEnum(value, allowedValues, { field, defaultValue = null } = {}) {
  const upper = toUpperSafe(value);
  if (!upper)
    return defaultValue;
  if (allowedValues.includes(upper))
    return upper;
  common_vendor.index.__f__("warn", "at api/enums.js:82", `[enum] 非法枚举值: ${field || ""}`, value, "allowed=", allowedValues);
  return defaultValue;
}
function normalizeRoleToLower(value) {
  const upper = normalizeEnum(value, Object.values(UserRole), { field: "role", defaultValue: UserRole.USER });
  return upper === UserRole.STAFF ? "staff" : "user";
}
exports.BookingStatus = BookingStatus;
exports.BookingStatusLabelZh = BookingStatusLabelZh;
exports.CardStatus = CardStatus;
exports.CardStatusLabelZh = CardStatusLabelZh;
exports.PaymentOrderStatus = PaymentOrderStatus;
exports.PaymentStatus = PaymentStatus;
exports.TransactionType = TransactionType;
exports.TransactionTypeLabelZh = TransactionTypeLabelZh;
exports.normalizeEnum = normalizeEnum;
exports.normalizeRoleToLower = normalizeRoleToLower;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/enums.js.map
