package com.workforce.os.modules.operations.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.domain.WorkOrderEvidence;
import com.workforce.os.modules.operations.domain.WorkOrderTask;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.operations.service.WorkOrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final WorkOrderRepository workOrderRepository;

    @GetMapping
    public ResponseEntity<Page<WorkOrder>> getAllWorkOrders(Pageable pageable) {
        return ResponseEntity.ok(workOrderRepository.findByTenantId(TenantContext.getCurrentTenant(), pageable));
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<Page<WorkOrder>> getWorkerWorkOrders(@PathVariable Long workerId, Pageable pageable) {
        return ResponseEntity.ok(workOrderRepository.findByAssignedWorkerId(workerId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrder> getWorkOrder(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<WorkOrder> assignWorker(@PathVariable Long id, @RequestBody AssignRequest request) {
        return ResponseEntity.ok(workOrderService.assignWorker(id, request.getWorkerId()));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<WorkOrder> startWorkOrder(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.startWorkOrder(id));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<WorkOrder> completeWorkOrder(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.completeWorkOrder(id));
    }

    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<WorkOrderTask> updateTaskStatus(@PathVariable Long taskId, @RequestBody TaskStatusRequest request) {
        return ResponseEntity.ok(workOrderService.updateTaskStatus(taskId, request.isCompleted()));
    }

    @PostMapping("/{id}/evidence")
    public ResponseEntity<WorkOrderEvidence> addEvidence(@PathVariable Long id, @RequestBody EvidenceRequest request) {
        return ResponseEntity.ok(workOrderService.addEvidence(id, request.getImageUrl(), request.getNotes()));
    }

    @Data
    public static class AssignRequest {
        private Long workerId;
    }

    @Data
    public static class TaskStatusRequest {
        private boolean isCompleted;
    }

    @Data
    public static class EvidenceRequest {
        private String imageUrl;
        private String notes;
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WorkOrder> updateStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        return ResponseEntity.ok(workOrderService.updateStatus(id, request.getStatus()));
    }

    @Data
    public static class StatusRequest {
        private String status;
    }
}
