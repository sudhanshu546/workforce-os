package com.workforce.os.modules.customer.dto;

import lombok.Data;

@Data
public class CustomerProfileResponse {
    private String name;
    private String email;
    private String number;
    private String role;
}
