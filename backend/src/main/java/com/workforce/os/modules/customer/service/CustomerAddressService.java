package com.workforce.os.modules.customer.service;

import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.domain.CustomerAddress;
import com.workforce.os.modules.customer.dto.CustomerAddressRequest;
import com.workforce.os.modules.customer.dto.CustomerAddressResponse;
import com.workforce.os.modules.customer.mapper.CustomerAddressMapper;
import com.workforce.os.modules.customer.repository.CustomerAddressRepository;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerAddressService {

    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final CustomerAddressMapper customerAddressMapper;

    @Transactional
    public CustomerAddressResponse addAddress(String email, CustomerAddressRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        CustomerAddress address = customerAddressMapper.toCustomerAddress(request);
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        address.setCustomer(customer);
        address.setTenantId(customer.getTenantId());

        if (customerAddressRepository.findByCustomerId(customer.getId()).isEmpty()) {
            address.setDefault(true);
        } else if (request.isDefault()) {
            customerAddressRepository.findByCustomerId(customer.getId()).forEach(a -> {
                if (a.isDefault()) {
                    a.setDefault(false);
                    customerAddressRepository.save(a);
                }
            });
        }

        CustomerAddress saved = customerAddressRepository.save(address);
        return customerAddressMapper.toCustomerAddressResponse(saved);
    }

    public List<CustomerAddressResponse> getAddresses(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return customerAddressRepository.findByCustomerId(customer.getId()).stream()
                .map(customerAddressMapper::toCustomerAddressResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerAddressResponse updateAddress(Long addressId, CustomerAddressRequest request) {
        CustomerAddress address = customerAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (request.isDefault()) {
            customerAddressRepository.findByCustomerId(address.getCustomer().getId()).forEach(a -> {
                if (a.isDefault() && !a.getId().equals(addressId)) {
                    a.setDefault(false);
                    customerAddressRepository.save(a);
                }
            });
            address.setDefault(true);
        }

        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());
        address.setCountry(request.getCountry());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());

        CustomerAddress saved = customerAddressRepository.save(address);
        return customerAddressMapper.toCustomerAddressResponse(saved);
    }

    @Transactional
    public void deleteAddress(Long addressId) {
        customerAddressRepository.deleteById(addressId);
    }
}
