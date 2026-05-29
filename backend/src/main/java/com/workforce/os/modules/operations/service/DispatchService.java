package com.workforce.os.modules.operations.service;

import com.workforce.os.common.context.TenantContext;
import com.workforce.os.common.exception.ResourceNotFoundException;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.dto.WorkerRecommendation;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.service.domain.ServiceItem;
import com.workforce.os.modules.workforce.domain.WorkerLocation;
import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.repository.WorkerLocationRepository;
import com.workforce.os.modules.workforce.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import static com.workforce.os.common.util.MessageConstants.WORK_ORDER_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class DispatchService {

    private final WorkerProfileRepository workerProfileRepository;
    private final WorkerLocationRepository workerLocationRepository;
    private final WorkOrderRepository workOrderRepository;

    @Transactional(readOnly = true)
    public List<WorkerRecommendation> getSmartRecommendations(Long workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException(WORK_ORDER_NOT_FOUND));

        String tenantId = TenantContext.getCurrentTenant();
        List<WorkerProfile> allWorkers = workerProfileRepository.findAllByTenantId(tenantId);
        
        Double jobLat = workOrder.getServiceAddress() != null ? workOrder.getServiceAddress().getLatitude() : null;
        Double jobLon = workOrder.getServiceAddress() != null ? workOrder.getServiceAddress().getLongitude() : null;
        
        // Extract required service from quotation/lead
        ServiceItem requiredService = (workOrder.getQuotation() != null && 
                                      workOrder.getQuotation().getLead() != null) ? 
                                      workOrder.getQuotation().getLead().getRequestedService() : null;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        return allWorkers.stream()
                .filter(w -> w.getStatus() == WorkerProfile.WorkerStatus.ACTIVE)
                .map(worker -> {
                    boolean skillMatch = requiredService != null && 
                                        worker.getSupportedServices().contains(requiredService);
                    
                    Double distance = null;
                    String lastUpdated = "N/A";
                    var locationOpt = workerLocationRepository.findLatestByWorkerIdAndTenantId(worker.getId(), tenantId);
                    
                    if (locationOpt.isPresent()) {
                        WorkerLocation loc = locationOpt.get();
                        lastUpdated = loc.getTimestamp().format(formatter);
                        if (jobLat != null && jobLon != null && loc.getLatitude() != null && loc.getLongitude() != null) {
                            distance = calculateDistance(jobLat, jobLon, loc.getLatitude(), loc.getLongitude()) / 1000.0; // KM
                        }
                    }

                    // Score Calculation (Weighted: 60% Distance, 40% Skill)
                    double score = 0.0;
                    if (skillMatch) score += 0.4;
                    
                    if (distance != null) {
                        // Max distance for scoring: 50km
                        double distanceScore = Math.max(0, (50.0 - distance) / 50.0);
                        score += (distanceScore * 0.6);
                    }

                    return WorkerRecommendation.builder()
                            .workerId(worker.getId())
                            .name(worker.getUser().getName())
                            .designation(worker.getDesignation())
                            .distanceKm(distance)
                            .skillMatch(skillMatch)
                            .matchScore(score)
                            .lastUpdated(lastUpdated)
                            .build();
                })
                .sorted(Comparator.comparing(WorkerRecommendation::getMatchScore).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000.0; // Earth radius in meters
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
