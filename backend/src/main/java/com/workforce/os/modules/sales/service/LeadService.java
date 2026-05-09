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

@Service
@RequiredArgsConstructor
public class LeadService {
    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final OrganizationRepository organizationRepository;
    private final ServiceItemRepository serviceItemRepository;

    @Transactional
    public Lead createLead(String customerName, String customerPhone, Long organizationId, Long serviceItemId, String description, String priority) {
        // Find or create customer
        var customer = customerRepository.findByPhone(customerPhone)
                .orElseGet(() -> {
                    var newCustomer = new Customer();
                    newCustomer.setName(customerName);
                    newCustomer.setPhone(customerPhone);
                    newCustomer.setStatus(ACTIVE);
                    return customerRepository.save(newCustomer);
                });

        Lead lead = new Lead();
        lead.setCustomer(customer);
        
        // Find organization
        var organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found with ID: " + organizationId));
        lead.setOrganization(organization);
        
        // Find service item
        if (serviceItemId != null) {
            var serviceItem = serviceItemRepository.findById(serviceItemId)
                    .orElseThrow(() -> new RuntimeException("Service not found with ID: " + serviceItemId));
            lead.setRequestedService(serviceItem);
        }
        
        lead.setDescription(description);
        lead.setPriority(priority != null ? priority : "MEDIUM");
        lead.setStatus(Lead.LeadStatus.NEW);
        
        // Ensure the lead belongs to the organization's tenant
        lead.setTenantId(organization.getTenantId());
        
        return leadRepository.save(lead);
    }

    @Transactional
    public Lead updateLead(Long id, String status, String priority, String description) {
        Lead lead = leadRepository.findById(id).orElseThrow();
        if (!lead.getTenantId().equals(TenantContext.getCurrentTenant())) {
            throw new RuntimeException("Unauthorized");
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
            throw new RuntimeException("Unauthorized");
        }
        leadRepository.delete(lead);
    }
}
