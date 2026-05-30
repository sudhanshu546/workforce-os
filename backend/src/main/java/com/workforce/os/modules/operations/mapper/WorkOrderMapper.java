package com.workforce.os.modules.operations.mapper;

import com.workforce.os.modules.operations.domain.*;
import com.workforce.os.modules.operations.dto.WorkOrderAuditDTO;
import com.workforce.os.modules.operations.dto.WorkOrderResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WorkOrderMapper {

    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "customer.name", target = "customerName")
    @Mapping(source = "customer.phone", target = "customerPhone")
    @Mapping(source = "customer", target = "customer")
    @Mapping(source = "assignedWorker.id", target = "assignedWorkerId")
    @Mapping(source = "assignedWorker.user.name", target = "assignedWorkerName")
    @Mapping(target = "organizationName", ignore = true)
    @Mapping(target = "serviceName", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "customerAddress", ignore = true)
    @Mapping(source = "quotation", target = "quotation")
    WorkOrderResponseDTO toDTO(WorkOrder workOrder);

    @Mapping(source = "workOrder.id", target = "workOrderId")
    WorkOrderAuditDTO toAuditDTO(WorkOrderAudit audit);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "phone", target = "phone")
    WorkOrderResponseDTO.CustomerDTO toCustomerDTO(com.workforce.os.modules.customer.domain.Customer customer);

    WorkOrderResponseDTO.TaskDTO toTaskDTO(WorkOrderTask task);

    WorkOrderResponseDTO.EvidenceDTO toEvidenceDTO(WorkOrderEvidence evidence);

    @Mapping(source = "material.name", target = "materialName")
    @Mapping(source = "material.unit", target = "unit")
    @Mapping(source = "unitPriceAtUse", target = "unitPriceAtUse")
    WorkOrderResponseDTO.MaterialDTO toMaterialDTO(WorkOrderMaterial material);

    WorkOrderResponseDTO.QuotationDTO toQuotationDTO(com.workforce.os.modules.sales.domain.Quotation quotation);

    WorkOrderResponseDTO.QuotationItemDTO toQuotationItemDTO(com.workforce.os.modules.sales.domain.QuotationItem item);
}
