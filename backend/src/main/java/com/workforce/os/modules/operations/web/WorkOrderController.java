package com.workforce.os.modules.operations.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.operations.domain.*;
import com.workforce.os.modules.operations.dto.WorkOrderAuditDTO;
import com.workforce.os.modules.operations.dto.WorkOrderResponseDTO;
import com.workforce.os.modules.operations.dto.WorkOrderWorkerResponse;
import com.workforce.os.modules.operations.mapper.WorkOrderMapper;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.operations.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static com.workforce.os.common.util.MessageConstants.*;

import com.workforce.os.modules.operations.dto.LiveOpsMarker;

import com.workforce.os.modules.operations.service.DispatchService;
import com.workforce.os.modules.operations.dto.WorkerRecommendation;

@RestController
@RequestMapping("/api/v1/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {
    private final WorkOrderService workOrderService;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderMapper workOrderMapper;
    private final com.workforce.os.modules.customer.repository.CustomerAddressRepository addressRepository;
    private final com.workforce.os.modules.organization.repository.OrganizationRepository organizationRepository;
    private final com.workforce.os.modules.finance.repository.InvoiceRepository invoiceRepository;
    private final DispatchService dispatchService;

    @GetMapping("/{id}/recommendations")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<WorkerRecommendation>>> getSmartRecommendations(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
            dispatchService.getSmartRecommendations(id),
            "Smart recommendations retrieved"
        ));
    }

    @GetMapping("/live-ops")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LiveOpsMarker>>> getLiveOpsMap() {
        return ResponseEntity.ok(ApiResponse.success(
            workOrderService.getLiveOpsMarkers(),
            "Live operations data retrieved"
        ));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<WorkOrderResponseDTO>>> getAllWorkOrders(Pageable pageable) {
        Page<WorkOrder> workOrders = workOrderService.getAllWorkOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success(
            workOrders.map(this::enrichDTO),
            WORK_ORDER_RETRIEVED
        ));
    }

    @GetMapping("/worker/{workerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER') or (hasRole('WORKER'))")
    public ResponseEntity<ApiResponse<Page<WorkOrderWorkerResponse>>> getWorkerWorkOrders(@PathVariable Long workerId, Pageable pageable) {
        // Industry recommendation: Verify that the authenticated workerId matches the PathVariable
        Page<WorkOrderWorkerResponse> result = workOrderService.getWorkerWorkOrders(workerId, pageable).map(wo -> {
            var customer = wo.getCustomer();
            var addressOpt = addressRepository.findByCustomerIdAndIsDefaultTrue(customer.getId());

            String addressStr = addressOpt.map(a -> a.getStreet() + ", " + a.getCity()).orElse("Site address pending");
            Double lat = addressOpt.map(a -> a.getLatitude()).orElse(12.9716); 
            Double lon = addressOpt.map(a -> a.getLongitude()).orElse(77.5946);

            String serviceName = "General Service";
            Double totalAmount = 0.0;

            if (wo.getQuotation() != null) {
                totalAmount = wo.getQuotation().getTotalAmount();
                if (wo.getQuotation().getLead() != null && wo.getQuotation().getLead().getRequestedService() != null) {
                    serviceName = wo.getQuotation().getLead().getRequestedService().getName();
                }
            }
            
            // Prioritize Invoice Amount if generated
            var invoiceOpt = invoiceRepository.findByWorkOrderId(wo.getId());
            if (invoiceOpt.isPresent()) {
                totalAmount = invoiceOpt.get().getTotal();
            }

            return WorkOrderWorkerResponse.builder()
                .id(wo.getId())
                .status(wo.getStatus().name())
                .scheduledDate(wo.getScheduledDate().toString())
                .serviceName(serviceName)
                .totalAmount(totalAmount)
                .customer(WorkOrderWorkerResponse.CustomerDTO.builder()
                    .id(customer.getId())
                    .name(customer.getName())
                    .phone(customer.getPhone())
                    .address(addressStr)
                    .latitude(lat)
                    .longitude(lon)
                    .build())
                .tasks(wo.getTasks().stream().map(t -> WorkOrderWorkerResponse.TaskDTO.builder()
                    .id(t.getId())
                    .description(t.getDescription())
                    .completed(t.isCompleted())
                    .build()).collect(Collectors.toList()))
                .evidence(wo.getEvidence().stream().map(e -> WorkOrderWorkerResponse.EvidenceDTO.builder()
                    .id(e.getId())
                    .imageUrl(e.getImageUrl())
                    .notes(e.getNotes())
                    .build()).collect(Collectors.toList()))
                .materials(wo.getMaterials().stream().map(m -> WorkOrderWorkerResponse.MaterialDTO.builder()
                    .id(m.getId())
                    .materialName(m.getMaterial().getName())
                    .quantityUsed(m.getQuantityUsed())
                    .unitPriceAtUse(m.getUnitPriceAtUse())
                    .unit(m.getMaterial().getUnit())
                    .build()).collect(Collectors.toList()))
                .build();
        });
        return ResponseEntity.ok(ApiResponse.success(result, WORKER_TASKS_RETRIEVED));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> getWorkOrder(@PathVariable Long id) {
        WorkOrder workOrder = workOrderService.getWorkOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(enrichDTO(workOrder), WORK_ORDER_RETRIEVED));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER') or (hasRole('CUSTOMER'))")
    public ResponseEntity<ApiResponse<Page<WorkOrderResponseDTO>>> getCustomerWorkOrders(@PathVariable Long customerId, Pageable pageable) {
        Page<WorkOrder> workOrders = workOrderService.getCustomerWorkOrders(customerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(
            workOrders.map(this::enrichDTO),
            WORK_ORDER_RETRIEVED
        ));
    }

    private WorkOrderResponseDTO enrichDTO(WorkOrder wo) {
        WorkOrderResponseDTO dto = workOrderMapper.toDTO(wo);
        
        // Ensure worker name is set
        if (wo.getAssignedWorker() != null && wo.getAssignedWorker().getUser() != null) {
            dto.setAssignedWorkerName(wo.getAssignedWorker().getUser().getName());
        } else {
            dto.setAssignedWorkerName("Unassigned");
        }

        // Organization Name
        organizationRepository.findByTenantId(wo.getTenantId())
                .ifPresent(org -> dto.setOrganizationName(org.getBusinessName()));
        
        // Customer Address
        addressRepository.findByCustomerIdAndIsDefaultTrue(wo.getCustomer().getId())
                .ifPresent(addr -> dto.setCustomerAddress(addr.getStreet() + ", " + addr.getCity()));
        if (dto.getCustomerAddress() == null) dto.setCustomerAddress("Site address pending");

        // Service Details & Amount
        if (wo.getQuotation() != null) {
            dto.setTotalAmount(wo.getQuotation().getTotalAmount());
            if (wo.getQuotation().getLead() != null && wo.getQuotation().getLead().getRequestedService() != null) {
                dto.setServiceName(wo.getQuotation().getLead().getRequestedService().getName());
            }
        }
        
        // Prioritize Invoice Amount if generated
        invoiceRepository.findByWorkOrderId(wo.getId())
                .ifPresent(inv -> dto.setTotalAmount(inv.getTotal()));

        if (dto.getServiceName() == null) dto.setServiceName("General Service");
        if (dto.getTotalAmount() == null) dto.setTotalAmount(0.0);

        return dto;
    }

    @GetMapping("/{id}/audit")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<WorkOrderAuditDTO>>> getAuditHistory(@PathVariable Long id) {
        List<WorkOrderAudit> history = workOrderService.getAuditHistory(id);
        List<WorkOrderAuditDTO> dtos = history.stream()
                .map(workOrderMapper::toAuditDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Audit history retrieved"));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> assignWorker(@PathVariable Long id, @RequestBody AssignRequest request) {
        WorkOrder workOrder = workOrderService.assignWorker(id, request.getWorkerId());
        return ResponseEntity.ok(ApiResponse.success(enrichDTO(workOrder), WORKER_ASSIGNED));
    }

    @PatchMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> startWorkOrder(@PathVariable Long id, @RequestBody LocationRequest location) {
        WorkOrder workOrder = workOrderService.startWorkOrder(id, location.getLatitude(), location.getLongitude());
        return ResponseEntity.ok(ApiResponse.success(
            enrichDTO(workOrder), 
            WORK_ORDER_STARTED
        ));
    }

    @PatchMapping("/{id}/submit-verification")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> submitForVerification(@PathVariable Long id, @RequestBody LocationRequest location) {
        WorkOrder workOrder = workOrderService.submitForVerification(id, location.getLatitude(), location.getLongitude());
        return ResponseEntity.ok(ApiResponse.success(
            enrichDTO(workOrder), 
            SUBMITTED_FOR_VERIFICATION
        ));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> verifyWorkOrder(@PathVariable Long id) {
        WorkOrder workOrder = workOrderService.verifyWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success(enrichDTO(workOrder), WORK_ORDER_VERIFIED));
    }

    @PatchMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<Void>> updateTaskStatus(@PathVariable Long taskId, @RequestBody TaskStatusRequest request) {
        workOrderService.updateTaskStatus(taskId, request.isCompleted());
        return ResponseEntity.ok(ApiResponse.success(null, TASK_STATUS_UPDATED));
    }

    @PostMapping("/{id}/evidence")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<Void>> addEvidence(@PathVariable Long id, @RequestBody EvidenceRequest request) {
        workOrderService.addEvidence(id, request.getImageUrl(), request.getNotes());
        return ResponseEntity.ok(ApiResponse.success(null, EVIDENCE_ADDED));
    }

    @Data
    public static class LocationRequest {
        private Double latitude;
        private Double longitude;
    }

    @Data
    public static class AssignRequest {
        private Long workerId;
    }

    @Data
    public static class TaskStatusRequest {
        @com.fasterxml.jackson.annotation.JsonProperty("isCompleted")
        private boolean isCompleted;
    }

    @Data
    public static class EvidenceRequest {
        private String imageUrl;
        private String notes;
    }
}
