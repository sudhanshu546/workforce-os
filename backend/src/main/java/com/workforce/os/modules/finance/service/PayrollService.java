package com.workforce.os.modules.finance.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.common.util.MessageConstants;
import com.workforce.os.modules.finance.domain.Expense;
import com.workforce.os.modules.finance.domain.PayrollRecord;
import com.workforce.os.modules.finance.dto.PayrollRecordDTO;
import com.workforce.os.modules.finance.repository.ExpenseRepository;
import com.workforce.os.modules.finance.repository.PayrollRepository;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final ExpenseRepository expenseRepository;
    private final WorkerProfileRepository workerProfileRepository;

    @Transactional
    public PayrollRecord generateMonthlyPayroll(Long workerId, LocalDate monthYear) {
        // Normalize to first of month
        LocalDate periodStart = monthYear.withDayOfMonth(1);
        LocalDate periodEnd = monthYear.withDayOfMonth(periodStart.lengthOfMonth());

        LocalDateTime startDateTime = periodStart.atStartOfDay();
        LocalDateTime endDateTime = periodEnd.atTime(LocalTime.MAX);

        WorkerProfile worker = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.WORKER_NOT_FOUND));

        Double baseSalary = worker.getSalaryAmount() != null ? worker.getSalaryAmount() : 0.0;

        // Sum approved reimbursements
        Double approvedReimbursements = expenseRepository.sumApprovedExpensesByWorkerAndPeriod(workerId, startDateTime, endDateTime);   
        if (approvedReimbursements == null) approvedReimbursements = 0.0;

        // Check if already exists
        Optional<PayrollRecord> existing = payrollRepository.findByWorkerIdAndMonthYear(workerId, periodStart);

        PayrollRecord record = existing.orElse(new PayrollRecord());
        record.setWorker(worker);
        record.setMonthYear(periodStart);
        record.setBaseSalary(baseSalary);
        record.setApprovedReimbursements(approvedReimbursements);
        record.setPerformanceBonuses(0.0); // Manual for now or calculated later
        record.setDeductions(0.0);
        record.setTotalPayout(baseSalary + approvedReimbursements);
        record.setStatus(PayrollRecord.PayrollStatus.DRAFT);
        record.setTenantId(worker.getTenantId());

        return payrollRepository.save(record);
    }

    @Transactional
    public void markAsPaid(Long payrollId) {
        PayrollRecord record = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.RESOURCE_NOT_FOUND));

        record.setStatus(PayrollRecord.PayrollStatus.PAID);
        record.setPaidAt(LocalDateTime.now());

        // Mark expenses as REIMBURSED
        LocalDateTime start = record.getMonthYear().atStartOfDay();
        LocalDateTime end = record.getMonthYear().withDayOfMonth(record.getMonthYear().lengthOfMonth()).atTime(LocalTime.MAX);

        List<Expense> expenses = expenseRepository.findByWorkerIdAndStatusAndCreatedAtBetween(
                record.getWorker().getId(), Expense.ExpenseStatus.APPROVED, start, end);

        expenses.forEach(e -> e.setStatus(Expense.ExpenseStatus.REIMBURSED));
        expenseRepository.saveAll(expenses);

        payrollRepository.save(record);
    }

    @Transactional(readOnly = true)
    public List<PayrollRecordDTO> getMonthlyPayroll(LocalDate monthYear) {
        return payrollRepository.findByTenantIdAndMonthYear(TenantContext.getCurrentTenant(), monthYear.withDayOfMonth(1))
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PayrollRecordDTO> getWorkerHistory(Long workerId) {
        return payrollRepository.findByWorkerIdOrderByMonthYearDesc(workerId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private PayrollRecordDTO toDTO(PayrollRecord record) {
        return PayrollRecordDTO.builder()
                .id(record.getId())
                .workerName(record.getWorker() != null && record.getWorker().getUser() != null ? record.getWorker().getUser().getName() : "Unknown")
                .workerDesignation(record.getWorker() != null ? record.getWorker().getDesignation() : "")
                .monthYear(record.getMonthYear())
                .baseSalary(record.getBaseSalary())
                .approvedReimbursements(record.getApprovedReimbursements())
                .totalPayout(record.getTotalPayout())
                .status(record.getStatus().name())
                .build();
    }
}
