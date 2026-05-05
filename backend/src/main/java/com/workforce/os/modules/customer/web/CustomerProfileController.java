package com.workforce.os.modules.customer.web;

import com.workforce.os.modules.customer.dto.CustomerProfileResponse;
import com.workforce.os.modules.customer.dto.CustomerProfileUpdateRequest;
import com.workforce.os.modules.customer.service.CustomerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers/me")
@RequiredArgsConstructor
public class CustomerProfileController {

    private final CustomerProfileService customerProfileService;

    @GetMapping
    public ResponseEntity<CustomerProfileResponse> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(customerProfileService.getProfile(email));
    }

    @PutMapping
    public ResponseEntity<CustomerProfileResponse> updateProfile(@RequestBody CustomerProfileUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(customerProfileService.updateProfile(email, request));
    }
}
