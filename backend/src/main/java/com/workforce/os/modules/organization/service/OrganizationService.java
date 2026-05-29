package com.workforce.os.modules.organization.service;

import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.common.util.MessageConstants;
import com.workforce.os.modules.organization.domain.Organization;
import com.workforce.os.modules.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationService {
    private final OrganizationRepository organizationRepository;

    @Transactional
    public Organization createOrganization(String businessName, String businessType, Long ownerId) {
        Organization organization = new Organization();
        organization.setBusinessName(businessName);
        organization.setBusinessType(businessType);
        organization.setOwnerId(ownerId);
        organization.setStatus(Organization.OrganizationStatus.ACTIVE);

        // Generate a tenant_id
        String tenantId = UUID.randomUUID().toString();
        organization.setTenantId(tenantId);

        return organizationRepository.save(organization);
    }

    @Transactional
    public Organization updateBranding(String tenantId, String logoUrl, String primaryColor, String secondaryColor) {
        Organization organization = organizationRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.ORGANIZATION_NOT_FOUND));

        organization.setLogoUrl(logoUrl);
        organization.setPrimaryColor(primaryColor);
        organization.setSecondaryColor(secondaryColor);

        return organizationRepository.save(organization);
    }

    @Transactional(readOnly = true)
    public Organization getBranding(String tenantId) {
        return organizationRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(MessageConstants.ORGANIZATION_NOT_FOUND));
    }
}
