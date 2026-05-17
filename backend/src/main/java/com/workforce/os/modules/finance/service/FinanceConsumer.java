package com.workforce.os.modules.finance.service;

import com.workforce.os.common.config.RabbitMQConfig;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.workforce.os.common.util.MessageConstants.WS_MSG_INVOICE_GENERATED;
import static com.workforce.os.common.util.MessageConstants.WS_TOPIC_ORDER_PREFIX;

@Service
@Slf4j
@RequiredArgsConstructor
public class FinanceConsumer {

    private final FinanceService financeService;
    private final WorkOrderRepository workOrderRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = RabbitMQConfig.INVOICE_QUEUE)
    @Transactional
    public void consumeInvoiceGeneration(InvoiceGenerationMessage message) {
        log.info("### RECEIVING MESSAGE FROM RABBITMQ: Work Order ID = {}", message.getWorkOrderId());
        try {
            WorkOrder workOrder = workOrderRepository.findById(message.getWorkOrderId())
                    .orElseThrow(() -> new RuntimeException("Work Order not found"));
            log.info("### Work Order found. Generating invoice...");
            financeService.generateInvoice(workOrder);
            
            // Notify frontend via WebSocket that invoice is ready
            messagingTemplate.convertAndSend(WS_TOPIC_ORDER_PREFIX + workOrder.getCustomer().getId(), 
                WS_MSG_INVOICE_GENERATED + workOrder.getId());
                
            log.info("### Successfully generated and notified invoice for Work Order ID: {}", message.getWorkOrderId());
        } catch (Exception e) {
            log.error("### CRITICAL: Failed to generate invoice for Work Order ID: {}", message.getWorkOrderId(), e);
        }
    }
}
