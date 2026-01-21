package com.oxygen.capsule.entity.enums;

/**
 * 会员卡状态（写库必须为英文枚举值）。
 */
public enum PaymentOrdersCardStatusEnum {
    INACTIVE("INACTIVE", "未生效"),
    ACTIVE("ACTIVE", "生效中"),
    COMPLETED("COMPLETED", "已完成");

    private final String code; // 写库/传输值：英文
    private final String descZh; // 便于观察：中文说明

    PaymentOrdersCardStatusEnum(String code, String descZh) {
        this.code = code;
        this.descZh = descZh;
    }

    public String getCode() {
        return code;
    }

    public String getDescZh() {
        return descZh;
    }

    public static PaymentOrdersCardStatusEnum fromDb(String value) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.trim().toUpperCase();
        for (PaymentOrdersCardStatusEnum e : values()) {
            if (e.code.equals(normalized)) return e;
        }
        return null;
    }

    @Override
    public String toString() {
        return code + "(" + descZh + ")";
    }
}
