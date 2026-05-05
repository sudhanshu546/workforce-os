package com.workforce.os.modules.workforce.repository;

import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.domain.WorkerSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerSkillRepository extends JpaRepository<WorkerSkill, Long> {
    List<WorkerSkill> findAllByWorker(WorkerProfile worker);
}
