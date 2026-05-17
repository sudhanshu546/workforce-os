package com.workforce.os.modules.service.mapper;

import com.workforce.os.modules.service.domain.ServiceCategory;
import com.workforce.os.modules.service.domain.ServiceItem;
import com.workforce.os.modules.service.dto.ServiceCategoryDTO;
import com.workforce.os.modules.service.dto.ServiceItemDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ServiceMapper {
    ServiceCategoryDTO toCategoryDTO(ServiceCategory category);
    
    @Mapping(source = "category.id", target = "categoryId")
    ServiceItemDTO toItemDTO(ServiceItem item);
}
