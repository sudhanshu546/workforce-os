package com.workforce.os.modules.operations.repository;

import com.workforce.os.modules.operations.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByWorkOrderId(Long workOrderId);
    List<Review> findByWorkerId(Long workerId);
    List<Review> findByTenantId(String tenantId);
}
