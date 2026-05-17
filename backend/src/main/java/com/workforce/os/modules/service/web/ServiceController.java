package com.workforce.os.modules.service.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.service.domain.ServiceCategory;
import com.workforce.os.modules.service.domain.ServiceItem;
import com.workforce.os.modules.service.dto.ServiceCategoryDTO;
import com.workforce.os.modules.service.dto.ServiceItemDTO;
import com.workforce.os.modules.service.mapper.ServiceMapper;
import com.workforce.os.modules.service.service.ServiceCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceCatalogService serviceCatalogService;
    private final ServiceMapper serviceMapper;

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ServiceCategoryDTO>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(serviceCatalogService.getAllCategories(), "Categories retrieved successfully"));
    }

    @GetMapping("/items")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ServiceItemDTO>>> getItems(@RequestParam(required = false) Long categoryId) {
        List<ServiceItemDTO> dtos;
        if (categoryId != null) {
            dtos = serviceCatalogService.getItemsByCategory(categoryId);
        } else {
            dtos = serviceCatalogService.getAllItems();
        }
        return ResponseEntity.ok(ApiResponse.success(dtos, "Service items retrieved successfully"));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceCategoryDTO>> createCategory(@Valid @RequestBody ServiceCategoryDTO categoryDTO) {
        ServiceCategoryDTO category = serviceCatalogService.createCategory(categoryDTO.getName(), categoryDTO.getDescription());
        return ResponseEntity.ok(ApiResponse.success(category, "Category created successfully"));
    }

    @PostMapping("/items")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceItemDTO>> createItem(@RequestParam Long categoryId, @Valid @RequestBody ServiceItemDTO itemDTO) {
        ServiceItemDTO item = serviceCatalogService.createServiceItem(categoryId, itemDTO.getName(), itemDTO.getDescription(), itemDTO.getBasePrice());
        return ResponseEntity.ok(ApiResponse.success(item, "Service item created successfully"));
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceCategoryDTO>> updateCategory(@PathVariable Long id, @Valid @RequestBody ServiceCategoryDTO categoryDTO) {
        ServiceCategoryDTO category = serviceCatalogService.updateCategory(id, categoryDTO.getName(), categoryDTO.getDescription());
        return ResponseEntity.ok(ApiResponse.success(category, "Category updated successfully"));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        serviceCatalogService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceItemDTO>> updateItem(@PathVariable Long id, @Valid @RequestBody ServiceItemDTO itemDTO) {
        ServiceItemDTO item = serviceCatalogService.updateServiceItem(id, itemDTO.getName(), itemDTO.getDescription(), itemDTO.getBasePrice());
        return ResponseEntity.ok(ApiResponse.success(item, "Service item updated successfully"));
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long id) {
        serviceCatalogService.deleteServiceItem(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Service item deleted successfully"));
    }
}
