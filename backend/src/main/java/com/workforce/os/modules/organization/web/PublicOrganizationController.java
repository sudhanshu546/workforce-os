package com.workforce.os.modules.organization.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.organization.domain.Organization;
import com.workforce.os.modules.organization.dto.OrganizationDTO;
import com.workforce.os.modules.organization.mapper.OrganizationMapper;
import com.workforce.os.modules.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/public/organizations")
@RequiredArgsConstructor
public class PublicOrganizationController {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMapper organizationMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrganizationDTO>>> getAllOrganizations() {
        List<Organization> organizations = organizationRepository.findAll();
        List<OrganizationDTO> dtos = organizations.stream()
                .map(organizationMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "Organizations retrieved successfully"));
    }
}
