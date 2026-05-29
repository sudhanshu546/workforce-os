package com.workforce.os.modules.customer.service;

import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.common.util.MessageConstants;
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
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.CUSTOMER_NOT_FOUND));
        CustomerProfile profile = customerProfileRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.CUSTOMER_PROFILE_NOT_FOUND));
        return customerProfileMapper.toCustomerProfileResponse(profile);
    }

    @Transactional
    public CustomerProfileResponse updateProfile(String email, CustomerProfileUpdateRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.CUSTOMER_NOT_FOUND));
        CustomerProfile profile = customerProfileRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.CUSTOMER_PROFILE_NOT_FOUND));

        customerProfileMapper.updateProfileFromRequest(request, profile);

        if (request.getPhone() != null) {
            customer.setPhone(request.getPhone());
            customerRepository.save(customer);
        }

        CustomerProfile savedProfile = customerProfileRepository.save(profile);
        return customerProfileMapper.toCustomerProfileResponse(savedProfile);
    }
}
