package com.workforce.os.modules.notification.repository;

import com.workforce.os.modules.notification.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "customer"})
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "customer"})
    Page<Notification> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);
    
    long countByUserIdAndReadFalse(Long userId);
    long countByCustomerIdAndReadFalse(Long customerId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = ?1 AND n.read = false")
    void markAllAsReadForUser(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.customer.id = ?1 AND n.read = false")
    void markAllAsReadForCustomer(Long customerId);
}
