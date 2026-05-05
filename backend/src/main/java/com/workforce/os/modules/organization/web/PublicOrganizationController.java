package com.workforce.os.modules.organization.web;

import com.workforce.os.modules.organization.domain.Organization;
import com.workforce.os.modules.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/organizations")
@RequiredArgsConstructor
public class PublicOrganizationController {

    private final OrganizationRepository organizationRepository;

    @GetMapping
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        // In a real scenario, we might want to filter by active status or paginate
        return ResponseEntity.ok(organizationRepository.findAll());
    }
}
