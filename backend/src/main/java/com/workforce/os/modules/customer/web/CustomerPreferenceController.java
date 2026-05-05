package com.workforce.os.modules.customer.web;

import com.workforce.os.modules.customer.dto.CustomerPreferenceResponse;
import com.workforce.os.modules.customer.dto.CustomerPreferenceUpdateRequest;
import com.workforce.os.modules.customer.service.CustomerPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers/me/preferences")
@RequiredArgsConstructor
public class CustomerPreferenceController {

    private final CustomerPreferenceService customerPreferenceService;

    @GetMapping
    public ResponseEntity<CustomerPreferenceResponse> getPreferences() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(customerPreferenceService.getPreferences(email));
    }

    @PutMapping
    public ResponseEntity<CustomerPreferenceResponse> updatePreferences(@RequestBody CustomerPreferenceUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return ResponseEntity.ok(customerPreferenceService.updatePreferences(email, request));
    }
}
