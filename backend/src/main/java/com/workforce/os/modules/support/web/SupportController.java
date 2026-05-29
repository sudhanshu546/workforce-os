package com.workforce.os.modules.support.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.identity.repository.UserRepository;
import com.workforce.os.modules.support.domain.SupportTicket;
import com.workforce.os.modules.support.domain.TicketComment;
import com.workforce.os.modules.support.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import com.workforce.os.modules.support.dto.SupportTicketRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class SupportController {

    private final SupportService supportService;
    private final CustomerRepository customerRepository;

    @PostMapping("/tickets")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<SupportTicket>> createTicket(
            @Valid @RequestBody SupportTicketRequest request,
            @AuthenticationPrincipal User user) {
        log.info("Creating support ticket for user: {}", user.getEmail());

        // Find customer linked to this user
        Customer customer = customerRepository.findByEmail(user.getEmail())
            .orElseThrow(() -> new com.workforce.os.common.exception.ResourceNotFoundException(CUSTOMER_NOT_FOUND));

        return ResponseEntity.ok(ApiResponse.success(
            supportService.createTicket(customer, request.getWorkOrderId(), request.getTitle(), request.getDescription()),
            TICKET_CREATED
        ));
    }

    @GetMapping("/tickets")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<SupportTicket>>> getAllTickets(
            @AuthenticationPrincipal User user,
            Pageable pageable) {
        log.info("Fetching tickets for user: {}, page: {}", user.getEmail(), pageable.getPageNumber());
        
        if (user.getRole().getName().equals("CUSTOMER")) {
             Customer customer = customerRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(CUSTOMER_NOT_FOUND));
             return ResponseEntity.ok(ApiResponse.success(
                 supportService.getCustomerTickets(customer.getId(), pageable), 
                 TICKETS_RETRIEVED
             ));
        }

        return ResponseEntity.ok(ApiResponse.success(supportService.getAllTickets(pageable), TICKETS_RETRIEVED));
    }

    @PatchMapping("/tickets/{ticketId}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<SupportTicket>> updateTicketStatus(
            @PathVariable Long ticketId,
            @RequestBody Map<String, String> payload) {
        log.info("Updating status for ticket: {}", ticketId);
        
        SupportTicket.TicketStatus status = SupportTicket.TicketStatus.valueOf(payload.get("status"));
        return ResponseEntity.ok(ApiResponse.success(
            supportService.updateTicketStatus(ticketId, status),
            "Ticket status updated"
        ));
    }

    @GetMapping("/tickets/{ticketId}/comments")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<TicketComment>>> getTicketComments(@PathVariable Long ticketId) {
        log.info("Fetching comments for ticket: {}", ticketId);
        return ResponseEntity.ok(ApiResponse.success(
            supportService.getTicketComments(ticketId),
            "Comments retrieved"
        ));
    }

    @PostMapping("/tickets/{ticketId}/comments")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<TicketComment>> addComment(
            @PathVariable Long ticketId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User user) {
        log.info("Adding comment to ticket: {} by user: {}", ticketId, user.getEmail());
        
        return ResponseEntity.ok(ApiResponse.success(
            supportService.addComment(ticketId, user, payload.get("message")),
            COMMENT_ADDED
        ));
    }
}
