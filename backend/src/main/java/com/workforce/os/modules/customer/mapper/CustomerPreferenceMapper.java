package com.workforce.os.modules.customer.mapper;

import com.workforce.os.modules.customer.domain.CustomerPreference;
import com.workforce.os.modules.customer.dto.CustomerPreferenceResponse;
import com.workforce.os.modules.customer.dto.CustomerPreferenceUpdateRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerPreferenceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    CustomerPreference toCustomerPreference(CustomerPreferenceUpdateRequest request);

    CustomerPreferenceResponse toCustomerPreferenceResponse(CustomerPreference preference);
}
