package com.workforce.os.modules.customer.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.customer.dto.CustomerAuthResponse;
import com.workforce.os.modules.customer.dto.CustomerLoginRequest;
import com.workforce.os.modules.customer.dto.CustomerRegisterRequest;
import com.workforce.os.modules.customer.service.CustomerAuthService;
import com.workforce.os.modules.customer.service.CustomerRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/customers/auth")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerRegistrationService customerRegistrationService;
    private final CustomerAuthService customerAuthService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<CustomerAuthResponse>> register(@RequestBody CustomerRegisterRequest request) {
        CustomerAuthResponse response = customerRegistrationService.registerCustomer(request);
        return ResponseEntity.created(URI.create("/api/v1/customers/me"))
                .body(ApiResponse.success(response, REGISTRATION_SUCCESS));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<CustomerAuthResponse>> login(@RequestBody CustomerLoginRequest request) {
        CustomerAuthResponse response = customerAuthService.authenticate(request);
        return ResponseEntity.ok(ApiResponse.success(response, LOGIN_SUCCESS));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody String refreshToken) {
        customerAuthService.logout(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(null, LOGOUT_SUCCESS));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<CustomerAuthResponse>> refreshToken(@RequestBody String refreshToken) {
        return ResponseEntity.ok(ApiResponse.success(customerAuthService.refreshToken(refreshToken), TOKEN_REFRESHED));
    }
}
