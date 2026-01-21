package com.oxygen.capsule.entity.enums;

/**
 * 支付状态（写库建议使用大写）。
 */
public enum BookingOrdersPaymentStatusEnum {
    UNPAID("UNPAID", "未支付"),
    PAID("PAID", "已支付");

    private final String code; // 写库/传输值：英文
    private final String descZh; // 便于观察：中文说明

    BookingOrdersPaymentStatusEnum(String code, String descZh) {
        this.code = code;
        this.descZh = descZh;
    }

    public String getCode() {
        return code;
    }

    public String getDescZh() {
        return descZh;
    }

    public static BookingOrdersPaymentStatusEnum fromDb(String value) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.trim().toUpperCase();
        for (BookingOrdersPaymentStatusEnum e : values()) {
            if (e.code.equals(normalized)) return e;
        }
        return null;
    }

    @Override
    public String toString() {
        return code + "(" + descZh + ")";
    }
}
