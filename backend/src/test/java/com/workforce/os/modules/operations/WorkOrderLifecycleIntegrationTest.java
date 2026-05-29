package com.workforce.os.modules.operations;

import com.workforce.os.modules.customer.domain.Customer;
import com.workforce.os.modules.customer.repository.CustomerRepository;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class WorkOrderLifecycleIntegrationTest {

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private WorkerProfileRepository workerProfileRepository;

    @Test
    public void testFullWorkOrderLifecycle() {
        // 1. Create Data (Customer + Worker)
        Customer customer = new Customer();
        customer.setName("Test Customer");
        customer.setEmail("test@customer.com");
        customer.setPhone("1234567890");
        customer.setPassword("password123");
        customer.setTenantId("test-tenant");
        customerRepository.save(customer);

        WorkerProfile worker = new WorkerProfile();
        // Assume minimal setup
        worker.setTenantId("test-tenant");
        workerProfileRepository.save(worker);

        // 2. Create Order
        WorkOrder order = new WorkOrder();
        order.setCustomer(customer);
        order.setStatus(WorkOrder.WorkOrderStatus.PENDING_ASSIGNMENT);
        order.setTenantId("test-tenant");
        order = workOrderRepository.save(order);

        // 3. Assign
        order.setAssignedWorker(worker);
        order.setStatus(WorkOrder.WorkOrderStatus.ASSIGNED);
        workOrderRepository.save(order);

        // 4. Complete
        order.setStatus(WorkOrder.WorkOrderStatus.COMPLETED);
        workOrderRepository.save(order);

        // Verification
        WorkOrder updatedOrder = workOrderRepository.findById(order.getId()).orElseThrow();
        assertThat(updatedOrder.getStatus()).isEqualTo(WorkOrder.WorkOrderStatus.COMPLETED);
        assertThat(updatedOrder.getAssignedWorker()).isNotNull();
    }
}
