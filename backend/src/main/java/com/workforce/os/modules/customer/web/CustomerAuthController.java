package com.workforce.os.modules.customer.web;

import com.workforce.os.modules.customer.dto.CustomerAuthResponse;
import com.workforce.os.modules.customer.dto.CustomerLoginRequest;
import com.workforce.os.modules.customer.dto.CustomerRegisterRequest;
import com.workforce.os.modules.customer.service.CustomerAuthService;
import com.workforce.os.modules.customer.service.CustomerRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/customers/auth")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerRegistrationService customerRegistrationService;
    private final CustomerAuthService customerAuthService;

    @PostMapping("/register")
    public ResponseEntity<CustomerAuthResponse> register(@RequestBody CustomerRegisterRequest request) {
        CustomerAuthResponse response = customerRegistrationService.registerCustomer(request);
        return ResponseEntity.created(URI.create("/api/v1/customers/me")).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<CustomerAuthResponse> login(@RequestBody CustomerLoginRequest request) {
        CustomerAuthResponse response = customerAuthService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody String refreshToken) {
        customerAuthService.logout(refreshToken);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<CustomerAuthResponse> refreshToken(@RequestBody String refreshToken) {
        return ResponseEntity.ok(customerAuthService.refreshToken(refreshToken));
    }
}
