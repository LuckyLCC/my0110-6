package com.oxygen.capsule.entity.enums;

public enum PaymentOrdersTransactionTypeEnum {
    NEW("NEW", "新开卡"),
    RENEW("RENEW", "续费");

    private final String code; // 写库/传输值：英文
    private final String descZh; // 便于观察：中文说明

    PaymentOrdersTransactionTypeEnum(String code, String descZh) {
        this.code = code;
        this.descZh = descZh;
    }

    public String getCode() {
        return code;
    }

    public String getDescZh() {
        return descZh;
    }

    public static PaymentOrdersTransactionTypeEnum fromDb(String value) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.trim().toUpperCase();
        for (PaymentOrdersTransactionTypeEnum e : values()) {
            if (e.code.equals(normalized)) return e;
        }
        return null;
    }

    @Override
    public String toString() {
        return code + "(" + descZh + ")";
    }
}
