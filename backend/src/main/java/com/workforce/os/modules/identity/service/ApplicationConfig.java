package com.workforce.os.modules.identity.service;

import com.workforce.os.modules.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static com.workforce.os.common.util.MessageConstants.USER_NOT_FOUND;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final com.workforce.os.modules.identity.repository.UserRepository userRepository;
    private final com.workforce.os.modules.customer.repository.CustomerRepository customerRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            // First check workforce users
            var user = userRepository.findByEmail(username);
            if (user.isPresent()) {
                return user.get();
            }
            // Then check customers
            var customer = customerRepository.findByEmail(username);
            if (customer.isPresent()) {
                return customer.get();
            }
            throw new UsernameNotFoundException(USER_NOT_FOUND);
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
