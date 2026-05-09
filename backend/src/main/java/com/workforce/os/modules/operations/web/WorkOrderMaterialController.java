package com.workforce.os.modules.operations.web;

import com.workforce.os.modules.operations.service.WorkOrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/work-orders")
@RequiredArgsConstructor
public class WorkOrderMaterialController {
    private final WorkOrderService workOrderService;

    @PostMapping("/{workOrderId}/materials")
    public ResponseEntity<Void> addMaterialUsage(
            @PathVariable Long workOrderId,
            @RequestBody MaterialUsageRequest request) {
        workOrderService.addMaterialUsage(workOrderId, request.getMaterialId(), request.getQuantity());
        return ResponseEntity.ok().build();
    }

    @Data
    public static class MaterialUsageRequest {
        private Long materialId;
        private Double quantity;
    }
}
