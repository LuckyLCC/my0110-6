package com.oxygen.capsule.entity.converter;

import com.oxygen.capsule.entity.enums.PaymentOrdersTransactionTypeEnum;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class TransactionTypeConverter implements AttributeConverter<PaymentOrdersTransactionTypeEnum, String> {
    @Override
    public String convertToDatabaseColumn(PaymentOrdersTransactionTypeEnum attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public PaymentOrdersTransactionTypeEnum convertToEntityAttribute(String dbData) {
        return PaymentOrdersTransactionTypeEnum.fromDb(dbData);
    }
}

