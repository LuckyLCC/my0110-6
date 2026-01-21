package com.oxygen.capsule.entity.converter;

import com.oxygen.capsule.entity.enums.BookingOrdersPaymentStatusEnum;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class PaymentStatusConverter implements AttributeConverter<BookingOrdersPaymentStatusEnum, String> {
    @Override
    public String convertToDatabaseColumn(BookingOrdersPaymentStatusEnum attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public BookingOrdersPaymentStatusEnum convertToEntityAttribute(String dbData) {
        return BookingOrdersPaymentStatusEnum.fromDb(dbData);
    }
}

