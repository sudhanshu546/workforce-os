package com.workforce.os.modules.customer.dto;

import lombok.Data;

@Data
public class CustomerPreferenceUpdateRequest {
    private boolean receiveEmailNotifications;
    private String preferredContactMethod;
}
