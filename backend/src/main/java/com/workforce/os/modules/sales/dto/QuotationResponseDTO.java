package com.workforce.os.modules.sales.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuotationResponseDTO {
    private Long id;
    private Long leadId;
    private com.workforce.os.modules.sales.dto.LeadResponseDTO lead;
    private Double subtotal;
    private Double tax;
    private Double discount;
    private Double total;
    private String status;
    private List<QuotationItemDTO> items;

    @Data
    public static class QuotationItemDTO {
        private String description;
        private Integer quantity;
        private Double unitPrice;
        private Double totalAmount;
    }
}
