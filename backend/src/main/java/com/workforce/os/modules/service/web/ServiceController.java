package com.workforce.os.modules.service.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.service.domain.ServiceCategory;
import com.workforce.os.modules.service.domain.ServiceItem;
import com.workforce.os.modules.service.dto.ServiceCategoryDTO;
import com.workforce.os.modules.service.dto.ServiceItemDTO;
import com.workforce.os.modules.service.mapper.ServiceMapper;
import com.workforce.os.modules.service.service.ServiceCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ServiceController {

    private final ServiceCatalogService serviceCatalogService;
    private final ServiceMapper serviceMapper;

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ServiceCategoryDTO>>> getCategories() {
        log.info("Fetching service categories for tenant: {}", TenantContext.getCurrentTenant());
        return ResponseEntity.ok(ApiResponse.success(serviceCatalogService.getAllCategories(), CATEGORIES_RETRIEVED));
    }

    @GetMapping("/items/all")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ServiceItemDTO>>> getAllItems() {
        log.info("Fetching all service items (unpaginated) for tenant: {}", TenantContext.getCurrentTenant());
        return ResponseEntity.ok(ApiResponse.success(serviceCatalogService.getAllItems(), SERVICE_ITEMS_RETRIEVED));
    }

    @GetMapping("/items")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<ServiceItemDTO>>> getItems(
            @RequestParam(required = false) Long categoryId,
            Pageable pageable) {
        log.info("Fetching service items for category: {}, page: {}", categoryId, pageable.getPageNumber());
        Page<ServiceItemDTO> dtos;
        if (categoryId != null) {
            dtos = serviceCatalogService.getItemsByCategory(categoryId, pageable);
        } else {
            dtos = serviceCatalogService.getAllItems(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(dtos, SERVICE_ITEMS_RETRIEVED));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceCategoryDTO>> createCategory(@Valid @RequestBody ServiceCategoryDTO categoryDTO) {
        log.info("Creating service category: {}", categoryDTO.getName());
        ServiceCategoryDTO category = serviceCatalogService.createCategory(categoryDTO.getName(), categoryDTO.getDescription());
        return ResponseEntity.ok(ApiResponse.success(category, CATEGORY_CREATED));
    }

    @PostMapping("/items")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceItemDTO>> createItem(@RequestParam Long categoryId, @Valid @RequestBody ServiceItemDTO itemDTO) {
        log.info("Creating service item: {} in category: {}", itemDTO.getName(), categoryId);
        ServiceItemDTO item = serviceCatalogService.createServiceItem(categoryId, itemDTO.getName(), itemDTO.getDescription(), itemDTO.getBasePrice());
        return ResponseEntity.ok(ApiResponse.success(item, SERVICE_ITEM_CREATED));
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceCategoryDTO>> updateCategory(@PathVariable Long id, @Valid @RequestBody ServiceCategoryDTO categoryDTO) {
        log.info("Updating service category ID: {}", id);
        ServiceCategoryDTO category = serviceCatalogService.updateCategory(id, categoryDTO.getName(), categoryDTO.getDescription());
        return ResponseEntity.ok(ApiResponse.success(category, CATEGORY_UPDATED));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        log.info("Deleting service category ID: {}", id);
        serviceCatalogService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, CATEGORY_DELETED));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceItemDTO>> updateItem(@PathVariable Long id, @Valid @RequestBody ServiceItemDTO itemDTO) {
        log.info("Updating service item ID: {}", id);
        ServiceItemDTO item = serviceCatalogService.updateServiceItem(id, itemDTO.getName(), itemDTO.getDescription(), itemDTO.getBasePrice());
        return ResponseEntity.ok(ApiResponse.success(item, SERVICE_ITEM_UPDATED));
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long id) {
        log.info("Deleting service item ID: {}", id);
        serviceCatalogService.deleteServiceItem(id);
        return ResponseEntity.ok(ApiResponse.success(null, SERVICE_ITEM_DELETED));
    }
}
