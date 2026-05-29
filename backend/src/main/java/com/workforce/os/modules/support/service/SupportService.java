package com.workforce.os.modules.support.service;

import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.identity.repository.UserRepository;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.support.domain.SupportTicket;
import com.workforce.os.modules.support.domain.TicketComment;
import com.workforce.os.modules.support.repository.SupportRepository;
import com.workforce.os.modules.support.repository.TicketCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportRepository supportRepository;
    private final TicketCommentRepository commentRepository;
    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;

    @Transactional
    public SupportTicket createTicket(Customer customer, Long workOrderId, String title, String description) {
        SupportTicket ticket = new SupportTicket();
        ticket.setCustomer(customer);
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setTenantId(customer.getTenantId());
        
        if (workOrderId != null) {
            WorkOrder wo = workOrderRepository.findByIdAndTenantId(workOrderId, customer.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found"));
            ticket.setWorkOrder(wo);
        }
        
        return supportRepository.save(ticket);
    }

    @Transactional
    public TicketComment addComment(Long ticketId, User user, String message) {
        SupportTicket ticket = supportRepository.findByIdAndTenantId(ticketId, user.getTenantId())
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
            
        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setMessage(message);
        comment.setTenantId(user.getTenantId());
        return commentRepository.save(comment);
    }

    @Transactional
    public SupportTicket updateTicketStatus(Long ticketId, SupportTicket.TicketStatus status) {
        SupportTicket ticket = supportRepository.findByIdAndTenantId(ticketId, com.workforce.os.common.context.TenantContext.getCurrentTenant())
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        ticket.setStatus(status);
        return supportRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<TicketComment> getTicketComments(Long ticketId) {
        // Verification step
        supportRepository.findByIdAndTenantId(ticketId, com.workforce.os.common.context.TenantContext.getCurrentTenant())
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    @Transactional(readOnly = true)
    public List<SupportTicket> getCustomerTickets(Long customerId) {
        return supportRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional(readOnly = true)
    public Page<SupportTicket> getCustomerTickets(Long customerId, Pageable pageable) {
        return supportRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);
    }

    @Transactional(readOnly = true)
    public List<SupportTicket> getAllTickets() {
        return supportRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Page<SupportTicket> getAllTickets(Pageable pageable) {
        return supportRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
