package com.workforce.os.modules.customer.dto;

import lombok.Data;

@Data
public class CustomerAddressRequest {
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private Double latitude;
    private Double longitude;
    private boolean isDefault;
}
