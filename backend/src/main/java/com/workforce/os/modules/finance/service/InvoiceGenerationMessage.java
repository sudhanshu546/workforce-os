package com.workforce.os.modules.finance.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceGenerationMessage implements Serializable {
    private Long workOrderId;
    private String tenantId;
}
