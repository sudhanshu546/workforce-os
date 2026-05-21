package com.workforce.os.modules.notification.service;

import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.identity.repository.UserRepository;
import com.workforce.os.modules.inventory.domain.Material;
import com.workforce.os.modules.notification.domain.Notification;
import com.workforce.os.modules.notification.repository.NotificationRepository;
import com.workforce.os.modules.operations.domain.WorkOrder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.workforce.os.common.util.MessageConstants.*;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final PushNotificationService pushNotificationService;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final MessagingService messagingService;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${application.base-url}")
    private String baseUrl;

    @Transactional
    public void createNotification(Long userId, String title, String body, String route, String tenantId) {
        User user = userRepository.findById(userId).orElseThrow();
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setRoute(route);
        notification.setTenantId(tenantId);
        notificationRepository.save(notification);

        // Notify via WebSocket for real-time UI bell update
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, "NEW_NOTIFICATION");
        
        // Also send push notification
        pushNotificationService.sendPush(userId, title, body, route);
    }

    @Transactional
    public void createCustomerNotification(com.workforce.os.modules.customer.domain.Customer customer, String title, String body, String route) {
        Notification notification = new Notification();
        notification.setCustomer(customer);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setRoute(route);
        notification.setTenantId(customer.getTenantId());
        notificationRepository.save(notification);

        // Notify via WebSocket for real-time UI bell update (Customer specific topic)
        messagingTemplate.convertAndSend("/topic/customer/notifications/" + customer.getId(), "NEW_NOTIFICATION");
        
        log.info("In-app notification created for customer: {}", customer.getEmail());
    }

    public void sendLowStockAlert(Material material) {
        String title = PUSH_LOW_STOCK_TITLE;
        String body = String.format(PUSH_LOW_STOCK_BODY, material.getName(), material.getQuantity());
        
        // Notify all Owners and Managers in this tenant
        List<User> managementUsers = userRepository.findByTenantIdAndRoleNameIn(
            material.getTenantId(), 
            Arrays.asList("OWNER", "MANAGER")
        );

        for (User manager : managementUsers) {
            createNotification(manager.getId(), title, body, ROUTE_INVENTORY, material.getTenantId());
        }
    }

    public void notifyNewJob(WorkOrder workOrder) {
        if (workOrder.getAssignedWorker() != null && workOrder.getAssignedWorker().getUser() != null) {
            Long userId = workOrder.getAssignedWorker().getUser().getId();
            String title = PUSH_NEW_JOB_TITLE;
            String body = String.format(PUSH_NEW_JOB_BODY, 
                workOrder.getCustomer().getName(), 
                workOrder.getScheduledDate());
            
            createNotification(userId, title, body, ROUTE_TASKS, workOrder.getTenantId());
        }
        
        // Notify Owners/Managers
        notifyManagementOfNewJob(workOrder);
    }

    private void notifyManagementOfNewJob(WorkOrder workOrder) {
        String title = "New Job Assigned";
        String body = String.format("Order #%d has been assigned to technician %s for customer %s", 
            (workOrder.getId() + 1000),
            workOrder.getAssignedWorker().getUser().getName(),
            workOrder.getCustomer().getName());

        List<User> managementUsers = userRepository.findByTenantIdAndRoleNameIn(
            workOrder.getTenantId(), 
            Arrays.asList("OWNER", "MANAGER")
        );

        for (User manager : managementUsers) {
            createNotification(manager.getId(), title, body, ROUTE_TASKS, workOrder.getTenantId());
        }
    }

    public void notifyJobVerified(WorkOrder workOrder) {
        if (workOrder.getAssignedWorker() != null && workOrder.getAssignedWorker().getUser() != null) {
            Long userId = workOrder.getAssignedWorker().getUser().getId();
            String title = PUSH_JOB_VERIFIED_TITLE;
            String body = String.format(PUSH_JOB_VERIFIED_BODY, (workOrder.getId() + 1000));
            
            createNotification(userId, title, body, ROUTE_TASKS, workOrder.getTenantId());
        }
    }
public void sendTrackingLink(WorkOrder workOrder) {
    if (workOrder.getCustomer() == null) return;

    String trackingUrl = baseUrl + "/track/" + workOrder.getId();
    String message;
    String title = NOTIFICATION_TRACKING_TITLE;

    if (workOrder.getStatus() == WorkOrder.WorkOrderStatus.ASSIGNED) {
        message = String.format(NOTIFICATION_TRACKING_BODY_ASSIGNED,
            workOrder.getAssignedWorker().getUser().getName(),
            trackingUrl);
    } else {
        message = String.format(NOTIFICATION_TRACKING_BODY_STARTED,
            workOrder.getAssignedWorker().getUser().getName(),
            trackingUrl);
    }

    // Create In-App Notification for Customer
    createCustomerNotification(workOrder.getCustomer(), title, message, "/track/" + workOrder.getId());

    // Also call the external service (which is now MOCKED/Disabled)
    messagingService.sendMessage(workOrder.getCustomer().getPhone(), message);
}

    public void sendInvoiceEmail(WorkOrder workOrder, String invoiceUrl) {
        if (workOrder.getCustomer() != null && workOrder.getCustomer().getEmail() != null) {
            String subject = "Invoice for Your Service - Order #" + (workOrder.getId() + 1000);
            String body = String.format(
                "<html><body>" +
                "<h2>Hello %s,</h2>" +
                "<p>Thank you for choosing our service. Your job has been completed and verified.</p>" +
                "<p>You can view and pay your invoice here: <a href='%s'>View Invoice</a></p>" +
                "<p>Best regards,<br/>The Workforce Team</p>" +
                "</body></html>",
                workOrder.getCustomer().getName(),
                invoiceUrl
            );
            
            emailService.sendEmail(workOrder.getCustomer().getEmail(), subject, body);
        }
    }
}
