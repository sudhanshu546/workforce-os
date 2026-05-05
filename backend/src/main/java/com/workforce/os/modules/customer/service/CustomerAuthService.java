package com.workforce.os.modules.customer.service;

import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.domain.CustomerProfile;
import com.workforce.os.modules.customer.dto.CustomerAuthResponse;
import com.workforce.os.modules.customer.dto.CustomerLoginRequest;
import com.workforce.os.modules.customer.dto.CustomerResponse;
import com.workforce.os.modules.customer.mapper.CustomerMapper;
import com.workforce.os.modules.customer.repository.CustomerProfileRepository;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import com.workforce.os.modules.identity.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomerMapper customerMapper;

    @Transactional
    public CustomerAuthResponse authenticate(CustomerLoginRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!customer.isEnabled()) {
            throw new RuntimeException("Customer account is not active");
        }

        String accessToken = jwtService.generateToken(customer);
        String refreshToken = jwtService.generateRefreshToken(customer);

        return CustomerAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role("CUSTOMER")
                .customerId(customer.getId())
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        // Stateless, no DB removal needed
    }

    public CustomerAuthResponse refreshToken(String token) {
        final String userEmail = jwtService.extractUsername(token);
        if (userEmail != null) {
            var customer = customerRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            
            if (jwtService.isTokenValid(token, customer)) {
                String accessToken = jwtService.generateToken(customer);
                return CustomerAuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(token)
                        .role("CUSTOMER")
                        .customerId(customer.getId())
                        .build();
            }
        }
        throw new RuntimeException("Invalid refresh token");
    }

    public CustomerResponse getCustomerResponse(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        CustomerProfile profile = customerProfileRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
        return customerMapper.toCustomerResponse(customer, profile);
    }
}
