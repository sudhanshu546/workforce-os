package com.workforce.os.modules.customer.service;

import com.workforce.os.common.exception.BusinessException;
import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.domain.CustomerRefreshToken;
import com.workforce.os.modules.customer.repository.CustomerRefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

import static com.workforce.os.common.util.MessageConstants.REFRESH_TOKEN_EXPIRED;

@Service
@RequiredArgsConstructor
public class CustomerRefreshTokenService {

    private final CustomerRefreshTokenRepository refreshTokenRepository;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    @Transactional
    public CustomerRefreshToken createRefreshToken(Customer customer) {
        refreshTokenRepository.deleteByCustomer(customer);
        CustomerRefreshToken refreshToken = new CustomerRefreshToken();
        refreshToken.setCustomer(customer);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpiration));
        refreshToken.setToken(UUID.randomUUID().toString());
        return refreshTokenRepository.save(refreshToken);
    }

    public CustomerRefreshToken verifyExpiration(CustomerRefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new BusinessException(REFRESH_TOKEN_EXPIRED);
        }
        return token;
    }

    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(refreshTokenRepository::delete);
    }
}
