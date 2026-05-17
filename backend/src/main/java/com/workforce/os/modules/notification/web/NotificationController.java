package com.workforce.os.modules.notification.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.notification.domain.Notification;
import com.workforce.os.modules.notification.domain.PushSubscription;
import com.workforce.os.modules.notification.dto.SubscriptionRequest;
import com.workforce.os.modules.notification.repository.NotificationRepository;
import com.workforce.os.modules.notification.repository.PushSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final PushSubscriptionRepository subscriptionRepository;
    private final NotificationRepository notificationRepository;
    private final com.workforce.os.modules.notification.mapper.NotificationMapper notificationMapper;

    @PostMapping("/subscribe")
    public void subscribe(@RequestBody SubscriptionRequest request, @AuthenticationPrincipal UserDetails principal) {
        // ... (existing implementation)
    }

    @PostMapping("/unsubscribe")
    public void unsubscribe(@RequestBody String endpoint) {
        subscriptionRepository.deleteByEndpoint(endpoint);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<com.workforce.os.modules.notification.dto.NotificationResponseDTO>>> getNotifications(
            @AuthenticationPrincipal UserDetails principal,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Notification> notifications;
        if (principal instanceof User user) {
            notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        } else if (principal instanceof com.workforce.os.modules.customer.domain.Customer customer) {
            notifications = notificationRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId(), pageable);
        } else {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ApiResponse.success(notifications.map(notificationMapper::toDTO), "Notifications retrieved"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@AuthenticationPrincipal UserDetails principal) {
        long count = 0;
        if (principal instanceof User user) {
            count = notificationRepository.countByUserIdAndReadFalse(user.getId());
        } else if (principal instanceof com.workforce.os.modules.customer.domain.Customer customer) {
            count = notificationRepository.countByCustomerIdAndReadFalse(customer.getId());
        }
        return ResponseEntity.ok(ApiResponse.success(count, "Unread count retrieved"));
    }

    @PatchMapping("/mark-all-read")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal UserDetails principal) {
        if (principal instanceof User user) {
            notificationRepository.markAllAsReadForUser(user.getId());
        } else if (principal instanceof com.workforce.os.modules.customer.domain.Customer customer) {
            notificationRepository.markAllAsReadForCustomer(customer.getId());
        }
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        n.setRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok(ApiResponse.success( null , "Notification marked as read"));
    }
}
