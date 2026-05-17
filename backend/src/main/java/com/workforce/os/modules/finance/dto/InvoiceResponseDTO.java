package com.workforce.os.modules.finance.dto;

import lombok.Data;
import java.util.List;

@Data
public class InvoiceResponseDTO {
    private Long id;
    private String invoiceNumber;
    private Long workOrderId;
    private Double subtotal;
    private Double tax;
    private Double total;
    private String status;
    private List<InvoiceItemDTO> items;
    private WorkOrderDTO workOrder;
    private java.time.LocalDateTime createdAt;

    @Data
    public static class WorkOrderDTO {
        private Long id;
        private CustomerDTO customer;
        private QuotationDTO quotation;
        private List<MaterialDTO> materials;
    }

    @Data
    public static class CustomerDTO {
        private Long id;
        private String name;
        private String email;
    }

    @Data
    public static class QuotationDTO {
        private List<QuoteItemDTO> items;
    }

    @Data
    public static class QuoteItemDTO {
        private String description;
        private Double quantity;
        private Double unitPrice;
    }

    @Data
    public static class MaterialDTO {
        private String materialName;
        private Double quantityUsed;
        private Double unitPriceAtUse;
        private MaterialInfoDTO material;
    }

    @Data
    public static class MaterialInfoDTO {
        private String name;
        private String unit;
    }

    @Data
    public static class InvoiceItemDTO {
        private String description;
        private Double quantity;
        private Double unitPrice;
        private Double totalAmount;
        private String type;
    }
}
