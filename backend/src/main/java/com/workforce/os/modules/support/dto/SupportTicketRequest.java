package com.workforce.os.modules.support.dto;

import lombok.Data;

@Data
public class SupportTicketRequest {
    private String title;
    private String description;
    private Long workOrderId;
    private String attachmentUrl;
}
