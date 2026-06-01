package com.workforce.os.modules.operations.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.dto.RouteOptimizationResponse;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RouteOptimizationService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkerProfileRepository workerProfileRepository;

    public RouteOptimizationResponse optimizeDailyRoute(Long workerId, LocalDate date) {
        String tenantId = TenantContext.getCurrentTenant();
        WorkerProfile worker = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));

        List<WorkOrder> jobs = workOrderRepository.findByTenantIdAndStatus(tenantId, WorkOrder.WorkOrderStatus.ASSIGNED)
                .stream()
                .filter(wo -> wo.getAssignedWorker() != null && wo.getAssignedWorker().getId().equals(workerId))
                .filter(wo -> wo.getScheduledDate().equals(date))
                .collect(Collectors.toList());

        if (jobs.isEmpty()) {
            return RouteOptimizationResponse.builder()
                    .workerId(workerId)
                    .workerName(worker.getUser().getName())
                    .date(date.toString())
                    .optimizedSequence(Collections.emptyList())
                    .optimizationSummary("No jobs assigned for this day.")
                    .build();
        }

        // Implementation of Nearest Neighbor Algorithm for Route Optimization (Traveling Salesman Problem)
        List<WorkOrder> unvisited = new ArrayList<>(jobs);
        List<WorkOrder> optimizedOrder = new ArrayList<>();
        
        // Start from an arbitrary point (or could be office location/last known location)
        WorkOrder current = unvisited.remove(0);
        optimizedOrder.add(current);

        double totalDistance = 0;
        
        while (!unvisited.isEmpty()) {
            WorkOrder finalCurrent = current;
            WorkOrder next = unvisited.stream()
                    .min(Comparator.comparingDouble(wo -> calculateDistance(
                            finalCurrent.getServiceAddress().getLatitude(),
                            finalCurrent.getServiceAddress().getLongitude(),
                            wo.getServiceAddress().getLatitude(),
                            wo.getServiceAddress().getLongitude()
                    )))
                    .get();
            
            unvisited.remove(next);
            totalDistance += calculateDistance(
                    current.getServiceAddress().getLatitude(),
                    current.getServiceAddress().getLongitude(),
                    next.getServiceAddress().getLatitude(),
                    next.getServiceAddress().getLongitude()
            );
            optimizedOrder.add(next);
            current = next;
        }

        List<RouteOptimizationResponse.OptimizedJob> sequence = new ArrayList<>();
        for (int i = 0; i < optimizedOrder.size(); i++) {
            WorkOrder wo = optimizedOrder.get(i);
            sequence.add(RouteOptimizationResponse.OptimizedJob.builder()
                    .workOrderId(wo.getId())
                    .customerName(wo.getCustomer().getName())
                    .address(wo.getServiceAddress().getStreet())
                    .sequenceOrder(i + 1)
                    .latitude(wo.getServiceAddress().getLatitude())
                    .longitude(wo.getServiceAddress().getLongitude())
                    .build());
        }

        return RouteOptimizationResponse.builder()
                .workerId(workerId)
                .workerName(worker.getUser().getName())
                .date(date.toString())
                .optimizedSequence(sequence)
                .totalDistanceKm(totalDistance / 1000.0)
                .totalTimeMinutes((totalDistance / 1000.0) * 2.5) // Estimate 2.5 mins per KM for traffic
                .optimizationSummary(String.format("Optimized %d jobs. Total estimated travel: %.1f km", jobs.size(), totalDistance / 1000.0))
                .build();
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000.0;
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double dPhi = Math.toRadians(lat2 - lat1);
        double dLambda = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
                   Math.cos(phi1) * Math.cos(phi2) *
                   Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}
