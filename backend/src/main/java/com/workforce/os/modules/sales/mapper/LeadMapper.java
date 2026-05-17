package com.workforce.os.modules.sales.mapper;

import com.workforce.os.modules.sales.domain.Lead;
import com.workforce.os.modules.sales.dto.LeadResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LeadMapper {
    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "customer.name", target = "customerName")
    @Mapping(source = "customer.phone", target = "customerPhone")
    @Mapping(source = "organization.id", target = "organizationId")
    @Mapping(source = "organization.businessName", target = "organizationName")
    @Mapping(source = "requestedService.id", target = "serviceItemId")
    @Mapping(source = "requestedService.name", target = "serviceItemName")
    @Mapping(source = "customer", target = "customer")
    @Mapping(source = "organization", target = "organization")
    @Mapping(source = "requestedService", target = "requestedService")
    LeadResponseDTO toDTO(Lead lead);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "phone", target = "phone")
    LeadResponseDTO.CustomerDTO toCustomerDTO(com.workforce.os.modules.customer.domain.Customer customer);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "businessName", target = "businessName")
    LeadResponseDTO.OrganizationDTO toOrganizationDTO(com.workforce.os.modules.organization.domain.Organization organization);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    LeadResponseDTO.ServiceDTO toServiceDTO(com.workforce.os.modules.service.domain.ServiceItem serviceItem);
}
