package com.oxygen.capsule.entity.converter;

import com.oxygen.capsule.entity.enums.BookingOrdersStatusEnum;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class BookingStatusConverter implements AttributeConverter<BookingOrdersStatusEnum, String> {
    @Override
    public String convertToDatabaseColumn(BookingOrdersStatusEnum attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public BookingOrdersStatusEnum convertToEntityAttribute(String dbData) {
        return BookingOrdersStatusEnum.fromDb(dbData);
    }
}

