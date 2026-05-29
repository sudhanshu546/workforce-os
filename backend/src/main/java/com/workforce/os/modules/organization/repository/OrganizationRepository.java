package com.workforce.os.modules.organization.repository;

import com.workforce.os.modules.organization.domain.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByTenantId(String tenantId);

    @Query("SELECT o FROM Organization o WHERE LOWER(o.businessName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Organization> findByBusinessNameContainingIgnoreCase(@Param("searchTerm") String searchTerm, Pageable pageable);
}
