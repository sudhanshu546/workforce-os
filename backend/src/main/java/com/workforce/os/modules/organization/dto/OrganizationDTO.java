package com.workforce.os.modules.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationDTO {
    private Long id;
    private String businessName;
    private String businessType;
    private String registrationNumber;
    private String taxNumber;
    private String logoUrl;
    private String primaryColor;
    private String secondaryColor;
    private String status;
    private String tenantId;
}
