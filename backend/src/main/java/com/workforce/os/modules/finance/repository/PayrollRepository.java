package com.workforce.os.modules.finance.repository;

import com.workforce.os.modules.finance.domain.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<PayrollRecord, Long> {
    List<PayrollRecord> findByTenantIdAndMonthYear(String tenantId, LocalDate monthYear);
    Optional<PayrollRecord> findByWorkerIdAndMonthYear(Long workerId, LocalDate monthYear);
    List<PayrollRecord> findByWorkerIdOrderByMonthYearDesc(Long workerId);
}
