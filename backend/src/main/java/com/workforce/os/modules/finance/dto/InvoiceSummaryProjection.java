package com.workforce.os.modules.finance.dto;

public interface InvoiceSummaryProjection {
    Long getId();
    String getInvoiceNumber();
    Double getTotal();
    String getStatus();
    String getCustomerName();
}
