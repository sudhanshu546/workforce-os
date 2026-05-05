package com.workforce.os.modules.customer.repository;

import com.workforce.os.modules.customer.domain.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {
    List<CustomerAddress> findByCustomerId(Long customerId);
    Optional<CustomerAddress> findByCustomerIdAndIsDefaultTrue(Long customerId);
}
