package com.oxygen.capsule.entity;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * 入库前统一处理：若字符串值为“全英文(仅 A-Z/a-z)”，则转为大写写入数据库。
 */
public class EnglishUppercaseEntityListener {
    private static final Pattern ALL_ENGLISH = Pattern.compile("^[A-Za-z]+$");

    @PrePersist
    @PreUpdate
    public void uppercaseEnglishStrings(Object entity) {
        if (entity == null) return;

        Class<?> clazz = entity.getClass();
        while (clazz != null && clazz != Object.class) {
            Field[] fields = clazz.getDeclaredFields();
            for (Field field : fields) {
                if (field.getType() != String.class) continue;
                int mod = field.getModifiers();
                if (Modifier.isStatic(mod) || Modifier.isFinal(mod)) continue;

                field.setAccessible(true);
                try {
                    String value = (String) field.get(entity);
                    if (value == null || value.isEmpty()) continue;
                    if (!ALL_ENGLISH.matcher(value).matches()) continue;

                    String upper = value.toUpperCase(Locale.ROOT);
                    if (!upper.equals(value)) {
                        field.set(entity, upper);
                    }
                } catch (IllegalAccessException ignored) {
                    // best-effort：不影响正常入库流程
                }
            }
            clazz = clazz.getSuperclass();
        }
    }
}

