package com.workforce.os.modules.support.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.identity.repository.UserRepository;
import com.workforce.os.modules.support.domain.SupportTicket;
import com.workforce.os.modules.support.domain.TicketComment;
import com.workforce.os.modules.support.service.SupportService;
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

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;
    private final CustomerRepository customerRepository;

    @PostMapping("/tickets")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<SupportTicket>> createTicket(
            @RequestBody SupportTicketRequest request,
            @AuthenticationPrincipal User user) {

        // Find customer linked to this user
        Customer customer = customerRepository.findByEmail(user.getEmail())
            .orElseThrow(() -> new com.workforce.os.common.exception.ResourceNotFoundException("Customer account not found"));

        return ResponseEntity.ok(ApiResponse.success(
            supportService.createTicket(customer, request.getWorkOrderId(), request.getTitle(), request.getDescription()),
            "Ticket created successfully"
        ));
    }

    @GetMapping("/tickets")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success(supportService.getAllTickets(), "Tickets retrieved"));
    }

    @PatchMapping("/tickets/{ticketId}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<SupportTicket>> updateTicketStatus(
            @PathVariable Long ticketId,
            @RequestBody Map<String, String> payload) {
        
        SupportTicket.TicketStatus status = SupportTicket.TicketStatus.valueOf(payload.get("status"));
        return ResponseEntity.ok(ApiResponse.success(
            supportService.updateTicketStatus(ticketId, status),
            "Ticket status updated"
        ));
    }
}
