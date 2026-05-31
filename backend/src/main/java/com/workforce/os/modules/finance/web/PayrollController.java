package com.workforce.os.modules.finance.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.finance.service.PayrollService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/finance/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;
    private final com.workforce.os.modules.finance.mapper.FinanceMapper financeMapper;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<com.workforce.os.modules.finance.dto.PayrollRecordDTO>> generate(@RequestBody PayrollGenerateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                financeMapper.toPayrollDTO(payrollService.generateMonthlyPayroll(request.getWorkerId(), request.getMonthYear())),
                PAYROLL_GENERATED
        ));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<com.workforce.os.modules.finance.dto.PayrollRecordDTO>>> getMonthly(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate monthYear) {
        return ResponseEntity.ok(ApiResponse.success(
                payrollService.getMonthlyPayroll(monthYear),
                PAYROLL_RETRIEVED
        ));
    }

    @GetMapping("/worker/{workerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<List<com.workforce.os.modules.finance.dto.PayrollRecordDTO>>> getWorkerHistory(@PathVariable Long workerId) {
        return ResponseEntity.ok(ApiResponse.success(
                payrollService.getWorkerHistory(workerId),
                WORKER_PAYROLL_RETRIEVED
        ));
    }

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> markAsPaid(@PathVariable Long id) {
        payrollService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.success(null, PAYROLL_PAID));
    }

    @Data
    public static class PayrollGenerateRequest {
        private Long workerId;
        private LocalDate monthYear;
    }
}
