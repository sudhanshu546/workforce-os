package com.workforce.os.modules.sales.repository;

import com.workforce.os.modules.sales.domain.Quotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    @EntityGraph(attributePaths = {"items"})
    List<Quotation> findAllByTenantId(String tenantId);

    @EntityGraph(attributePaths = {"items"})
    Page<Quotation> findByTenantId(String tenantId, Pageable pageable);

    @EntityGraph(attributePaths = {"items"})
    Optional<Quotation> findById(Long id);

    @EntityGraph(attributePaths = {"items"})
    Optional<Quotation> findByLeadId(Long leadId);
}
