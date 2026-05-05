package com.workforce.os.modules.customer.dto;

import lombok.Data;

@Data
public class CustomerAddressResponse {
    private Long id;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private boolean isDefault;
}
