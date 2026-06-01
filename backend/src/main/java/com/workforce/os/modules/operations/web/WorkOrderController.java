package com.workforce.os.modules.operations.web;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.customer.domain.Customer;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
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
@Slf4j
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
        log.info("Fetching smart recommendations for work order: {}", id);
        return ResponseEntity.ok(ApiResponse.success(
            dispatchService.getSmartRecommendations(id),
            RECOMMENDATIONS_RETRIEVED
        ));
    }

    @PostMapping("/{id}/auto-dispatch")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkerRecommendation>> autoDispatch(@PathVariable Long id) {
        log.info("Triggering AI Auto-Dispatch for work order: {}", id);
        WorkerRecommendation topMatch = dispatchService.autoDispatch(id);
        return ResponseEntity.ok(ApiResponse.success(topMatch, WORKER_ASSIGNED));
    }

    @GetMapping("/live-ops")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LiveOpsMarker>>> getLiveOpsMap() {
        log.info("Fetching live operations map data for tenant: {}", TenantContext.getCurrentTenant());
        return ResponseEntity.ok(ApiResponse.success(
            workOrderService.getLiveOpsMarkers(),
            LIVE_OPS_RETRIEVED
        ));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<WorkOrderResponseDTO>>> getAllWorkOrders(Pageable pageable) {
        log.info("Fetching all work orders for tenant: {}, page: {}", TenantContext.getCurrentTenant(), pageable.getPageNumber());
        Page<WorkOrder> workOrders = workOrderService.getAllWorkOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success(
            workOrders.map(this::enrichDTO),
            WORK_ORDER_RETRIEVED
        ));
    }

    @GetMapping("/worker/{workerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER') or (hasRole('WORKER'))")
    public ResponseEntity<ApiResponse<Page<WorkOrderWorkerResponse>>> getWorkerWorkOrders(@PathVariable Long workerId, Pageable pageable) {
        log.info("Fetching work orders for worker: {}, page: {}", workerId, pageable.getPageNumber());
        // Industry recommendation: Verify that the authenticated workerId matches the PathVariable
        Page<WorkOrderWorkerResponse> result = workOrderService.getWorkerWorkOrders(workerId, pageable).map(wo -> {
            var customer = wo.getCustomer();
            var addressOpt = addressRepository.findByCustomerIdAndIsDefaultTrue(customer.getId());

            String addressStr = addressOpt.map(a -> a.getStreet() + ", " + a.getCity()).orElse(SITE_ADDRESS_PENDING);
            Double lat = addressOpt.map(a -> a.getLatitude()).orElse(12.9716); 
            Double lon = addressOpt.map(a -> a.getLongitude()).orElse(77.5946);

            String serviceName = GENERAL_SERVICE;
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
        log.info("Fetching details for work order: {}", id);
        WorkOrder workOrder = workOrderService.getWorkOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(enrichDTO(workOrder), WORK_ORDER_RETRIEVED));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER') or (hasRole('CUSTOMER'))")
    public ResponseEntity<ApiResponse<Page<WorkOrderResponseDTO>>> getCustomerWorkOrders(@PathVariable Long customerId, Pageable pageable) {
        log.info("Fetching work orders for customer: {}, page: {}", customerId, pageable.getPageNumber());
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
            dto.setAssignedWorkerName(UNASSIGNED);
        }

        // Organization Name
        organizationRepository.findByTenantId(wo.getTenantId())
                .ifPresent(org -> dto.setOrganizationName(org.getBusinessName()));
        
        // Customer Address
        addressRepository.findByCustomerIdAndIsDefaultTrue(wo.getCustomer().getId())
                .ifPresent(addr -> dto.setCustomerAddress(addr.getStreet() + ", " + addr.getCity()));
        if (dto.getCustomerAddress() == null) dto.setCustomerAddress(SITE_ADDRESS_PENDING);

        // Service Details & Amount
        if (wo.getQuotation() != null) {
            dto.setTotalAmount(wo.getQuotation().getTotalAmount());
            if (wo.getQuotation().getLead() != null && wo.getQuotation().getLead().getRequestedService() != null) {
                dto.setServiceName(wo.getQuotation().getLead().getRequestedService().getName());
            }
        }
        
        // Prioritize Invoice Amount if generated
        invoiceRepository.findByWorkOrderId(wo.getId())
                .ifPresent(inv -> {
                    dto.setTotalAmount(inv.getTotal());
                    // Mapping invoice to a simple map or DTO
                    java.util.Map<String, Object> invoiceData = new java.util.HashMap<>();
                    invoiceData.put("id", inv.getId());
                    invoiceData.put("invoiceNumber", inv.getInvoiceNumber());
                    invoiceData.put("total", inv.getTotal());
                    invoiceData.put("status", inv.getStatus());
                    invoiceData.put("subtotal", inv.getSubtotal());
                    invoiceData.put("tax", inv.getTax());
                    dto.setInvoice(invoiceData);
                });

        if (dto.getServiceName() == null) dto.setServiceName(GENERAL_SERVICE);
        if (dto.getTotalAmount() == null) dto.setTotalAmount(0.0);

        return dto;
    }

    @GetMapping("/{id}/audit")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<WorkOrderAuditDTO>>> getAuditHistory(@PathVariable Long id) {
        log.info("Fetching audit history for work order: {}", id);
        List<WorkOrderAudit> history = workOrderService.getAuditHistory(id);
        List<WorkOrderAuditDTO> dtos = history.stream()
                .map(workOrderMapper::toAuditDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, AUDIT_HISTORY_RETRIEVED));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> assignWorker(@PathVariable Long id, @Valid @RequestBody AssignRequest request) {
        log.info("Assigning worker: {} to work order: {}", request.getWorkerId(), id);
        WorkOrder workOrder = workOrderService.assignWorker(id, request.getWorkerId());
        return ResponseEntity.ok(ApiResponse.success(enrichDTO(workOrder), WORKER_ASSIGNED));
    }

    @PatchMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> startWorkOrder(@PathVariable Long id, @Valid @RequestBody LocationRequest location) {
        log.info("Starting work order: {} at location: {}, {}", id, location.getLatitude(), location.getLongitude());
        WorkOrder workOrder = workOrderService.startWorkOrder(id, location.getLatitude(), location.getLongitude());
        return ResponseEntity.ok(ApiResponse.success(
            enrichDTO(workOrder), 
            WORK_ORDER_STARTED
        ));
    }

    @PatchMapping("/{id}/submit-verification")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> submitForVerification(@PathVariable Long id, @Valid @RequestBody LocationRequest location) {
        log.info("Submitting work order: {} for verification at location: {}, {}", id, location.getLatitude(), location.getLongitude());
        WorkOrder workOrder = workOrderService.submitForVerification(id, location.getLatitude(), location.getLongitude());
        return ResponseEntity.ok(ApiResponse.success(
            enrichDTO(workOrder), 
            SUBMITTED_FOR_VERIFICATION
        ));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<WorkOrderResponseDTO>> verifyWorkOrder(@PathVariable Long id) {
        log.info("Verifying work order: {}", id);
        WorkOrder workOrder = workOrderService.verifyWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success(enrichDTO(workOrder), WORK_ORDER_VERIFIED));
    }

    @PatchMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<Void>> updateTaskStatus(@PathVariable Long taskId, @Valid @RequestBody TaskStatusRequest request) {
        log.info("Updating status for task: {} to: {}", taskId, request.isCompleted());
        workOrderService.updateTaskStatus(taskId, request.isCompleted());
        return ResponseEntity.ok(ApiResponse.success(null, TASK_STATUS_UPDATED));
    }

    @PostMapping("/{id}/evidence")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<Void>> addEvidence(@PathVariable Long id, @Valid @RequestBody EvidenceRequest request) {
        log.info("Adding evidence to work order: {}", id);
        workOrderService.addEvidence(id, request.getImageUrl(), request.getNotes());
        return ResponseEntity.ok(ApiResponse.success(null, EVIDENCE_ADDED));
    }

    @Data
    public static class LocationRequest {
        @jakarta.validation.constraints.NotNull
        private Double latitude;
        @jakarta.validation.constraints.NotNull
        private Double longitude;
    }

    @Data
    public static class AssignRequest {
        @jakarta.validation.constraints.NotNull
        private Long workerId;
    }

    @Data
    public static class TaskStatusRequest {
        @com.fasterxml.jackson.annotation.JsonProperty("isCompleted")
        private boolean isCompleted;
    }

    @Data
    public static class EvidenceRequest {
        @jakarta.validation.constraints.NotBlank
        private String imageUrl;
        private String notes;
    }
}
