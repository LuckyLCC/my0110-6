package com.oxygen.capsule.entity.converter;

import com.oxygen.capsule.entity.enums.PaymentOrdersCardStatusEnum;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class CardStatusConverter implements AttributeConverter<PaymentOrdersCardStatusEnum, String> {
    @Override
    public String convertToDatabaseColumn(PaymentOrdersCardStatusEnum attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public PaymentOrdersCardStatusEnum convertToEntityAttribute(String dbData) {
        PaymentOrdersCardStatusEnum parsed = PaymentOrdersCardStatusEnum.fromDb(dbData);
        // 兼容历史空值/异常值：返回 null 让上层决定兜底
        return parsed;
    }
}

