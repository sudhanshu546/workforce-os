package com.workforce.os.modules.customer.repository;

import com.workforce.os.modules.customer.domain.CustomerPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerPreferenceRepository extends JpaRepository<CustomerPreference, Long> {
    Optional<CustomerPreference> findByCustomerId(Long customerId);
}
