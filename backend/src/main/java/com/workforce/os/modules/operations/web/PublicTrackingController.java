package com.workforce.os.modules.operations.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.customer.domain.CustomerAddress;
import com.workforce.os.modules.operations.domain.WorkOrder;
import com.workforce.os.modules.operations.repository.WorkOrderRepository;
import com.workforce.os.modules.workforce.domain.WorkerLocation;
import com.workforce.os.modules.workforce.repository.WorkerLocationRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/public/tracking")
@RequiredArgsConstructor
public class PublicTrackingController {

    private final WorkOrderRepository workOrderRepository;
    private final WorkerLocationRepository workerLocationRepository;

    @GetMapping("/{workOrderId}")
    public ResponseEntity<ApiResponse<TrackingInfo>> getTrackingInfo(@PathVariable Long workOrderId) {
        WorkOrder wo = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work Order not found"));

        Double lat = null;
        Double lon = null;
        String status = "UNASSIGNED";

        if (wo.getAssignedWorker() != null) {
            var location = workerLocationRepository.findLatestByWorkerIdAndTenantId(
                wo.getAssignedWorker().getId(), wo.getTenantId());
            
            if (location.isPresent() && location.get().getTimestamp().isAfter(LocalDateTime.now().minusMinutes(15))) {
                lat = location.get().getLatitude();
                lon = location.get().getLongitude();
                status = "ON_THE_WAY";
            }
        }

        Double destLat = null;
        Double destLon = null;

        // Use the specific service address linked to the work order
        if (wo.getServiceAddress() != null) {
            destLat = wo.getServiceAddress().getLatitude();
            destLon = wo.getServiceAddress().getLongitude();
        } else {
            // Fallback to customer default address if service address not explicitly set
            var address = wo.getCustomer().getAddresses().stream()
                .filter(com.workforce.os.modules.customer.domain.CustomerAddress::isDefault)
                .findFirst()
                .orElse(wo.getCustomer().getAddresses().isEmpty() ? null : wo.getCustomer().getAddresses().iterator().next());

            if (address != null) {
                destLat = address.getLatitude();
                destLon = address.getLongitude();
            }
        }

        TrackingInfo info = TrackingInfo.builder()
                .workOrderId(wo.getId())
                .customerName(wo.getCustomer() != null ? wo.getCustomer().getName() : "Unknown")
                .workerName(wo.getAssignedWorker() != null ? wo.getAssignedWorker().getUser().getName() : "Not yet assigned")
                .workerPhone(wo.getAssignedWorker() != null ? wo.getAssignedWorker().getUser().getPhone() : null)
                .workerRating(4.8)
                .workerExperience("3+ Years")
                .status(wo.getStatus().name())
                .trackingStatus(status)
                .latitude(lat)
                .longitude(lon)
                .destinationLatitude(destLat)
                .destinationLongitude(destLon)
                .build();

        return ResponseEntity.ok(ApiResponse.success(info, "Tracking info retrieved"));
    }

    @Data
    @Builder
    public static class TrackingInfo {
        private Long workOrderId;
        private String customerName;
        private String workerName;
        private String workerPhone;
        private Double workerRating;
        private String workerExperience;
        private String status;
        private String trackingStatus;
        private Double latitude;
        private Double longitude;
        private Double destinationLatitude;
        private Double destinationLongitude;
    }
}
