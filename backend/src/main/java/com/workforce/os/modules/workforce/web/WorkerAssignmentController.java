package com.workforce.os.modules.workforce.web;

import com.workforce.os.modules.workforce.domain.WorkerProfile;
import com.workforce.os.modules.workforce.service.WorkerAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignment")
public class WorkerAssignmentController {

    @Autowired
    private WorkerAssignmentService assignmentService;

    @GetMapping("/eligible-workers")
    public ResponseEntity<List<WorkerProfile>> getEligibleWorkers(@RequestParam Long serviceId) {
        return ResponseEntity.ok(assignmentService.getEligibleWorkers(serviceId));
    }
}
