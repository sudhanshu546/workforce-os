package com.workforce.os.modules.customer.dto;

import lombok.Data;

@Data
public class CustomerProfileResponse {
    private String name;
    private String email;
    private String phone;
    private String role;
}
