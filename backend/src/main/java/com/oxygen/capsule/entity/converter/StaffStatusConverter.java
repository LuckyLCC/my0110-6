package com.oxygen.capsule.entity.converter;

import com.oxygen.capsule.entity.enums.StaffsStatusEnum;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class StaffStatusConverter implements AttributeConverter<StaffsStatusEnum, String> {
    @Override
    public String convertToDatabaseColumn(StaffsStatusEnum attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public StaffsStatusEnum convertToEntityAttribute(String dbData) {
        return StaffsStatusEnum.fromDb(dbData);
    }
}

