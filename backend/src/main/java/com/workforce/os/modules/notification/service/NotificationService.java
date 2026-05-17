package com.workforce.os.modules.notification.service;

import com.workforce.os.modules.identity.domain.User;
import com.workforce.os.modules.identity.repository.UserRepository;
import com.workforce.os.modules.inventory.domain.Material;
import com.workforce.os.modules.notification.domain.Notification;
import com.workforce.os.modules.notification.repository.NotificationRepository;
import com.workforce.os.modules.operations.domain.WorkOrder;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.workforce.os.common.util.MessageConstants.*;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final PushNotificationService pushNotificationService;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

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
    }

    public void notifyJobVerified(WorkOrder workOrder) {
        if (workOrder.getAssignedWorker() != null && workOrder.getAssignedWorker().getUser() != null) {
            Long userId = workOrder.getAssignedWorker().getUser().getId();
            String title = PUSH_JOB_VERIFIED_TITLE;
            String body = String.format(PUSH_JOB_VERIFIED_BODY, (workOrder.getId() + 1000));
            
            createNotification(userId, title, body, ROUTE_TASKS, workOrder.getTenantId());
        }
    }
}
