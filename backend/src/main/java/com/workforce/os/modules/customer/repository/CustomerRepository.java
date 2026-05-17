package com.workforce.os.modules.customer.repository;

import com.workforce.os.modules.customer.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findByEmailAndTenantId(String email, String tenantId);
    Optional<Customer> findByPhoneAndTenantId(String phone, String tenantId);
}
