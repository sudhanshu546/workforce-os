package com.workforce.os.modules.identity.service;

import com.workforce.os.modules.identity.domain.RefreshToken;
import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.identity.repository.RefreshTokenRepository;
import com.workforce.os.modules.identity.repository.RoleRepository;
import com.workforce.os.modules.identity.repository.UserRepository;
import com.workforce.os.modules.identity.web.AuthenticationRequest;
import com.workforce.os.modules.identity.web.AuthenticationResponse;
import com.workforce.os.modules.identity.web.RegisterRequest;
import com.workforce.os.modules.organization.service.OrganizationService;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private final OrganizationService organizationService;
    private final WorkerProfileRepository workerProfileRepository;

    private final RoleRepository roleRepository;

    @Transactional
    public AuthenticationResponse registerOrganization(RegisterRequest request) {
        var user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(User.UserStatus.ACTIVE);
        
        // Assign OWNER role
        var ownerRole = roleRepository.findByName("OWNER")
                .orElseThrow(() -> new RuntimeException("Default role OWNER not found"));
        user.setRole(ownerRole);
        
        var savedUser = userRepository.save(user);
        
        // Create organization
        var organization = organizationService.createOrganization(
                request.getBusinessName(),
                request.getBusinessType(),
                savedUser.getId()
        );
        
        // Update user with tenantId
        savedUser.setTenantId(organization.getTenantId());
        userRepository.save(savedUser);

        var jwtToken = jwtService.generateToken(savedUser);
        var refreshToken = jwtService.generateRefreshToken(savedUser);
        
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .role(savedUser.getRole().getName())
                .build();
    }

    @Transactional
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        
        Long workerId = null;
        if ("WORKER".equals(user.getRole().getName())) {
            workerId = workerProfileRepository.findByUserEmail(user.getEmail())
                    .map(profile -> profile.getId())
                    .orElse(null);
        }

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .role(user.getRole().getName())
                .workerId(workerId)
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        // Since tokens are stateless and not in DB, logout on backend is a no-op 
        // unless we implement a blacklist. For now, we follow user's "no DB" rule.
    }

    public AuthenticationResponse refreshToken(String token) {
        final String userEmail = jwtService.extractUsername(token);
        if (userEmail != null) {
            var user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (jwtService.isTokenValid(token, user)) {
                String accessToken = jwtService.generateToken(user);
                
                Long workerId = null;
                if ("WORKER".equals(user.getRole().getName())) {
                    workerId = workerProfileRepository.findByUserEmail(user.getEmail())
                            .map(profile -> profile.getId())
                            .orElse(null);
                }

                return AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(token)
                        .role(user.getRole().getName())
                        .workerId(workerId)
                        .build();
            }
        }
        throw new RuntimeException("Invalid refresh token");
    }
}
