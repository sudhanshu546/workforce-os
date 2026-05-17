package com.workforce.os.modules.sales.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import com.workforce.os.modules.organization.repository.OrganizationRepository;
import com.workforce.os.modules.sales.domain.Lead;
import com.workforce.os.modules.sales.repository.LeadRepository;
import com.workforce.os.modules.service.repository.ServiceItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.workforce.os.modules.customer.domain.Customer.CustomerStatus.ACTIVE;
import static com.workforce.os.common.util.MessageConstants.*;

@Service
@RequiredArgsConstructor
public class LeadService {
    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final OrganizationRepository organizationRepository;
    private final ServiceItemRepository serviceItemRepository;

    @Transactional
    public Lead createLead(String customerName, String customerPhone, String customerEmail, Long organizationId, Long serviceItemId, String description, String priority) {
        // Use email for lookup if provided, otherwise fallback to phone, scoped by tenant
        var customer = (customerEmail != null && !customerEmail.isEmpty()) 
            ? customerRepository.findByEmailAndTenantId(customerEmail, TenantContext.getCurrentTenant())
                .orElseGet(() -> customerRepository.findByPhoneAndTenantId(customerPhone, TenantContext.getCurrentTenant()).orElse(null))
            : customerRepository.findByPhoneAndTenantId(customerPhone, TenantContext.getCurrentTenant()).orElse(null);

        if (customer == null) {
            customer = new Customer();
            customer.setName(customerName);
            customer.setPhone(customerPhone);
            customer.setEmail(customerEmail != null && !customerEmail.isEmpty() ? customerEmail : customerPhone + "@workforce-os.com"); 
            customer.setStatus(ACTIVE);
            customer.setTenantId(TenantContext.getCurrentTenant());
            customer = customerRepository.save(customer);
        }

        Lead lead = new Lead();
        lead.setCustomer(customer);
        
        var organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException(ORGANIZATION_NOT_FOUND));
        lead.setOrganization(organization);
        
        if (serviceItemId != null) {
            var serviceItem = serviceItemRepository.findById(serviceItemId)
                    .orElseThrow(() -> new RuntimeException(SERVICE_NOT_FOUND));
            lead.setRequestedService(serviceItem);
        }
        
        lead.setDescription(description);
        lead.setPriority(priority != null ? priority : "MEDIUM");
        lead.setStatus(Lead.LeadStatus.NEW);
        lead.setTenantId(organization.getTenantId());
        
        return leadRepository.save(lead);
    }

    @Transactional
    public Lead updateLead(Long id, String status, String priority, String description) {
        Lead lead = leadRepository.findById(id).orElseThrow();
        if (!lead.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new RuntimeException(UNAUTHORIZED);
        }
        if (status != null) lead.setStatus(Lead.LeadStatus.valueOf(status));
        if (priority != null) lead.setPriority(priority);
        if (description != null) lead.setDescription(description);
        return leadRepository.save(lead);
    }

    @Transactional
    public void deleteLead(Long id) {
        Lead lead = leadRepository.findById(id).orElseThrow();
        if (!lead.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new RuntimeException(UNAUTHORIZED);
        }
        leadRepository.delete(lead);
    }
}
