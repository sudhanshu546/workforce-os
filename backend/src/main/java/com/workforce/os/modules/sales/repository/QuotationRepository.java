package com.workforce.os.modules.sales.repository;

import com.workforce.os.modules.sales.domain.Quotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    List<Quotation> findAllByTenantId(String tenantId);
    Page<Quotation> findByTenantId(String tenantId, Pageable pageable);
}
