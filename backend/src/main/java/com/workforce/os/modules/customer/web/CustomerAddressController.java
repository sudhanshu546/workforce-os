package com.workforce.os.modules.customer.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.customer.dto.CustomerAddressRequest;
import com.workforce.os.modules.customer.dto.CustomerAddressResponse;
import com.workforce.os.modules.customer.service.CustomerAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerAddressResponse>> addAddress(@RequestBody CustomerAddressRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        CustomerAddressResponse savedAddress = customerAddressService.addAddress(email, request);
        return ResponseEntity.created(URI.create("/api/v1/customers/me/addresses/" + savedAddress.getId()))
                .body(ApiResponse.success(savedAddress, "Address added successfully"));
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<CustomerAddressResponse>>> getAddresses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(customerAddressService.getAddresses(email), "Addresses retrieved successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerAddressResponse>> updateAddress(@PathVariable Long id, @RequestBody CustomerAddressRequest request) {
        return ResponseEntity.ok(ApiResponse.success(customerAddressService.updateAddress(id, request), "Address updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        customerAddressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Address deleted successfully"));
    }
}
