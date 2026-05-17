package com.workforce.os.modules.inventory.dto;

import lombok.Data;

@Data
public class MaterialDTO {
    private Long id;
    private String name;
    private String description;
    private String sku;
    private Double quantity;
    private String unit;
    private Double minQuantity;
    private Double unitPrice;
    private Double totalValue;
}
