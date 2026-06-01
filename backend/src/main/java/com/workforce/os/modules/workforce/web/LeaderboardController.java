package com.workforce.os.modules.workforce.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.workforce.domain.WorkerStats;
import com.workforce.os.modules.workforce.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/workforce/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final GamificationService gamificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<List<WorkerStats>>> getLeaderboard() {
        return ResponseEntity.ok(ApiResponse.success(gamificationService.getLeaderboard(), LEADERBOARD_RETRIEVED));
    }

    @GetMapping("/stats/{workerId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'WORKER')")
    public ResponseEntity<ApiResponse<WorkerStats>> getWorkerStats(@PathVariable Long workerId) {
        return ResponseEntity.ok(ApiResponse.success(gamificationService.getWorkerStats(workerId), WORKER_STATS_RETRIEVED));
    }
}
