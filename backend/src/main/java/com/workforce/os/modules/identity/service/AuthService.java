package com.workforce.os.modules.identity.service;

import com.workforce.os.common.exception.BusinessException;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.identity.repository.RoleRepository;
import com.workforce.os.modules.identity.repository.UserRepository;
import com.workforce.os.modules.identity.web.AuthenticationRequest;
import com.workforce.os.modules.identity.web.AuthenticationResponse;
import com.workforce.os.modules.identity.web.RegisterRequest;
import com.workforce.os.modules.organization.service.OrganizationService;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.workforce.os.common.util.MessageConstants.*;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private final OrganizationService organizationService;
    private final WorkerProfileRepository workerProfileRepository;
    private final CustomerRepository customerRepository;

    private final RoleRepository roleRepository;

    @Transactional
    public AuthenticationResponse registerOrganization(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(EMAIL_EXISTS);
        }

        var user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(User.UserStatus.ACTIVE);

        // Assign OWNER role
        var ownerRole = roleRepository.findByName("OWNER")
                .orElseThrow(() -> new ResourceNotFoundException(DEFAULT_ROLE_NOT_FOUND));
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
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        Long workerId = null;
        Long customerId = null;
        if ("WORKER".equals(user.getRole().getName())) {
            workerId = workerProfileRepository.findByUserEmail(user.getEmail())
                    .map(profile -> profile.getId())
                    .orElse(null);
        } else if ("CUSTOMER".equals(user.getRole().getName())) {
            customerId = customerRepository.findByEmail(user.getEmail())
                    .map(c -> c.getId())
                    .orElse(null);
        }

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .role(user.getRole().getName())
                .workerId(workerId)
                .customerId(customerId)
                .build();
    }

    private final TokenBlacklistService tokenBlacklistService;

    @Transactional
    public void logout(String refreshToken, String authHeader) {
        // Blacklist Refresh Token
        long refreshExp = jwtService.extractExpiration(refreshToken).getTime() - System.currentTimeMillis();
        tokenBlacklistService.blacklistToken(refreshToken, refreshExp);

        // Blacklist Access Token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            long accessExp = jwtService.extractExpiration(accessToken).getTime() - System.currentTimeMillis();
            tokenBlacklistService.blacklistToken(accessToken, accessExp);
        }
    }

    @Transactional
    public AuthenticationResponse refreshToken(String token) {
        if (tokenBlacklistService.isBlacklisted(token)) {
            throw new BusinessException(INVALID_REFRESH_TOKEN);
        }

        final String userEmail = jwtService.extractUsername(token);
        if (userEmail != null) {
            var user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));

            if (jwtService.isTokenValid(token, user)) {
                // Blacklist old refresh token (Rotation)
                long exp = jwtService.extractExpiration(token).getTime() - System.currentTimeMillis();
                tokenBlacklistService.blacklistToken(token, exp);

                String accessToken = jwtService.generateToken(user);
                String newRefreshToken = jwtService.generateRefreshToken(user);

                Long workerId = null;
                if ("WORKER".equals(user.getRole().getName())) {
                    workerId = workerProfileRepository.findByUserEmail(user.getEmail())
                            .map(profile -> profile.getId())
                            .orElse(null);
                }

                return AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(newRefreshToken)
                        .role(user.getRole().getName())
                        .workerId(workerId)
                        .build();
            }
        }
        throw new BusinessException(INVALID_REFRESH_TOKEN);
    }
}
