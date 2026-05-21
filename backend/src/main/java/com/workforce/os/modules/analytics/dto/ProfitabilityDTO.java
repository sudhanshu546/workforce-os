package com.workforce.os.modules.analytics.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class ProfitabilityDTO {
    private Long workOrderId;
    private String customerName;
    private Double revenue;
    private Double materialCost;
    private Double estimatedLaborCost;
    private Double netProfit;
    private Double profitMargin;
}
