package com.workforce.os.modules.workforce.mapper;

import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.domain.WorkerSkill;
import com.workforce.os.modules.workforce.dto.WorkerProfileDTO;
import com.workforce.os.modules.workforce.dto.WorkerSkillDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WorkerMapper {

    @Mapping(source = "user.name", target = "name")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.phone", target = "phone")
    @Mapping(source = "supportedServices", target = "supportedServices")
    WorkerProfileDTO toDTO(WorkerProfile profile);

    WorkerSkillDTO toSkillDTO(WorkerSkill skill);

    com.workforce.os.modules.service.dto.ServiceItemDTO toServiceDTO(com.workforce.os.modules.service.domain.ServiceItem serviceItem);
}
