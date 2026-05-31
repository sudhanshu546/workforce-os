package com.workforce.os.modules.sales.service;

import com.workforce.os.common.service.BaseService;
import com.workforce.os.common.exception.BusinessException;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.common.util.MessageConstants;
import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.repository.CustomerAddressRepository;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import com.workforce.os.modules.finance.repository.InvoiceRepository;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.organization.repository.OrganizationRepository;
import com.workforce.os.modules.sales.domain.Lead;
import com.workforce.os.modules.sales.dto.LeadResponseDTO;
import com.workforce.os.modules.sales.mapper.LeadMapper;
import com.workforce.os.modules.sales.repository.LeadRepository;
import com.workforce.os.modules.sales.repository.QuotationRepository;
import com.workforce.os.modules.service.repository.ServiceItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.workforce.os.modules.customer.domain.Customer.CustomerStatus.ACTIVE;
import static com.workforce.os.common.util.MessageConstants.*;

@Service
@RequiredArgsConstructor
public class LeadService extends BaseService {
    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final OrganizationRepository organizationRepository;
    private final ServiceItemRepository serviceItemRepository;
    private final LeadMapper leadMapper;
    private final QuotationRepository quotationRepository;
    private final WorkOrderRepository workOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final com.workforce.os.modules.notification.service.NotificationService notificationService;

    @Transactional(readOnly = true)
    @Cacheable(value = "leads", key = "T(com.workforce.os.common.context.TenantContext).getCurrentTenant() + '-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<LeadResponseDTO> getLeads(Pageable pageable) {
         Page<Lead> leads = leadRepository.findByTenantId(getTenantId(), pageable);
        return leads.map(this::enrichDTO);
    }

    private LeadResponseDTO enrichDTO(Lead lead) {
        LeadResponseDTO dto = leadMapper.toDTO(lead);
        dto.setPreferredDate(lead.getPreferredDate());
        dto.setPreferredTime(lead.getPreferredTime());
        quotationRepository.findByLeadId(lead.getId()).ifPresent(q -> {
            dto.setQuotationId(q.getId());
            workOrderRepository.findByQuotationId(q.getId()).ifPresent(wo -> {
                dto.setWorkOrderId(wo.getId());
                dto.setWorkOrderStatus(wo.getStatus().toString());
                invoiceRepository.findByWorkOrderId(wo.getId()).ifPresent(inv -> {
                    dto.setInvoiceId(inv.getId());
                    dto.setInvoiceStatus(inv.getStatus().toString());
                    dto.setInvoiceAmount(inv.getTotal());
                });
            });
        });
        return dto;
    }

    @Transactional
    @CacheEvict(value = "leads", allEntries = true)
    public Lead createLead(String customerName, String customerPhone, String customerEmail,
                          Long organizationId, Long serviceItemId, Long customerAddressId,
                          String description, String priority, java.time.LocalDate preferredDate, java.time.LocalTime preferredTime) {
        // Use email for lookup if provided, otherwise fallback to phone, scoped by tenant
        var customer = (customerEmail != null && !customerEmail.isEmpty())
            ? customerRepository.findByEmailAndTenantId(customerEmail, getTenantId())
                .orElseGet(() -> customerRepository.findByPhoneAndTenantId(customerPhone, getTenantId()).orElse(null))
            : customerRepository.findByPhoneAndTenantId(customerPhone, getTenantId()).orElse(null);

        if (customer == null) {
            customer = new Customer();
            customer.setName(customerName);
            customer.setPhone(customerPhone);
            customer.setEmail(customerEmail != null && !customerEmail.isEmpty() ? customerEmail : customerPhone + "@workforce-os.com"); 
            customer.setStatus(ACTIVE);
            customer = customerRepository.save(customer);
        }

        Lead lead = new Lead();
        lead.setCustomer(customer);

        var organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException(ORGANIZATION_NOT_FOUND));
        lead.setOrganization(organization);

        if (serviceItemId != null) {
            var serviceItem = serviceItemRepository.findById(serviceItemId)
                    .orElseThrow(() -> new ResourceNotFoundException(SERVICE_NOT_FOUND));
            lead.setRequestedService(serviceItem);
        }

        if (customerAddressId != null) {
            var address = customerAddressRepository.findById(customerAddressId)
                    .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NOT_FOUND));
            lead.setCustomerAddress(address);
        }

        lead.setDescription(description);
        lead.setPreferredDate(preferredDate);
        lead.setPreferredTime(preferredTime);
        lead.setPriority(priority != null ? priority : "MEDIUM");
        lead.setStatus(Lead.LeadStatus.NEW);
        lead.setTenantId(organization.getTenantId());

        Lead saved = leadRepository.save(lead);
        notificationService.notifyManagementOfNewLead(saved);
        
        return saved;
    }

    @Transactional
    @CacheEvict(value = "leads", allEntries = true)
    public Lead updateLead(Long id, String status, String priority, String description) {
        Lead lead = leadRepository.findByIdAndTenantId(id, getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NOT_FOUND));
        if (status != null) lead.setStatus(Lead.LeadStatus.valueOf(status));
        if (priority != null) lead.setPriority(priority);
        if (description != null) lead.setDescription(description);
        return leadRepository.save(lead);
    }

    @Transactional
    @CacheEvict(value = "leads", allEntries = true)
    public void deleteLead(Long id) {
        Lead lead = leadRepository.findByIdAndTenantId(id, getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NOT_FOUND));
        leadRepository.delete(lead);
    }
}
