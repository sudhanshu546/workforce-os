package com.workforce.os.modules.customer.service;

import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.domain.CustomerPreference;
import com.workforce.os.modules.customer.dto.CustomerPreferenceResponse;
import com.workforce.os.modules.customer.dto.CustomerPreferenceUpdateRequest;
import com.workforce.os.modules.customer.mapper.CustomerPreferenceMapper;
import com.workforce.os.modules.customer.repository.CustomerPreferenceRepository;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerPreferenceService {

    private final CustomerRepository customerRepository;
    private final CustomerPreferenceRepository customerPreferenceRepository;
    private final CustomerPreferenceMapper customerPreferenceMapper;

    public CustomerPreferenceResponse getPreferences(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        CustomerPreference preference = customerPreferenceRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new RuntimeException("Customer preferences not found"));
        return customerPreferenceMapper.toCustomerPreferenceResponse(preference);
    }

    @Transactional
    public CustomerPreferenceResponse updatePreferences(String email, CustomerPreferenceUpdateRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        CustomerPreference preference = customerPreferenceRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new RuntimeException("Customer preferences not found"));

        preference.setReceiveEmailNotifications(request.isReceiveEmailNotifications());
        preference.setPreferredContactMethod(request.getPreferredContactMethod());

        CustomerPreference saved = customerPreferenceRepository.save(preference);
        return customerPreferenceMapper.toCustomerPreferenceResponse(saved);
    }
}
