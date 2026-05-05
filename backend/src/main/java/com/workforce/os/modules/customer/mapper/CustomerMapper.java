package com.workforce.os.modules.customer.mapper;

import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.domain.CustomerProfile;
import com.workforce.os.modules.customer.dto.CustomerRegisterRequest;
import com.workforce.os.modules.customer.dto.CustomerResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    Customer toCustomer(CustomerRegisterRequest request);

    @Mapping(source = "profile.name", target = "name")
    @Mapping(source = "customer.email", target = "email")
    @Mapping(source = "customer.phone", target = "phone")
    @Mapping(source = "customer.status", target = "status")
    @Mapping(source = "customer.createdAt", target = "createdAt")
    @Mapping(source = "customer.updatedAt", target = "updatedAt")
    @Mapping(source = "customer.tenantId", target = "tenantId")
    @Mapping(source = "customer.id", target = "id")
    CustomerResponse toCustomerResponse(Customer customer, CustomerProfile profile);
}
