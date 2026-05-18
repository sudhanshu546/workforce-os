package com.workforce.os.modules.workforce.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.identity.repository.UserRepository;
import com.workforce.os.modules.workforce.dto.WorkerOnboardingRequest;
import com.workforce.os.modules.workforce.dto.WorkerProfileDTO;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class WorkerControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerProfileRepository workerProfileRepository;

    @Test
    public void onboardWorker_WithUnauthorizedUser_ShouldReturnForbidden() {
        WorkerOnboardingRequest request = new WorkerOnboardingRequest();
        request.setName("Test Worker");
        request.setEmail("test@example.com");
        request.setPhone("1234567890");
        request.setDesignation("Technician");
        request.setJoiningDate(LocalDate.now());

        // Attempt without authentication
        ResponseEntity<ApiResponse> response = restTemplate.postForEntity("/api/v1/workers/onboard", request, ApiResponse.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
