package com.workforce.os.modules.customer.service;

import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.domain.CustomerProfile;
import com.workforce.os.modules.customer.dto.CustomerProfileResponse;
import com.workforce.os.modules.customer.dto.CustomerProfileUpdateRequest;
import com.workforce.os.modules.customer.mapper.CustomerProfileMapper;
import com.workforce.os.modules.customer.repository.CustomerProfileRepository;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerProfileService {

    private final CustomerRepository customerRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final CustomerProfileMapper customerProfileMapper;

    public CustomerProfileResponse getProfile(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        CustomerProfile profile = customerProfileRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
        return customerProfileMapper.toCustomerProfileResponse(profile);
    }

    @Transactional
    public CustomerProfileResponse updateProfile(String email, CustomerProfileUpdateRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        CustomerProfile profile = customerProfileRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));

        if (request.getName() != null) {
            profile.setName(request.getName());
        }
        
        if (request.getPhone() != null) {
            customer.setPhone(request.getPhone());
            customerRepository.save(customer);
        }
        
        CustomerProfile savedProfile = customerProfileRepository.save(profile);
        return customerProfileMapper.toCustomerProfileResponse(savedProfile);
    }
}
