package com.workforce.os.modules.finance.web;

import com.workforce.os.common.dto.ApiResponse;
import com.workforce.os.modules.finance.domain.TaxConfig;
import com.workforce.os.modules.finance.service.TaxService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.workforce.os.common.util.MessageConstants.*;

@RestController
@RequestMapping("/api/v1/finance/taxes")
@RequiredArgsConstructor
public class TaxController {

    private final TaxService taxService;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TaxConfig>>> getTaxes() {
        return ResponseEntity.ok(ApiResponse.success(taxService.getActiveConfigs(), TAX_CONFIGS_RETRIEVED));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<TaxConfig>> saveTax(@RequestBody TaxConfig config) {
        return ResponseEntity.ok(ApiResponse.success(taxService.saveConfig(config), TAX_CONFIG_SAVED));
    }
}
