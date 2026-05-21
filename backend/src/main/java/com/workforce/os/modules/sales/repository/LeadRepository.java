package com.workforce.os.modules.sales.repository;

import com.workforce.os.modules.sales.domain.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findAllByTenantId(String tenantId);
    
    @Query("SELECT l FROM Lead l " +
           "LEFT JOIN FETCH l.customer " +
           "LEFT JOIN FETCH l.organization " +
           "LEFT JOIN FETCH l.requestedService " +
           "WHERE l.tenantId = :tenantId")
    Page<Lead> findByTenantId(@Param("tenantId") String tenantId, Pageable pageable);
    
    List<Lead> findByCustomerId(Long customerId);
    long countByTenantId(String tenantId);
}
