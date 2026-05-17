package com.workforce.os.modules.notification.repository;

import com.workforce.os.modules.notification.domain.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByUserId(Long userId);
    void deleteByEndpoint(String endpoint);
}
