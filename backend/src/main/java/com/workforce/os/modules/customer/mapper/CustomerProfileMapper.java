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

    @Mapping(source = "customer.email", target = "email")
    @Mapping(source = "customer.phone", target = "phone")
    @Mapping(target = "role", constant = "CUSTOMER")
    CustomerProfileResponse toCustomerProfileResponse(CustomerProfile profile);

    @org.mapstruct.BeanMapping(nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
    void updateProfileFromRequest(CustomerProfileUpdateRequest request, @org.mapstruct.MappingTarget CustomerProfile profile);
}
