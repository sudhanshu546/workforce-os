package com.workforce.os.modules.finance.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.finance.domain.Expense;
import com.workforce.os.modules.finance.repository.ExpenseRepository;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkerProfileRepository workerProfileRepository;

    @Transactional
    public Expense logExpense(Long workOrderId, Long workerId, String category, Double amount, String description, String receiptImageUrl) {
        WorkOrder workOrder = workOrderRepository.findByIdAndTenantId(workOrderId, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new com.workforce.os.common.exception.ResourceNotFoundException("Work order not found"));
        WorkerProfile worker = workerProfileRepository.findByIdAndTenantId(workerId, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new com.workforce.os.common.exception.ResourceNotFoundException("Worker not found"));

        Expense expense = new Expense();
        expense.setWorkOrder(workOrder);
        expense.setWorker(worker);
        expense.setCategory(category);
        expense.setAmount(amount);
        expense.setDescription(description);
        expense.setReceiptImageUrl(receiptImageUrl);
        expense.setTenantId(workOrder.getTenantId());

        return expenseRepository.save(expense);
    }


    public Page<Expense> getTenantExpenses(Pageable pageable) {
        return expenseRepository.findByTenantIdOrderByCreatedAtDesc(TenantContext.getCurrentTenant(), pageable);
    }

    public Page<Expense> getWorkerExpenses(Long workerId, Pageable pageable) {
        return expenseRepository.findByWorkerIdOrderByCreatedAtDesc(workerId, pageable);
    }

    @Transactional
    public Expense updateStatus(Long expenseId, Expense.ExpenseStatus status) {
        Expense expense = expenseRepository.findByIdAndTenantId(expenseId, TenantContext.getCurrentTenant())
                .orElseThrow(() -> new com.workforce.os.common.exception.ResourceNotFoundException("Expense not found"));
        expense.setStatus(status);
        return expenseRepository.save(expense);
    }
}
