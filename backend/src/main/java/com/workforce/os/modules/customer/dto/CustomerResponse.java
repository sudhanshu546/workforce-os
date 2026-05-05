package com.workforce.os.modules.customer.dto;

import com.workforce.os.modules.customer.domain.Customer;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CustomerResponse {
    private Long id;
    private String email;
    private String phone;
    private String name;
    private Customer.CustomerStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String tenantId;
}
