package com.oxygen.capsule.entity.enums;

/**
 * 预约订单状态（写库建议使用大写）。
 */
public enum BookingOrdersStatusEnum {
    PENDING("PENDING", "待核销"),
    COMPLETED("COMPLETED", "已完成"),
    CANCELLED("CANCELLED", "已取消"),
    NO_SHOW("NO_SHOW", "未到店");

    private final String code; // 写库/传输值：英文
    private final String descZh; // 便于观察：中文说明

    BookingOrdersStatusEnum(String code, String descZh) {
        this.code = code;
        this.descZh = descZh;
    }

    public String getCode() {
        return code;
    }

    public String getDescZh() {
        return descZh;
    }

    public static BookingOrdersStatusEnum fromDb(String value) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.trim().toUpperCase();
        for (BookingOrdersStatusEnum e : values()) {
            if (e.code.equals(normalized)) return e;
        }
        return null;
    }

    @Override
    public String toString() {
        return code + "(" + descZh + ")";
    }
}
