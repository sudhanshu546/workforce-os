package com.workforce.os.modules.operations.repository;

import com.workforce.os.modules.operations.domain.WorkOrderTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkOrderTaskRepository extends JpaRepository<WorkOrderTask, Long> {
}
