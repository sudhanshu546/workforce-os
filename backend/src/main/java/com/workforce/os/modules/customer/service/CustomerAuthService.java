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

import static com.workforce.os.common.util.MessageConstants.*;

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
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException(INVALID_EMAIL_OR_PASSWORD));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            throw new org.springframework.security.authentication.BadCredentialsException(INVALID_EMAIL_OR_PASSWORD);
        }

        if (!customer.isEnabled()) {
            throw new RuntimeException(ACCOUNT_INACTIVE);
        }

        String accessToken = jwtService.generateToken(customer);
        String refreshToken = jwtService.generateRefreshToken(customer);

        return CustomerAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role("CUSTOMER")
                .customerId(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
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
                    .orElseThrow(() -> new RuntimeException(CUSTOMER_NOT_FOUND));
            
            if (jwtService.isTokenValid(token, customer)) {
                String accessToken = jwtService.generateToken(customer);
                return CustomerAuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(token)
                        .role("CUSTOMER")
                        .customerId(customer.getId())
                        .name(customer.getName())
                        .email(customer.getEmail())
                        .build();
            }
        }
        throw new RuntimeException(INVALID_REFRESH_TOKEN);
    }

    public CustomerResponse getCustomerResponse(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(CUSTOMER_NOT_FOUND));
        CustomerProfile profile = customerProfileRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new RuntimeException(CUSTOMER_PROFILE_NOT_FOUND));
        return customerMapper.toCustomerResponse(customer, profile);
    }
}
