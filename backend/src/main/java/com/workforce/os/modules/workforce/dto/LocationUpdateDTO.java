package com.workforce.os.modules.workforce.dto;

import lombok.Data;

@Data
public class LocationUpdateDTO {
    private Double latitude;
    private Double longitude;
    private String status; // Optional: ON_JOB, IDLE
}
