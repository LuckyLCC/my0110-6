package com.oxygen.capsule.entity.enums;

public enum InvitationsStatusEnum {
    PENDING("PENDING", "待接受"),
    ACCEPTED("ACCEPTED", "已接受"),
    EXPIRED("EXPIRED", "已过期");

    private final String code; // 写库/传输值：英文
    private final String descZh; // 便于观察：中文说明

    InvitationsStatusEnum(String code, String descZh) {
        this.code = code;
        this.descZh = descZh;
    }

    public String getCode() {
        return code;
    }

    public String getDescZh() {
        return descZh;
    }

    public static InvitationsStatusEnum fromDb(String value) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.trim().toUpperCase();
        for (InvitationsStatusEnum e : values()) {
            if (e.code.equals(normalized)) return e;
        }
        return null;
    }

    @Override
    public String toString() {
        return code + "(" + descZh + ")";
    }
}
