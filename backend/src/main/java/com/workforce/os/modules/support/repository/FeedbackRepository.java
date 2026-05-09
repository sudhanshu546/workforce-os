package com.workforce.os.modules.support.repository;

import com.workforce.os.modules.support.domain.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByOrganizationId(Long organizationId);
}
