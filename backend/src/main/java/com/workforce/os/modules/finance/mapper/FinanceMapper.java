package com.workforce.os.modules.finance.mapper;

import com.workforce.os.modules.finance.domain.Invoice;
import com.workforce.os.modules.finance.domain.InvoiceItem;
import com.workforce.os.modules.finance.domain.Payment;
import com.workforce.os.modules.finance.dto.InvoiceResponseDTO;
import com.workforce.os.modules.finance.dto.PaymentResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FinanceMapper {
    @Mapping(source = "workOrder.id", target = "workOrderId")
    @Mapping(source = "workOrder", target = "workOrder")
    InvoiceResponseDTO toInvoiceDTO(Invoice invoice);

    InvoiceResponseDTO.InvoiceItemDTO toInvoiceItemDTO(InvoiceItem item);

    @Mapping(source = "invoice.id", target = "invoiceId")
    @Mapping(source = "invoice.invoiceNumber", target = "invoiceNumber")
    @Mapping(source = "invoice.customer.name", target = "customerName")
    @Mapping(source = "collectedByWorker.user.name", target = "collectedByWorkerName")
    PaymentResponseDTO toPaymentDTO(Payment payment);

    @Mapping(source = "customer", target = "customer")
    @Mapping(source = "quotation", target = "quotation")
    @Mapping(source = "materials", target = "materials")
    InvoiceResponseDTO.WorkOrderDTO toWorkOrderDTO(com.workforce.os.modules.operations.domain.WorkOrder workOrder);

    InvoiceResponseDTO.CustomerDTO toCustomerDTO(com.workforce.os.modules.customer.domain.Customer customer);

    InvoiceResponseDTO.QuotationDTO toQuotationDTO(com.workforce.os.modules.sales.domain.Quotation quotation);

    @Mapping(source = "material.name", target = "materialName")
    @Mapping(source = "material", target = "material")
    InvoiceResponseDTO.MaterialDTO toMaterialDTO(com.workforce.os.modules.operations.domain.WorkOrderMaterial material);

    InvoiceResponseDTO.MaterialInfoDTO toMaterialInfoDTO(com.workforce.os.modules.inventory.domain.Material material);

    @Mapping(source = "workOrder.id", target = "workOrderId")
    @Mapping(source = "worker.id", target = "workerId")
    @Mapping(source = "worker.user.name", target = "workerName")
    com.workforce.os.modules.finance.dto.ExpenseResponseDTO toExpenseDTO(com.workforce.os.modules.finance.domain.Expense expense);

    @Mapping(source = "worker.user.name", target = "workerName")
    @Mapping(source = "worker.designation", target = "workerDesignation")
    com.workforce.os.modules.finance.dto.PayrollRecordDTO toPayrollDTO(com.workforce.os.modules.finance.domain.PayrollRecord payrollRecord);
}
