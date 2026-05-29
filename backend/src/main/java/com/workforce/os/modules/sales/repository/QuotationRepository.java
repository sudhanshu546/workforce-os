package com.workforce.os.modules.sales.repository;

import com.workforce.os.modules.sales.domain.Quotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    @Query("SELECT q FROM Quotation q LEFT JOIN FETCH q.items WHERE q.tenantId = :tenantId")
    List<Quotation> findAllByTenantId(@Param("tenantId") String tenantId);

    @Query(value = "SELECT q FROM Quotation q LEFT JOIN FETCH q.items WHERE q.tenantId = :tenantId",
           countQuery = "SELECT count(q) FROM Quotation q WHERE q.tenantId = :tenantId")
    Page<Quotation> findByTenantId(@Param("tenantId") String tenantId, Pageable pageable);

    @Query("SELECT q FROM Quotation q LEFT JOIN FETCH q.items WHERE q.id = :id AND q.tenantId = :tenantId")
    Optional<Quotation> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") String tenantId);

    @Query("SELECT q FROM Quotation q LEFT JOIN FETCH q.items WHERE q.id = :id")
    Optional<Quotation> findById(@Param("id") Long id);

    @Query("SELECT q FROM Quotation q LEFT JOIN FETCH q.items WHERE q.lead.id = :leadId")
    Optional<Quotation> findByLeadId(@Param("leadId") Long leadId);
}
