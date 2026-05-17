package com.workforce.os.modules.finance.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.finance.domain.Expense;
import com.workforce.os.modules.finance.service.ExpenseService;
import com.workforce.os.modules.operations.domain.WorkOrder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/finance/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService service;
    private final com.workforce.os.modules.finance.mapper.FinanceMapper mapper;
    private final com.workforce.os.modules.operations.repository.WorkOrderRepository workOrderRepository;

    @PostMapping
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<ApiResponse<com.workforce.os.modules.finance.dto.ExpenseResponseDTO>> logExpense(@RequestBody ExpenseRequest request) {
        Expense expense = service.logExpense(
            request.getWorkOrderId(),
            request.getWorkerId(),
            request.getCategory(),
            request.getAmount(),
            request.getDescription(),
            request.getReceiptImageUrl()
        );
        return ResponseEntity.ok(ApiResponse.success( enrichExpenseDTO(expense) , "Expense logged successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<com.workforce.os.modules.finance.dto.ExpenseResponseDTO>>> getExpenses(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success( service.getTenantExpenses(pageable).map(this::enrichExpenseDTO) , "Expenses retrieved"));
    }

    @GetMapping("/worker/{workerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER') or hasRole('WORKER')")
    public ResponseEntity<ApiResponse<Page<com.workforce.os.modules.finance.dto.ExpenseResponseDTO>>> getWorkerExpenses(@PathVariable Long workerId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success( service.getWorkerExpenses(workerId, pageable).map(this::enrichExpenseDTO) , "Worker expenses retrieved"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<com.workforce.os.modules.finance.dto.ExpenseResponseDTO>> updateStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success( enrichExpenseDTO(service.updateStatus(id, request.getStatus())) , "Expense status updated"));
    }

    private com.workforce.os.modules.finance.dto.ExpenseResponseDTO enrichExpenseDTO(Expense expense) {
        var dto = mapper.toExpenseDTO(expense);
        if (expense.getWorkOrder() != null) {
            WorkOrder wo = workOrderRepository.findById(expense.getWorkOrder().getId()).orElse(null);
            if (wo != null && wo.getQuotation() != null && wo.getQuotation().getLead() != null && wo.getQuotation().getLead().getRequestedService() != null) {
                dto.setDescription(dto.getDescription() + " | Service: " + wo.getQuotation().getLead().getRequestedService().getName());
            }
        }
        return dto;
    }

    @Data
    public static class ExpenseRequest {
        private Long workOrderId;
        private Long workerId;
        private String category;
        private Double amount;
        private String description;
        private String receiptImageUrl;
    }

    @Data
    public static class StatusRequest {
        private Expense.ExpenseStatus status;
    }
}
