package com.oxygen.capsule.entity.converter;

import com.oxygen.capsule.entity.enums.UsersRoleEnum;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class UserRoleConverter implements AttributeConverter<UsersRoleEnum, String> {
    @Override
    public String convertToDatabaseColumn(UsersRoleEnum attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public UsersRoleEnum convertToEntityAttribute(String dbData) {
        return UsersRoleEnum.fromDb(dbData);
    }
}

