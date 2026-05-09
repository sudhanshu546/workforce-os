package com.workforce.os.modules.operations.repository;

import com.workforce.os.modules.operations.domain.WorkOrderMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkOrderMaterialRepository extends JpaRepository<WorkOrderMaterial, Long> {
}
