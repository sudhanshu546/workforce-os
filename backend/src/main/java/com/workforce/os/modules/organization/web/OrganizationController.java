package com.workforce.os.modules.organization.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.organization.domain.Organization;
import com.workforce.os.modules.organization.service.OrganizationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/organization")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/branding")
    public ResponseEntity<ApiResponse<Organization>> getBranding() {
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.getBranding(tenantId),
            "Branding settings retrieved"
        ));
    }

    @PatchMapping("/branding")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Organization>> updateBranding(@RequestBody BrandingRequest request) {
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(ApiResponse.success(
            organizationService.updateBranding(tenantId, request.getLogoUrl(), request.getPrimaryColor(), request.getSecondaryColor()),
            "Branding settings updated"
        ));
    }

    @Data
    public static class BrandingRequest {
        private String logoUrl;
        private String primaryColor;
        private String secondaryColor;
    }
}
