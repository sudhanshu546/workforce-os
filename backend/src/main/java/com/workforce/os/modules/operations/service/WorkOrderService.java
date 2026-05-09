package com.workforce.os.modules.operations.service;

import com.workforce.os.modules.inventory.domain.Material;
import com.workforce.os.modules.inventory.repository.MaterialRepository;
import com.workforce.os.modules.operations.domain.WorkOrderEvidence;
import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.domain.WorkOrderMaterial;
import com.workforce.os.modules.operations.domain.WorkOrderTask;
import com.workforce.os.modules.operations.repository.WorkOrderMaterialRepository;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.operations.repository.WorkOrderTaskRepository;
import com.workforce.os.modules.operations.repository.WorkOrderEvidenceRepository;
import com.workforce.os.modules.sales.domain.Quotation;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.workforce.os.modules.operations.domain.WorkOrder.WorkOrderStatus.AWAITING_VERIFICATION;

@Service
@RequiredArgsConstructor
public class WorkOrderService {
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderTaskRepository workOrderTaskRepository;
    private final WorkOrderEvidenceRepository workOrderEvidenceRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final com.workforce.os.modules.attendance.service.AttendanceService attendanceService;
    private final com.workforce.os.modules.finance.service.FinanceService financeService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Transactional
    public WorkOrder createWorkOrderFromQuotation(Quotation quotation) {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setQuotation(quotation);
        workOrder.setCustomer(quotation.getLead().getCustomer());
        workOrder.setScheduledDate(LocalDate.now().plusDays(1)); // Default schedule
        workOrder.setStatus(WorkOrder.WorkOrderStatus.PENDING_ASSIGNMENT);

        // Ensure the work order belongs to the organization's tenant
        workOrder.setTenantId(quotation.getTenantId());

        // Map quotation items to default tasks
        List<WorkOrderTask> tasks = quotation.getItems().stream().map(item -> {
            WorkOrderTask task = new WorkOrderTask();
            task.setWorkOrder(workOrder);
            task.setDescription(item.getDescription());
            return task;
        }).collect(Collectors.toList());

        workOrder.setTasks(tasks);

        return workOrderRepository.save(workOrder);
    }

    @Transactional
    public WorkOrder assignWorker(Long workOrderId, Long workerId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();
        WorkerProfile worker = workerProfileRepository.findById(workerId).orElseThrow();
        workOrder.setAssignedWorker(worker);
        workOrder.setStatus(WorkOrder.WorkOrderStatus.ASSIGNED);
        return workOrderRepository.save(workOrder);
    }

    @Transactional
    public WorkOrder startWorkOrder(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();

        // Enforce Shift Clock-in
        if (!attendanceService.isWorkerClockedIn(workOrder.getAssignedWorker().getId())) {
            throw new RuntimeException("You must clock in for your shift before starting a job");
        }

        workOrder.setStatus(WorkOrder.WorkOrderStatus.IN_PROGRESS);
        workOrder.setStartTime(LocalTime.now());

        // Notify customer via WebSocket
        messagingTemplate.convertAndSend("/topic/order/" + workOrder.getCustomer().getId(), 
            "Technician has started working on your order: #WO-" + (workOrder.getId() + 1000));

        return workOrderRepository.save(workOrder);
    }
    @Transactional
    public WorkOrder submitForVerification(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();
        workOrder.setStatus(AWAITING_VERIFICATION);
        workOrder.setEndTime(LocalTime.now());

        // End job-specific attendance tracking
//        attendanceService.clockOut(workOrder.getAssignedWorker().getId(), workOrderId, 0.0, 0.0);
        
        // Notify customer via WebSocket
        messagingTemplate.convertAndSend("/topic/order/" + workOrder.getCustomer().getId(), 
            "Technician has finished the work. Please review and verify completion for order: #WO-" + (workOrder.getId() + 1000));

        return workOrderRepository.save(workOrder);
    }

    @Transactional
    public WorkOrder verifyWorkOrder(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();
        if (workOrder.getStatus() != AWAITING_VERIFICATION) {
            throw new RuntimeException("Work order is not in a verifiable state");
        }
        
        workOrder.setStatus(WorkOrder.WorkOrderStatus.COMPLETED);
        
        // Generate Invoice ONLY AFTER customer verifies
        financeService.generateInvoice(workOrder);
        
        return workOrderRepository.save(workOrder);
    }

    @Transactional
    public WorkOrder updateStatus(Long workOrderId, String status) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();
        workOrder.setStatus(WorkOrder.WorkOrderStatus.valueOf(status));
        return workOrderRepository.save(workOrder);
    }

    @Transactional
    public WorkOrderTask updateTaskStatus(Long taskId, boolean isCompleted) {
        WorkOrderTask task = workOrderTaskRepository.findById(taskId).orElseThrow();
        if (task.getWorkOrder().getStatus() == WorkOrder.WorkOrderStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify completed work order");
        }
        task.setCompleted(isCompleted);
        return workOrderTaskRepository.save(task);
    }

    @Transactional
    public WorkOrderEvidence addEvidence(Long workOrderId, String imageUrl, String notes) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();
        if (workOrder.getStatus() == WorkOrder.WorkOrderStatus.COMPLETED) {
            throw new RuntimeException("Cannot add evidence to completed work order");
        }
        WorkOrderEvidence evidence = new WorkOrderEvidence();
        evidence.setWorkOrder(workOrder);
        evidence.setImageUrl(imageUrl);
        evidence.setNotes(notes);
        evidence.setUploadedAt(LocalDateTime.now());
        return workOrderEvidenceRepository.save(evidence);
    }

    public List<WorkOrder> getAllWorkOrders() {
        return workOrderRepository.findAllByTenantId(TenantContext.getCurrentTenant());
    }

    public List<WorkOrder> getWorkerWorkOrders(Long workerId) {
        return workOrderRepository.findByAssignedWorkerId(workerId);
    }

    public WorkOrder getWorkOrderById(Long id) {
        return workOrderRepository.findById(id).orElseThrow();
    }

    @Autowired
    private MaterialRepository materialRepository;
    @Autowired
    private WorkOrderMaterialRepository workOrderMaterialRepository;

    @Transactional
    public void addMaterialUsage(Long workOrderId, Long materialId, Double quantity) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();
        if (workOrder.getStatus() == WorkOrder.WorkOrderStatus.COMPLETED) {
            throw new RuntimeException("Cannot add materials to completed work order");
        }
        Material material = materialRepository.findById(materialId).orElseThrow();

        if (material.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient material stock");
        }
        
        WorkOrderMaterial usage = new WorkOrderMaterial();
        usage.setWorkOrder(workOrder);
        usage.setMaterial(material);
        usage.setQuantityUsed(quantity);
        usage.setUnitPriceAtUse(material.getPrice());

        // Reduce stock
        material.setQuantity(material.getQuantity() - quantity);
        materialRepository.save(material);
        workOrderMaterialRepository.save(usage);
    }

}