package com.workforce.os.modules.customer.dto;

import lombok.Data;

@Data
public class CustomerPreferenceResponse {
    private boolean receiveEmailNotifications;
    private String preferredContactMethod;
}
