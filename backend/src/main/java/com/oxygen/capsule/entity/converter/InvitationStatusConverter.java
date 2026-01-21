package com.oxygen.capsule.entity.converter;

import com.oxygen.capsule.entity.enums.InvitationsStatusEnum;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class InvitationStatusConverter implements AttributeConverter<InvitationsStatusEnum, String> {
    @Override
    public String convertToDatabaseColumn(InvitationsStatusEnum attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public InvitationsStatusEnum convertToEntityAttribute(String dbData) {
        return InvitationsStatusEnum.fromDb(dbData);
    }
}

