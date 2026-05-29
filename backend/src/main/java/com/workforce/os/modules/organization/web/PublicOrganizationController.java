package com.workforce.os.modules.organization.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.organization.domain.Organization;
import com.workforce.os.modules.organization.dto.OrganizationDTO;
import com.workforce.os.modules.organization.mapper.OrganizationMapper;
import com.workforce.os.modules.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.workforce.os.common.util.MessageConstants.ORGANIZATIONS_RETRIEVED;

@RestController
@RequestMapping("/api/v1/public/organizations")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class PublicOrganizationController {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMapper organizationMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrganizationDTO>>> getOrganizations(
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        log.info("Fetching public organizations. Search: {}, page: {}", searchTerm, pageable.getPageNumber());
        
        Page<Organization> orgs;
        if (searchTerm != null && !searchTerm.isEmpty()) {
            orgs = organizationRepository.findByBusinessNameContainingIgnoreCase(searchTerm, pageable);
        } else {
            orgs = organizationRepository.findAll(pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success(orgs.map(organizationMapper::toDTO), ORGANIZATIONS_RETRIEVED));
    }
}
