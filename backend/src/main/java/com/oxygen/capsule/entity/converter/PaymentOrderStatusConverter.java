package com.oxygen.capsule.entity.converter;

import com.oxygen.capsule.entity.enums.PaymentOrdersStatusEnum;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class PaymentOrderStatusConverter implements AttributeConverter<PaymentOrdersStatusEnum, String> {
    @Override
    public String convertToDatabaseColumn(PaymentOrdersStatusEnum attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public PaymentOrdersStatusEnum convertToEntityAttribute(String dbData) {
        return PaymentOrdersStatusEnum.fromDb(dbData);
    }
}

