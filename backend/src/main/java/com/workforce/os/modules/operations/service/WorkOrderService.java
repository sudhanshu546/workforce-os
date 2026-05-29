package com.workforce.os.modules.operations.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.exception.BusinessException;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.common.util.MessageConstants;
import com.workforce.os.modules.customer.repository.CustomerAddressRepository;
import com.workforce.os.modules.inventory.domain.Material;
import com.workforce.os.modules.inventory.repository.MaterialRepository;
import com.workforce.os.modules.operations.domain.*;
import com.workforce.os.modules.operations.dto.LiveOpsMarker;
import com.workforce.os.modules.operations.repository.*;
import com.workforce.os.modules.sales.domain.Quotation;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.repository.WorkerLocationRepository;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import com.workforce.os.modules.attendance.service.AttendanceService;
import com.workforce.os.modules.finance.service.FinanceService;
import com.workforce.os.modules.notification.service.NotificationService;
import com.workforce.os.modules.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import static com.workforce.os.common.util.MessageConstants.*;
import static com.workforce.os.modules.operations.domain.WorkOrder.WorkOrderStatus.AWAITING_VERIFICATION;

@Service
@Slf4j
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderTaskRepository workOrderTaskRepository;
    private final WorkOrderEvidenceRepository workOrderEvidenceRepository;
    private final WorkOrderAuditRepository workOrderAuditRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final WorkerLocationRepository workerLocationRepository;
    private final AttendanceService attendanceService;
    private final FinanceService financeService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RabbitTemplate rabbitTemplate;
    private final MaterialRepository materialRepository;
    private final WorkOrderMaterialRepository workOrderMaterialRepository;
    private final CustomerAddressRepository addressRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public List<LiveOpsMarker> getLiveOpsMarkers() {
        String tenantId = TenantContext.getCurrentTenant();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        List<WorkOrder> activeOrders = workOrderRepository.findByTenantIdAndStatus(tenantId, WorkOrder.WorkOrderStatus.IN_PROGRESS);    

        return activeOrders.stream().map(wo -> {
            Double lat = null;
            Double lon = null;
            String lastUpdated = "N/A";

            var liveLocation = workerLocationRepository.findLatestByWorkerIdAndTenantId(wo.getAssignedWorker().getId(), tenantId);      
            if (liveLocation.isPresent() && liveLocation.get().getTimestamp().isAfter(LocalDateTime.now().minusMinutes(10))) {
                lat = liveLocation.get().getLatitude();
                lon = liveLocation.get().getLongitude();
                lastUpdated = liveLocation.get().getTimestamp().format(formatter);
            } else {
                var audit = workOrderAuditRepository.findByWorkOrderIdOrderByTimestampDesc(wo.getId()).stream()
                    .filter(a -> a.getLatitude() != null)
                    .findFirst();
                if (audit.isPresent()) {
                    lat = audit.get().getLatitude();
                    lon = audit.get().getLongitude();
                    lastUpdated = audit.get().getTimestamp().format(formatter);
                }
            }

            if (lat == null) return null;

            return LiveOpsMarker.builder()
                .workOrderId(wo.getId())
                .customerName(wo.getCustomer() != null ? wo.getCustomer().getName() : "Unknown")
                .workerName(wo.getAssignedWorker() != null ?
                           wo.getAssignedWorker().getUser().getName() : "Unassigned")
                .status(wo.getStatus().name())
                .latitude(lat)
                .longitude(lon)
                .lastUpdated(lastUpdated)
                .build();
        })
        .filter(java.util.Objects::nonNull)
        .collect(Collectors.toList());
    }

    @Transactional
    public WorkOrder createWorkOrderFromQuotation(Quotation quotation) {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setQuotation(quotation);
        workOrder.setCustomer(quotation.getLead().getCustomer());

        addressRepository.findByCustomerIdAndIsDefaultTrue(quotation.getLead().getCustomer().getId())
            .ifPresent(workOrder::setServiceAddress);

        workOrder.setScheduledDate(LocalDate.now().plusDays(1));
        workOrder.setStatus(WorkOrder.WorkOrderStatus.PENDING_ASSIGNMENT);
        workOrder.setTenantId(quotation.getTenantId());

        java.util.Set<WorkOrderTask> tasks = quotation.getItems().stream().map(item -> {
            WorkOrderTask task = new WorkOrderTask();
            task.setWorkOrder(workOrder);
            task.setDescription(item.getDescription());
            return task;
        }).collect(Collectors.toCollection(java.util.LinkedHashSet::new));

        workOrder.setTasks(tasks);
        WorkOrder saved = workOrderRepository.save(workOrder);
        createAudit(saved, null, saved.getStatus().name(), null, null, AUDIT_BY_SYSTEM, "Automated creation from quotation");
        return saved;
    }

    @Transactional
    public WorkOrder assignWorker(Long workOrderId, Long workerId) {
        WorkOrder workOrder = getWorkOrderSecurely(workOrderId);
        WorkerProfile worker = workerProfileRepository.findById(workerId)
            .orElseThrow(() -> new ResourceNotFoundException(WORKER_NOT_FOUND));
        
        // Ensure worker belongs to the same tenant
        if (!worker.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new BusinessException(UNAUTHORIZED);
        }

        String fromStatus = workOrder.getStatus().name();
        workOrder.setAssignedWorker(worker);
        workOrder.setStatus(WorkOrder.WorkOrderStatus.ASSIGNED);

        WorkOrder saved = workOrderRepository.save(workOrder);
        createAudit(saved, fromStatus, saved.getStatus().name(), null, null, AUDIT_BY_ADMIN, "Assigned to worker: " + worker.getUser().getName());

        notificationService.notifyNewJob(saved);
        notificationService.sendTrackingLink(saved);

        return saved;
    }

    @Transactional
    public WorkOrder startWorkOrder(Long workOrderId, Double lat, Double lon) {
        WorkOrder workOrder = getWorkOrderSecurely(workOrderId);

        if (!attendanceService.isWorkerClockedIn(workOrder.getAssignedWorker().getId())) {
            throw new BusinessException(CLOCK_IN_REQUIRED);
        }

        verifyLocation(workOrder, lat, lon);

        String fromStatus = workOrder.getStatus().name();
        workOrder.setStatus(WorkOrder.WorkOrderStatus.IN_PROGRESS);
        workOrder.setStartTime(LocalTime.now());

        messagingTemplate.convertAndSend(WS_TOPIC_ORDER_PREFIX + workOrder.getCustomer().getId(),
            String.format(WS_MSG_JOB_STARTED, (workOrder.getId() + 1000)));

        WorkOrder saved = workOrderRepository.save(workOrder);
        createAudit(saved, fromStatus, saved.getStatus().name(), lat, lon, AUDIT_BY_WORKER, "Job started on-site");

        notificationService.sendTrackingLink(saved);
        
        return saved;
    }


    @Transactional
    public WorkOrder submitForVerification(Long workOrderId, Double lat, Double lon) {
        WorkOrder workOrder = getWorkOrderSecurely(workOrderId);

        boolean allTasksDone = workOrder.getTasks().stream().allMatch(WorkOrderTask::isCompleted);
        if (!allTasksDone) {
            throw new BusinessException(TASKS_PENDING);
        }

        // Industry Standard: Mandatory Evidence
        if (workOrder.getEvidence().isEmpty()) {
            throw new BusinessException(EVIDENCE_REQUIRED);
        }

        // Geofencing Check
        verifyLocation(workOrder, lat, lon);

        String fromStatus = workOrder.getStatus().name();
        workOrder.setStatus(AWAITING_VERIFICATION);
        workOrder.setEndTime(LocalTime.now());

        messagingTemplate.convertAndSend(WS_TOPIC_ORDER_PREFIX + workOrder.getCustomer().getId(),
            String.format(WS_MSG_JOB_FINISHED, (workOrder.getId() + 1000)));

        WorkOrder saved = workOrderRepository.save(workOrder);
        createAudit(saved, fromStatus, saved.getStatus().name(), lat, lon, AUDIT_BY_WORKER, "Job submitted for customer sign-off");     
        return saved;
    }

    @Transactional
    public WorkOrder verifyWorkOrder(Long workOrderId) {
        WorkOrder workOrder = getWorkOrderSecurely(workOrderId);
            
        if (workOrder.getStatus() != AWAITING_VERIFICATION) {
            throw new BusinessException(NOT_VERIFIABLE);
        }

        String fromStatus = workOrder.getStatus().name();
        workOrder.setStatus(WorkOrder.WorkOrderStatus.AWAITING_PAYMENT);

        // Offload to Queue
        log.info("Sending invoice generation message to RabbitMQ for Order ID: {}", workOrder.getId());
        rabbitTemplate.convertAndSend(com.workforce.os.common.config.RabbitMQConfig.EXCHANGE,
                                     com.workforce.os.common.config.RabbitMQConfig.INVOICE_ROUTING_KEY,
                                     com.workforce.os.modules.finance.service.InvoiceGenerationMessage.builder()
                                         .workOrderId(workOrder.getId())
                                         .tenantId(workOrder.getTenantId())
                                         .build());

        WorkOrder saved = workOrderRepository.save(workOrder);
        createAudit(saved, fromStatus, saved.getStatus().name(), null, null, AUDIT_BY_CUSTOMER, "Work verified. Invoice generation queued.");

        notificationService.notifyJobVerified(saved);
        return saved;
    }

    @Transactional
    public WorkOrder updateStatus(Long workOrderId, String status) {
        WorkOrder workOrder = getWorkOrderSecurely(workOrderId);
        String fromStatus = workOrder.getStatus().name();
        workOrder.setStatus(WorkOrder.WorkOrderStatus.valueOf(status));
        WorkOrder saved = workOrderRepository.save(workOrder);
        createAudit(saved, fromStatus, status, null, null, AUDIT_BY_SYSTEM, "Manual status update");
        return saved;
    }

    private WorkOrder getWorkOrderSecurely(Long id) {
        return workOrderRepository.findByIdAndTenantId(id, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new ResourceNotFoundException(WORK_ORDER_NOT_FOUND));
    }

    private void verifyLocation(WorkOrder workOrder, Double lat, Double lon) {
        if (lat == null || lon == null) return; // Skip if location disabled by device policy for now

        // Find default address
        var addressOpt = addressRepository.findByCustomerIdAndIsDefaultTrue(workOrder.getCustomer().getId());
        if (addressOpt.isPresent()) {
            var addr = addressOpt.get();
            if (addr.getLatitude() != null && addr.getLongitude() != null) {
                double distance = calculateDistance(lat, lon, addr.getLatitude(), addr.getLongitude());
                if (distance > 500) { // 500 meters
                    throw new BusinessException(OUT_OF_RANGE);
                }
            }
        }
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000.0; // Earth radius in meters
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double dPhi = Math.toRadians(lat2 - lat1);
        double dLambda = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
                   Math.cos(phi1) * Math.cos(phi2) *
                   Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    private void createAudit(WorkOrder wo, String from, String to, Double lat, Double lon, String by, String notes) {
        WorkOrderAudit audit = WorkOrderAudit.builder()
                .workOrder(wo)
                .fromStatus(from)
                .toStatus(to)
                .latitude(lat)
                .longitude(lon)
                .actionBy(by)
                .timestamp(LocalDateTime.now())
                .notes(notes)
                .build();
        audit.setTenantId(wo.getTenantId());
        workOrderAuditRepository.save(audit);
    }

    @Transactional
    public WorkOrderTask updateTaskStatus(Long taskId, boolean isCompleted) {
        WorkOrderTask task = workOrderTaskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND));
        if (task.getWorkOrder().getStatus() == WorkOrder.WorkOrderStatus.COMPLETED) {
            throw new BusinessException(CANNOT_MODIFY_COMPLETED);
        }
        task.setCompleted(isCompleted);
        return workOrderTaskRepository.save(task);
    }

    @Transactional
    public WorkOrderEvidence addEvidence(Long workOrderId, String imageUrl, String notes) {
        WorkOrder workOrder = getWorkOrderSecurely(workOrderId);
        if (workOrder.getStatus() == WorkOrder.WorkOrderStatus.COMPLETED) {
            throw new BusinessException(CANNOT_ADD_EVIDENCE_COMPLETED);
        }
        WorkOrderEvidence evidence = new WorkOrderEvidence();
        evidence.setWorkOrder(workOrder);
        evidence.setImageUrl(imageUrl);
        evidence.setNotes(notes);
        evidence.setUploadedAt(LocalDateTime.now());
        return workOrderEvidenceRepository.save(evidence);
    }

    @Transactional(readOnly = true)
    public List<WorkOrderAudit> getAuditHistory(Long workOrderId) {
        getWorkOrderSecurely(workOrderId); // Ensure tenant has access
        return workOrderAuditRepository.findByWorkOrderIdOrderByTimestampDesc(workOrderId);
    }

    @Transactional(readOnly = true)
    public List<WorkOrder> getAllWorkOrders() {
        return workOrderRepository.findAllByTenantIdOrderByCreatedAtDesc(TenantContext.getCurrentTenant());
    }

    @Transactional(readOnly = true)
    public Page<WorkOrder> getAllWorkOrders(Pageable pageable) {
        return workOrderRepository.findByTenantIdOrderByCreatedAtDesc(TenantContext.getCurrentTenant(), pageable);
    }

    @Transactional(readOnly = true)
    public Page<WorkOrder> getWorkerWorkOrders(Long workerId, Pageable pageable) {
        return workOrderRepository.findByAssignedWorkerIdOrderByCreatedAtDesc(workerId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<WorkOrder> getCustomerWorkOrders(Long customerId, Pageable pageable) {
        return workOrderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);
    }

    @Transactional(readOnly = true)
    public WorkOrder getWorkOrderById(Long id) {
        return getWorkOrderSecurely(id);
    }

    public WorkOrderRepository getWorkOrderRepository() {
        return workOrderRepository;
    }

    @Transactional
    public void addMaterialUsage(Long workOrderId, Long materialId, Double quantity) {
        WorkOrder workOrder = getWorkOrderSecurely(workOrderId);
        if (workOrder.getStatus() == WorkOrder.WorkOrderStatus.COMPLETED) {
            throw new BusinessException(CANNOT_ADD_MATERIALS_COMPLETED);
        }
        Material material = materialRepository.findById(materialId)
            .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND));

        if (material.getQuantity() < quantity) {
            throw new BusinessException(INSUFFICIENT_STOCK);
        }

        WorkOrderMaterial usage = new WorkOrderMaterial();
        usage.setWorkOrder(workOrder);
        usage.setMaterial(material);
        usage.setQuantityUsed(quantity);
        usage.setUnitPriceAtUse(material.getPrice());

        material.setQuantity(material.getQuantity() - quantity);
        materialRepository.save(material);
        workOrderMaterialRepository.save(usage);

        if (material.getQuantity() <= (material.getMinThreshold() != null ? material.getMinThreshold() : 0.0)) {
            notificationService.sendLowStockAlert(material);
        }
    }

}
