// 前端枚举约束与规范化（与后端枚举保持一致）

export const UserRole = Object.freeze({
  USER: 'USER',
  STAFF: 'STAFF'
})

export const PaymentOrderStatus = Object.freeze({
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
})

export const PaymentOrderStatusLabelZh = Object.freeze({
  [PaymentOrderStatus.UNPAID]: '未支付',
  [PaymentOrderStatus.PAID]: '已支付',
  [PaymentOrderStatus.CANCELLED]: '已取消'
})

export const TransactionType = Object.freeze({
  NEW: 'NEW',
  RENEW: 'RENEW'
})

export const TransactionTypeLabelZh = Object.freeze({
  [TransactionType.NEW]: '新开卡',
  [TransactionType.RENEW]: '续费'
})

// 会员卡状态（与后端 CardStatus 保持一致，英文值）
export const CardStatus = Object.freeze({
  INACTIVE: 'INACTIVE', // 未生效
  ACTIVE: 'ACTIVE', // 生效中
  COMPLETED: 'COMPLETED' // 已完成
})

export const CardStatusLabelZh = Object.freeze({
  [CardStatus.INACTIVE]: '未生效',
  [CardStatus.ACTIVE]: '生效中',
  [CardStatus.COMPLETED]: '已完成'
})

export const BookingStatus = Object.freeze({
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
})

export const BookingStatusLabelZh = Object.freeze({
  [BookingStatus.PENDING]: '待核销',
  [BookingStatus.COMPLETED]: '已完成',
  [BookingStatus.CANCELLED]: '已取消',
  [BookingStatus.NO_SHOW]: '未到店'
})

export const PaymentStatus = Object.freeze({
  UNPAID: 'UNPAID',
  PAID: 'PAID'
})

export const PaymentStatusLabelZh = Object.freeze({
  [PaymentStatus.UNPAID]: '未支付',
  [PaymentStatus.PAID]: '已支付'
})

function toUpperSafe(v) {
  if (v === null || v === undefined) return ''
  return String(v).trim().toUpperCase()
}

/**
 * 规范化并校验枚举值。
 * - 接受后端返回的大小写混合/历史小写
 * - 不在允许值内则 warn，并返回 defaultValue
 */
export function normalizeEnum(value, allowedValues, { field, defaultValue = null } = {}) {
  const upper = toUpperSafe(value)
  if (!upper) return defaultValue
  if (allowedValues.includes(upper)) return upper
  // eslint-disable-next-line no-console
  console.warn(`[enum] 非法枚举值: ${field || ''}`, value, 'allowed=', allowedValues)
  return defaultValue
}

export function normalizeRoleToLower(value) {
  const upper = normalizeEnum(value, Object.values(UserRole), { field: 'role', defaultValue: UserRole.USER })
  return upper === UserRole.STAFF ? 'staff' : 'user'
}

