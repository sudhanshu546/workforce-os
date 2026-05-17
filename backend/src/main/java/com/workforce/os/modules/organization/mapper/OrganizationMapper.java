package com.workforce.os.modules.organization.mapper;

import com.workforce.os.modules.organization.domain.Organization;
import com.workforce.os.modules.organization.dto.OrganizationDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {
    @Mapping(source = "businessName", target = "name")
    @Mapping(source = "tenantId", target = "tenantId")
    OrganizationDTO toDTO(Organization organization);
}
