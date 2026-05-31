package com.workforce.os.modules.organization.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.organization.dto.OrganizationDTO;
import com.workforce.os.modules.organization.mapper.OrganizationMapper;
import com.workforce.os.modules.organization.service.OrganizationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/organization")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;
    private final OrganizationMapper organizationMapper;

    @GetMapping("/branding")
    public ResponseEntity<ApiResponse<OrganizationDTO>> getBranding() {
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(ApiResponse.success(
            organizationMapper.toDTO(organizationService.getBranding(tenantId)),
            BRANDING_RETRIEVED
        ));
    }

    @PatchMapping("/branding")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<OrganizationDTO>> updateBranding(@RequestBody BrandingRequest request) {
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(ApiResponse.success(
            organizationMapper.toDTO(organizationService.updateBranding(tenantId, request.getLogoUrl(), request.getPrimaryColor(), request.getSecondaryColor())),
            BRANDING_UPDATED
        ));
    }

    @Data
    public static class BrandingRequest {
        private String logoUrl;
        private String primaryColor;
        private String secondaryColor;
    }
}
