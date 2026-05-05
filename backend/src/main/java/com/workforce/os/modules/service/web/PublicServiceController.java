package com.workforce.os.modules.service.web;

import com.workforce.os.modules.service.domain.ServiceItem;
import com.workforce.os.modules.service.repository.ServiceItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/services")
@RequiredArgsConstructor
public class PublicServiceController {

    private final ServiceItemRepository serviceItemRepository;

    @GetMapping("/organization/{tenantId}")
    public ResponseEntity<List<ServiceItem>> getServicesByOrganization(@PathVariable String tenantId) {
        return ResponseEntity.ok(serviceItemRepository.findAllByTenantId(tenantId));
    }
}
