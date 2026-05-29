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

import jakarta.validation.Valid;
import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/customers/me/addresses")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class CustomerAddressController {

    private final CustomerAddressService customerAddressService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerAddressResponse>> addAddress(@Valid @RequestBody CustomerAddressRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        log.info("Adding address for customer: {}", email);
        CustomerAddressResponse savedAddress = customerAddressService.addAddress(email, request);
        return ResponseEntity.created(URI.create("/api/v1/customers/me/addresses/" + savedAddress.getId()))
                .body(ApiResponse.success(savedAddress, "Address added successfully"));
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<CustomerAddressResponse>>> getAddresses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        log.info("Fetching addresses for customer: {}", email);
        return ResponseEntity.ok(ApiResponse.success(customerAddressService.getAddresses(email), "Addresses retrieved successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerAddressResponse>> updateAddress(@PathVariable Long id, @Valid @RequestBody CustomerAddressRequest request) {
        log.info("Updating address ID: {}", id);
        return ResponseEntity.ok(ApiResponse.success(customerAddressService.updateAddress(id, request), "Address updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        log.info("Deleting address ID: {}", id);
        customerAddressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Address deleted successfully"));
    }
}
