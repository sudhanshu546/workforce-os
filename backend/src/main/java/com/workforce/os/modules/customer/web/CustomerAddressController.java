package com.workforce.os.modules.customer.web;

import com.workforce.os.modules.customer.dto.CustomerAddressRequest;
import com.workforce.os.modules.customer.dto.CustomerAddressResponse;
import com.workforce.os.modules.customer.service.CustomerAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/customers/me/addresses")
@RequiredArgsConstructor
public class CustomerAddressController {

    private final CustomerAddressService customerAddressService;

    @PostMapping
    public ResponseEntity<CustomerAddressResponse> addAddress(@RequestBody CustomerAddressRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        CustomerAddressResponse savedAddress = customerAddressService.addAddress(email, request);
        return ResponseEntity.created(URI.create("/api/v1/customers/me/addresses/" + savedAddress.getId())).body(savedAddress);
    }

    @GetMapping
    public ResponseEntity<List<CustomerAddressResponse>> getAddresses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(customerAddressService.getAddresses(email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerAddressResponse> updateAddress(@PathVariable Long id, @RequestBody CustomerAddressRequest request) {
        return ResponseEntity.ok(customerAddressService.updateAddress(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        customerAddressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }
}
