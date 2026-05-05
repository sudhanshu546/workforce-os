package com.workforce.os.modules.operations.service;

import com.workforce.os.modules.operations.domain.WorkOrderEvidence;
import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.domain.WorkOrderTask;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.operations.repository.WorkOrderTaskRepository;
import com.workforce.os.modules.operations.repository.WorkOrderEvidenceRepository;
import com.workforce.os.modules.sales.domain.Quotation;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkOrderService {
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderTaskRepository workOrderTaskRepository;
    private final WorkOrderEvidenceRepository workOrderEvidenceRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final com.workforce.os.modules.attendance.service.AttendanceService attendanceService;
    private final com.workforce.os.modules.finance.service.FinanceService financeService;

    @Transactional
    public WorkOrder createWorkOrderFromQuotation(Quotation quotation) {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setQuotation(quotation);
        workOrder.setCustomer(quotation.getLead().getCustomer());
        workOrder.setScheduledDate(LocalDate.now().plusDays(1)); // Default schedule
        workOrder.setStatus(WorkOrder.WorkOrderStatus.PENDING_ASSIGNMENT);
        workOrder.setTenantId(TenantContext.getCurrentTenant());

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
        
        // Start job-specific attendance tracking
        attendanceService.clockIn(workOrder.getAssignedWorker().getId(), workOrderId, 0.0, 0.0, "ON_JOB");
        
        return workOrderRepository.save(workOrder);
    }

    @Transactional
    public WorkOrder completeWorkOrder(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();
        workOrder.setStatus(WorkOrder.WorkOrderStatus.COMPLETED);
        workOrder.setEndTime(LocalTime.now());
        
        // End job-specific attendance tracking
        attendanceService.clockOut(workOrder.getAssignedWorker().getId(), workOrderId, 0.0, 0.0);
        
        // Generate Invoice
        financeService.generateInvoice(workOrder);
        
        return workOrderRepository.save(workOrder);
    }

    @Transactional
    public WorkOrderTask updateTaskStatus(Long taskId, boolean isCompleted) {
        WorkOrderTask task = workOrderTaskRepository.findById(taskId).orElseThrow();
        task.setCompleted(isCompleted);
        return workOrderTaskRepository.save(task);
    }

    @Transactional
    public WorkOrderEvidence addEvidence(Long workOrderId, String imageUrl, String notes) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();
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

    @Transactional
    public WorkOrder updateStatus(Long workOrderId, String status) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();
        workOrder.setStatus(WorkOrder.WorkOrderStatus.valueOf(status));
        return workOrderRepository.save(workOrder);
    }
}
