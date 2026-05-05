package com.workforce.os.modules.operations.repository;

import com.workforce.os.modules.operations.domain.WorkOrderEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkOrderEvidenceRepository extends JpaRepository<WorkOrderEvidence, Long> {
}
