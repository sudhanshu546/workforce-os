package com.workforce.os.modules.customer.repository;

import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.domain.CustomerRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRefreshTokenRepository extends JpaRepository<CustomerRefreshToken, Long> {
    Optional<CustomerRefreshToken> findByToken(String token);
    void deleteByCustomer(Customer customer);
}
