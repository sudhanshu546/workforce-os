package com.workforce.os.modules.finance.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentResponseDTO {
    private Long id;
    private Long invoiceId;
    private String invoiceNumber;
    private String customerName;
    private Double amount;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionReference;
    private String collectedByWorkerName;
    private LocalDateTime createdAt;
}
