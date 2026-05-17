package com.workforce.os.modules.organization.dto;

import lombok.Data;

@Data
public class OrganizationDTO {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String contactNumber;
    private String tenantId;
}
