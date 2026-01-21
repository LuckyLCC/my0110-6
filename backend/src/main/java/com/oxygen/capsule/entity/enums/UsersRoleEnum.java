package com.oxygen.capsule.entity.enums;

public enum UsersRoleEnum {
    USER("USER", "普通用户"),
    STAFF("STAFF", "商家");

    private final String code; // 写库/传输值：英文
    private final String descZh; // 便于观察：中文说明

    UsersRoleEnum(String code, String descZh) {
        this.code = code;
        this.descZh = descZh;
    }

    public String getCode() {
        return code;
    }

    public String getDescZh() {
        return descZh;
    }

    public static UsersRoleEnum fromDb(String value) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.trim().toUpperCase();
        for (UsersRoleEnum e : values()) {
            if (e.code.equals(normalized)) return e;
        }
        return null;
    }

    @Override
    public String toString() {
        return code + "(" + descZh + ")";
    }
}
