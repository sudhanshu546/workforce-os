package com.workforce.os.modules.identity.web;

import com.workforce.os.modules.identity.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;
    private final com.workforce.os.modules.identity.repository.UserRepository userRepository;
    private final com.workforce.os.modules.customer.repository.CustomerRepository customerRepository;
    private final com.workforce.os.modules.customer.repository.CustomerProfileRepository customerProfileRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        var principal = auth.getPrincipal();
        
        UserProfileResponse response = new UserProfileResponse();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
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
                            .orElseThrow(() -> new RuntimeException("Profile not found"));
                    response.setName(profile.getName());
                    response.setEmail(customer.getEmail());
                    response.setNumber(customer.getPhone());
                    response.setRole("CUSTOMER");
                }
            }
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register-organization")
    public ResponseEntity<AuthenticationResponse> registerOrganization(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(service.registerOrganization(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(
            @RequestBody String refreshToken
    ) {
        return ResponseEntity.ok(service.refreshToken(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody String refreshToken) {
        service.logout(refreshToken);
        return ResponseEntity.noContent().build();
    }
}
