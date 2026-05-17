package com.workforce.os.modules.finance.dto;

import lombok.Data;

@Data
public class PaymentResponseDTO {
    private Long id;
    private Long invoiceId;
    private Double amount;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionReference;
}
