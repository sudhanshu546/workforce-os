package com.workforce.os.modules.customer.service;

import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;

    @Transactional
    public Customer registerCustomer(String name, String phone, String email, String tenantId) {
        Customer customer = new Customer();
        customer.setName(name);
        customer.setPhone(phone);
        customer.setEmail(email);
        customer.setStatus(Customer.CustomerStatus.ACTIVE);
        customer.setTenantId(tenantId);
        return customerRepository.save(customer);
    }
}
