package com.workforce.os.modules.customer.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.domain.CustomerProfile;
import com.workforce.os.modules.customer.domain.CustomerPreference;
import com.workforce.os.modules.customer.dto.CustomerRegisterRequest;
import com.workforce.os.modules.customer.dto.CustomerAuthResponse;
import com.workforce.os.modules.customer.mapper.CustomerMapper;
import com.workforce.os.modules.customer.repository.CustomerProfileRepository;
import com.workforce.os.modules.customer.repository.CustomerPreferenceRepository;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import com.workforce.os.modules.identity.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.workforce.os.common.util.MessageConstants.EMAIL_EXISTS;
import static com.workforce.os.common.util.MessageConstants.PHONE_EXISTS;

@Service
@RequiredArgsConstructor
public class CustomerRegistrationService {

    private final CustomerRepository customerRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final CustomerPreferenceRepository customerPreferenceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomerMapper customerMapper;

    @Transactional
    public CustomerAuthResponse registerCustomer(CustomerRegisterRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(EMAIL_EXISTS);
        }
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException(PHONE_EXISTS);
        }

        Customer customer = customerMapper.toCustomer(request);
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setTenantId(TenantContext.getCurrentTenant());
        Customer savedCustomer = customerRepository.save(customer);

        CustomerProfile profile = new CustomerProfile();
        profile.setCustomer(savedCustomer);
        profile.setName(request.getName());
        profile.setTenantId(savedCustomer.getTenantId());
        customerProfileRepository.save(profile);

        CustomerPreference preference = new CustomerPreference();
        preference.setCustomer(savedCustomer);
        preference.setReceiveEmailNotifications(true);
        preference.setPreferredContactMethod("EMAIL");
        preference.setTenantId(savedCustomer.getTenantId());
        customerPreferenceRepository.save(preference);

        String jwtToken = jwtService.generateToken(savedCustomer);
        String refreshToken = jwtService.generateRefreshToken(savedCustomer);

        return CustomerAuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .role("CUSTOMER")
                .customerId(savedCustomer.getId())
                .name(savedCustomer.getName())
                .email(savedCustomer.getEmail())
                .build();
    }
}
