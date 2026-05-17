package com.workforce.os.modules.service.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.service.dto.ServiceItemDTO;
import com.workforce.os.modules.service.service.ServiceCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/services")
@RequiredArgsConstructor
public class PublicServiceController {

    private final ServiceCatalogService serviceCatalogService;

    @GetMapping("/organization/{tenantId}")
    public ResponseEntity<ApiResponse<List<ServiceItemDTO>>> getServicesByOrganization(@PathVariable String tenantId) {
        List<ServiceItemDTO> dtos = serviceCatalogService.getAllItemsByTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success(dtos, "Services retrieved successfully"));
    }
}
