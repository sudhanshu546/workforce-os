package com.workforce.os.modules.support.repository;

import com.workforce.os.modules.support.domain.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<SupportTicket> findByWorkOrderIdOrderByCreatedAtDesc(Long workOrderId);
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
}
