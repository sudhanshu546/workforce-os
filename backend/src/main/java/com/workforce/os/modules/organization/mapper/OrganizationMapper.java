package com.workforce.os.modules.organization.mapper;

import com.workforce.os.modules.organization.domain.Organization;
import com.workforce.os.modules.organization.dto.OrganizationDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {
    OrganizationDTO toDTO(Organization organization);
}
