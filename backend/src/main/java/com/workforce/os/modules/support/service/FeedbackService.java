package com.workforce.os.modules.support.service;

import com.workforce.os.modules.support.domain.Feedback;
import com.workforce.os.modules.support.repository.FeedbackRepository;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final WorkOrderRepository workOrderRepository;
    private final CustomerRepository customerRepository;

    public Feedback submitFeedback(Long workOrderId, Long customerId, Integer rating, String comments) {
        var workOrder = workOrderRepository.findById(workOrderId).orElseThrow();
        var customer = customerRepository.findById(customerId).orElseThrow();
        
        Feedback feedback = new Feedback();
        feedback.setWorkOrder(workOrder);
        feedback.setCustomer(customer);
        feedback.setOrganization(workOrder.getAssignedWorker().getOrganization()); // Assuming WO has access
        feedback.setRating(rating);
        feedback.setComments(comments);
        
        // Ensure the feedback belongs to the organization's tenant
        feedback.setTenantId(workOrder.getTenantId());
        
        return feedbackRepository.save(feedback);
    }
}
