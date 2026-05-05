package com.workforce.os.modules.customer.mapper;

import com.workforce.os.modules.customer.domain.CustomerProfile;
import com.workforce.os.modules.customer.dto.CustomerProfileResponse;
import com.workforce.os.modules.customer.dto.CustomerProfileUpdateRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerProfileMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    CustomerProfile toCustomerProfile(CustomerProfileUpdateRequest request);

    CustomerProfileResponse toCustomerProfileResponse(CustomerProfile profile);
}
