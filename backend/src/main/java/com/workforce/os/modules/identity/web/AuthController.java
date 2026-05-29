package com.workforce.os.modules.identity.web;

import com.workforce.os.modules.customer.repository.CustomerProfileRepository;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import com.workforce.os.modules.identity.repository.UserRepository;
import com.workforce.os.modules.identity.service.AuthService;
import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.common.util.MessageConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AuthController {

    private final AuthService service;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final CustomerProfileRepository customerProfileRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = auth.getPrincipal();
        log.info("Fetching profile for principal: {}", principal);
        
        UserProfileResponse response = new UserProfileResponse();
        if (principal instanceof UserDetails userDetails) {
            String email = userDetails.getUsername();
            // Try to find the user in either workforce or customer modules
            var userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                var user = userOpt.get();
                response.setName(user.getName());
                response.setEmail(user.getEmail());
                response.setRole(user.getRole().getName());
                response.setNumber(user.getPhone());
            } else {
                var customerOpt = customerRepository.findByEmail(email);
                if (customerOpt.isPresent()) {
                    var customer = customerOpt.get();
                    // Need to fetch name from CustomerProfile
                    var profile = customerProfileRepository.findByCustomerId(customer.getId())
                            .orElseThrow(() -> new com.workforce.os.common.exception.ResourceNotFoundException(USER_PROFILE_NOT_FOUND));
                    response.setName(profile.getName());
                    response.setEmail(customer.getEmail());
                    response.setNumber(customer.getPhone());
                    response.setRole("CUSTOMER");
                }
            }
        }
        return ResponseEntity.ok(ApiResponse.success(response, PROFILE_RETRIEVED));
    }

    @PostMapping("/register-organization")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> registerOrganization(
            @Valid @RequestBody RegisterRequest request
    ) {
        log.info("Registering new organization: {}", request.getBusinessName());
        return ResponseEntity.ok(ApiResponse.success(service.registerOrganization(request), REGISTER_SUCCESS));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate(
            @Valid @RequestBody AuthenticationRequest request
    ) {
        log.info("Login attempt for email: {}", request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(service.authenticate(request), LOGIN_SUCCESS));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refreshToken(
            @RequestBody String refreshToken
    ) {
        log.info("Token refresh request received");
        return ResponseEntity.ok(ApiResponse.success(service.refreshToken(refreshToken), TOKEN_REFRESHED));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody String refreshToken, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Logout request received");
        service.logout(refreshToken, authHeader);
        return ResponseEntity.noContent().build();
    }
}
