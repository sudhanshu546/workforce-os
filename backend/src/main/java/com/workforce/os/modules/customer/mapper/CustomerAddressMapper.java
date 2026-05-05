package com.workforce.os.modules.customer.mapper;

import com.workforce.os.modules.customer.domain.CustomerAddress;
import com.workforce.os.modules.customer.dto.CustomerAddressRequest;
import com.workforce.os.modules.customer.dto.CustomerAddressResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerAddressMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    CustomerAddress toCustomerAddress(CustomerAddressRequest request);

    CustomerAddressResponse toCustomerAddressResponse(CustomerAddress address);
}
